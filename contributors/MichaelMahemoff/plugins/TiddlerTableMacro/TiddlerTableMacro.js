/*{{{*/
if(!version.extensions.TiddlerTableMacro) {

  version.extensions.TiddlerTableMacro = {installed:true};

  var macro = config.macros.tiddlerTable = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var macroParams = paramString.parseParams();
      var filter =  (getParam(macroParams, "filter")) ?  getParam(macroParams, "filter") : "";
      var tiddlers = store.filterTiddlers(filter);
      var table = createTiddlyElement(place, "table", null, "tiddlerTable");
      
      /* Process Defaults - headings */
      headings = ["Tiddler", "Summary"];
      if (getParam(macroParams, "headings")) headings = getParam(macroParams, "headings").split(",");
      var row = createTiddlyElement(table, "tr");

      /* Process Defaults - summaries */
      var summaryFuncs = [ "tiddler.title", "tiddler.text.substr(0,50)"];
      for (var colCount=0; colCount<headings.length; colCount++) {
        var summaryFunc = (getParam(macroParams, "col"+(colCount+1)));
        if (summaryFunc) summaryFuncs[colCount] = summaryFunc;
        log("show >"+colCount+">", summaryFunc, summaryFuncs, getParam(macroParams, "col2"));
      }

      /* Show Headings */
      for (var colCount=0; colCount<headings.length; colCount++) {
        createTiddlyElement(row, "th", null, null, headings[colCount]);
      }

      /* Show Rows */
      for (var rowCount=0; rowCount<tiddlers.length; rowCount++) {
        row = createTiddlyElement(table, "tr");
        var tiddler = tiddlers[rowCount];
        for (var colCount=0; colCount<headings.length; colCount++) {
          log(colCount, "evaling " + summaryFuncs[colCount], summaryFuncs);
          // createTiddlyElement(row, "td", null, null, eval(summaryFuncs[colCount]));
          var cell = createTiddlyElement(row, "td", null, null);
          wikify(eval(summaryFuncs[colCount])+"", cell);
        }
      }
    }
  } // end macro
} // end of 'install only once'
function log() { if (console) console.log.apply(console, arguments); }
/*}}}*/
