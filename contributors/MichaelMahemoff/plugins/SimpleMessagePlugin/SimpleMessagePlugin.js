/*
  SimpleMessagePlugin

*/

/***
|Name|SimpleMessagePlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

/*{{{*/
(function() {
if(!version.extensions.SimpleMessagePlugin) {

  version.extensions.SimpleMessagePlugin = {installed:true};
  version.extensions.SimpleMessagePlugin.delay = 1000;
  
  var timer;

  var _displayMessage = displayMessage;
  displayMessage = function() {
    if (timer) {
      timer=null;
      clearTimeout(timer);
    }
    timer = setTimeout(clearMessage, version.extensions.SimpleMessagePlugin.delay);
    _displayMessage.apply(this, arguments);
  }

  var _clearMessage = clearMessage;
  clearMessage = function() {
    clearTimeout(timer);
    return _clearMessage.apply(this, arguments);
  }

} // end of 'install only once'
})();
/*}}}*/
