//{{{
readOnly = config.options.chkHttpReadOnly = false;
var origRestart = restart;
restart = function() { origRestart(); document.body.onunload = function() {}; }
//}}}
