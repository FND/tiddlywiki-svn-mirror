/***
|Name|specialUI|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

{{{
***/

(function($) {

  version.extensions.specialUI = {installed:true};

  // Dummy Macro so we can ensure a function will be run
  // after page has loaded (the init() function)
  var macro = config.macros.headlessMacro = {

    init: function() {
    }

  };

})(jQuery);

/*}}}*/
