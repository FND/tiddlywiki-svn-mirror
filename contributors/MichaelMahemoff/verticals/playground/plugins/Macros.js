(function($) {

  config.macros.newApp = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var macroParams = paramString.parseParams();
      var label = getParam(macroParams, "label") || "new app"
      invokeMacro(place, "newTiddler", 'label:"'+label+'" title:"New App" tag:"app" text: "'+store.getTiddlerText("DefaultApp")+'"');
    }
  }

})(jQuery);
