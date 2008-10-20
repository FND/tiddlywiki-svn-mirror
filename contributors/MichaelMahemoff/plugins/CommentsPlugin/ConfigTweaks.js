//{{{
window.alert = function() { return null; }
window.confirm = function() { return null; }
readOnly = config.options.chkHttpReadOnly = false;
config.options.chkAutoSave = true;
var origRestart = restart;
restart = function() { origRestart(); document.body.onunload = function() {}; }
//}}}
