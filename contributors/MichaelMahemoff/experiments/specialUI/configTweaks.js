(function($) {

  readOnly = false; // for demo
  var customUIMode = false;

  config.macros.dummyIntialiser = {
    init: function() {
      if (jQuery("#"+story.containerId()).length) flip();
      else setTimeout(arguments.callee, 1000);
    }
  }

  function flip() { 
    customUIMode = !customUIMode;
    if (customUIMode) {
      story.switchTheme("fancyTheme");
      eval(store.getTiddlerText("fancyTheme##Code"));
    } else {
      $("#contentWrapper").empty();
      story.switchTheme(null);
    }
  }

  config.tasks.flip = {
    text: "flip",
    tooltip: "Flip between main interface and raw TiddlyWiki",
    action: flip
  };
  config.backstageTasks.push("flip");

})(jQuery);
