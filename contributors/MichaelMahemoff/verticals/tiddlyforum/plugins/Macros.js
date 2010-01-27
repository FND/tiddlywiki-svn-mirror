(function($) {

  config.macros.newTopic = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $("<button/>")
      .html("new topic")
      .addClass("button")
      .click(function() {
        var macroParams = paramString.parseParams();
        // var topicTitle = "topic" + (new Guid()).generate();
        var topicTitle = "new topic";
        var tiddler = store.saveTiddler(topicTitle, topicTitle, "", config.options.txtUserName, new Date(), ["topic"], config.defaultCustomFields, false, new Date());
          saveChanges();
        story.displayTiddler("top", tiddler, DEFAULT_EDIT_TEMPLATE);
        $(".tiddler .editor input[type=text]").focus().select();
      })
      .appendTo(place);
    }
  }

  function log() { if (console && console.log) console.log.apply(console, arguments); }

})(jQuery);
