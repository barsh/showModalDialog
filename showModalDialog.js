(function () {
  window.spawn = window.spawn || function (gen) {
    function continuer(verb, arg) {
      var result;
      try {
        result = generator[verb](arg);
      } catch (err) {
        return Promise.reject(err);
      }
      if (result.done) {
        return result.value;
      } else {
        return Promise.resolve(result.value).then(onFulfilled, onRejected);
      }
    }
    var generator = gen();
    var onFulfilled = continuer.bind(continuer, 'next');
    var onRejected = continuer.bind(continuer, 'throw');
    return onFulfilled();
  };
  window.showModalDialog = window.showModalDialog || function (url, arg, opt) {
    $('<style> dialog::backdrop { background-color: rgba(0, 0, 0, 0.5); }</style>').appendTo('head');
    url = url || ''; //URL of a dialog
    arg = arg || null; //arguments to a dialog
    opt = opt || 'dialogWidth:300px;dialogHeight:200px'; //options: dialogTop;dialogLeft;dialogWidth;dialogHeight or CSS styles
    var caller = showModalDialog.caller.toString();
    var backdrop = document.body.appendChild(document.createElement('div'));
    var dialog = document.body.appendChild(document.createElement('dialog'));

    backdrop.style.position = 'fixed'
    backdrop.style.top ='0'
    backdrop.style.right ='0'
    backdrop.style.bottom ='0'
    backdrop.style.left ='0'
    backdrop.style.zIndex ='1040'
    backdrop.style.backgroundColor = '#000';
    backdrop.style.opacity = '.5';
    backdrop.addEventListener('click', function (e) {
      e.preventDefault();
      dialog.close();
      debugger
    });

    dialog.setAttribute('style', opt.replace(/dialog/gi, ''));
    dialog.style.margin = 'auto';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.top = '40px';
    dialog.style.position = 'absolute';
    dialog.style.padding = '0';
    dialog.style.border = '0';
    dialog.style.zIndex = '1050'
    dialog.innerHTML = '<a href="#" id="dialog-close" style="position: absolute; top: -37px; right: -25px; font-size: 28pt; font-weight: bold; color: #fff; text-decoration: none; outline: none;">&times;</a><iframe id="dialog-body" src="' + url + '" style="border: 0; width: 100%; height: 100%;"></iframe>';
    dialog.close = dialog.close || function () {
      dialog.dispatchEvent(new Event('close'))
      try { document.body.removeChild(backdrop) } catch(e) {}
      try { document.body.removeChild(dialog)} catch(e) {}
    }
    document.getElementById('dialog-body').contentWindow.dialogArguments = arg;
    document.getElementById('dialog-close').addEventListener('click', function (e) {
      e.preventDefault();
      dialog.close();
    });
    if (dialog.showModal) dialog.showModal();
    //if using yield
    if (caller.indexOf('yield') >= 0) {
      return new Promise(function (resolve, reject) {
        dialog.addEventListener('close', function () {
          var returnValue = document.getElementById('dialog-body').contentWindow.returnValue;
          document.body.removeChild(dialog);
          document.body.removeChild(backdrop)
          resolve(returnValue);
        });
      });
    }
    //if using eval
    var isNext = false;
    var nextStmts = caller.split('\n').filter(function (stmt) {
      if (isNext || stmt.indexOf('showModalDialog(') >= 0)
        return isNext = true;
      return false;
    });
    dialog.addEventListener('close', function () {
      var returnValue = document.getElementById('dialog-body').contentWindow.returnValue;
      document.body.removeChild(dialog);
      document.body.removeChild(backdrop)
      nextStmts[0] = nextStmts[0].replace(/(window\.)?showModalDialog\(.*\)/g, JSON.stringify(returnValue));
      eval('{\n' + nextStmts.join('\n'));
    });
    throw 'Execution stopped until showModalDialog is closed';
  };
})();
