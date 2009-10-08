modifier: MichaelMahemoff
created: 200508181151
modified: 200609101232
tags: systemConfig

config.macros.countTagged = {
  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    var message = amount = store.getTaggedTiddlers(params[0]).length;
    var macroParams = paramString.parseParams();
    var messageFormat = getParam(macroParams, "message"+amount)
                        || getParam(macroParams, "message");
    if (messageFormat) message = messageFormat.replace("%s", amount);
    createTiddlyElement(place, "span", null, null, message);
  }
} 
