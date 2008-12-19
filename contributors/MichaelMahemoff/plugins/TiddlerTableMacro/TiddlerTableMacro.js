/*{{{*/
if(!version.extensions.TiddlerTableMacro) {

  version.extensions.TiddlerTableMacro = {installed:true};

  var macro = config.macros.tiddlerTable = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var macroParams = paramString.parseParams();
      var tiddlers =  store.filterTiddlers(getParam(macroParams, "filter"));
      console.log(tiddlers);
      var table = createTiddlyElement(place, "table", null, "tiddlerTable");
      
      /* Process Defaults - headings */
      headings = ["Tiddler", "Summary"];
      if (getParam(macroParams, "headings")) headings = getParam(macroParams, "headings").split(",");
      var row = createTiddlyElement(table, "tr");
      /* Show Headings */
      for (var colCount=0; colCount<headings.length; colCount++) {
        createTiddlyElement(row, "th", null, null, headings[colCount]);
      }

      /* Process Defaults - summaries */
      var defaultSummaryFuncs = [ "'[['+tiddler.title+']]'", "wikifyPlainText(tiddler.text,50) + '...'"];
      window.summary = {};
      for (var colCount=0; colCount<headings.length; colCount++) {
        var summaryFunc = (getParam(macroParams, "col"+(colCount+1))) || defaultSummaryFuncs[colCount];
        log("thefunc", colCount, summaryFunc);
        eval("window.summary["+colCount+"] = function(tiddler) { return "+summaryFunc+"; }");
      }

      /* Show Rows */
      for (var rowCount=0; rowCount<tiddlers.length; rowCount++) {
        row = createTiddlyElement(table, "tr");
        var tiddler = tiddlers[rowCount];
        for (var colCount=0; colCount<headings.length; colCount++) {
          var cell = createTiddlyElement(row, "td", null, null);
          log("boom", cell, tiddler, window.summary[colCount]+"");
          // cell.innerHTML = wikify(window.summary[colCount](tiddler)+"", cell);
          wikify(window.summary[colCount](tiddler)+"", cell);
        }
      }
    }
  } // end macro
} // end of 'install only once'
function log() { if (console) console.log.apply(console, arguments); }
/*}}}*/
