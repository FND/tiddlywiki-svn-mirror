readOnly = false;

config.macros.dummyIntialiser = {
  init: function() {
    if (jQuery("#"+story.containerId()).length) story.switchTheme("fancyTheme");
    else setTimeout(arguments.callee, 1000);
  }
}
