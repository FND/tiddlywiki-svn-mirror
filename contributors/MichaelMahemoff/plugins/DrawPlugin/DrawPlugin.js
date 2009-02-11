config.macros.newDrawing = {};
(function(macro) {
  merge(macro, 
  {
    API_KEY: encodeURIComponent("hJHLNc3+mGtyo4HpMzZ78YwogWMEZXOY8XWizs2oBZcyTnh+d3F24w=="),

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var launcher = createTiddlyElement(place, "button", null, null, "Draw");
      launcher.onclick = function() {
        var loadingMessage = createTiddlyElement(place, "div", null, null, "Loading ...");
        var url = "http://draw.labs.autodesk.com/ADDraw/api/set/";
        var data = "API_KEY=" + macro.API_KEY + "&BROWSER=IE";
        var xhr = httpReq("POST",url,macro.onStartSessionResponse,null,null,data);
        xhr.place = place;
        xhr.loadingMessage = loadingMessage;

        // $.post(url, data, onStartSessionResponse);
      };
      // launcher.onclick(); // for testing
   },

    onStartSessionResponse: function(status,params,responseText,url,xhr) {

      var sessionURL = responseText;
      var matches = sessionURL.match(/\?_a=(.*)&/);
      var sessionID = decodeURIComponent(matches[1]);
      window.open(sessionURL, "editor");

      var title = "New Drawing [" + sessionID + "]";
      /*
      drawingTiddler.fields.sessionID = sessionID;
      drawingTiddler.modifier = 
      drawingTiddler.text = "<<drawing " + sessionID + ">>";
      drawingTiddler.tags = ["drawing"];
      */
      var drawingTiddler = store.saveTiddler(title, title, "", 
        config.options.txtUserName, new Date(),
        ["drawing"], {sessionid: sessionID});
      log("drawing", drawingTiddler);

      autoSaveChanges(false);
      story.displayTiddler(null, drawingTiddler);

/*
      if (xhr.loadingMessage) {
        // removeNode(xhr.loadingMessage);
        xhr.place.removeChild(xhr.loadingMessage);
        xhr.loadingMessage = null;
      }
*/

    }
  });

})(config.macros.newDrawing);

config.macros.drawing = {
  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    if (!place) return; // seems to execute in side menu
    var sessionID = paramString.trim().length ? paramString : tiddler.fields.sessionid;
    console.log("macro says tiddler", tiddler, "sessionID", sessionID, "--", paramString, "--", tiddler.fields.sessionID);
    var data =    "API_KEY=" + config.macros.newDrawing.API_KEY +
                  "&SESSIONID=" + encodeURIComponent(sessionID);
    var url = "http://draw.labs.autodesk.com/ADDraw/api/get/xml/";
    var xhr = httpReq("POST",url,onGetXMLResponse,null,null,data);
    xhr.place = place;
  }
};

var count=0;
config.macros.editDrawing = {
  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    if (!place) return; // seems to execute in side menu
    var sessionID = paramString.trim().length ? paramString : tiddler.fields.sessionid;
    console.log("macro says tiddler", tiddler, "sessionID", sessionID, "--", paramString, "--", tiddler.fields.sessionid);
    var sessionURL = "http://draw.labs.autodesk.com/ADDraw/api.html?" +
      "_a=" + encodeURIComponent(sessionID) +
      "_o=" + config.macros.newDrawing.API_KEY;
    window.open(sessionURL, "editor");
    var launcher = createTiddlyElement(place, "button", null, null, "launch editor");
    launcher.onclick = function() { window.open(sessionURL, "editor"+count); }
    count++;
  }
};

onGetXMLResponse = function(status,params,responseText,url,xhr) {
  console.log("getXML:", arguments);
  if (!xhr.place) return;
  // var container = createTiddlyElement(xhr.place, "div", null, null, null);
  // container.innerHTML = responseText;

  var svgObject = document.createElement('object');
  svgObject.setAttribute('type', 'image/svg+xml');
  svgObject.setAttribute('data', 'data:image/svg+xml,'+ responseText);
  xhr.place.appendChild(svgObject);
  return;
};

// adapted from TaggedTemplateTweak
// decided to copy and modify to avoid dependence
config.macros.newDrawing.origChooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
Story.prototype.chooseTemplateForTiddler = function(title,template) {
  // TODO FIX this
  log("chooseTemplateForTiddler", arguments);
  origTemplate = config.macros.newDrawing.origChooseTemplateForTiddler.apply(null, arguments);
  var tiddler = store.getTiddler(title);
  if (!tiddler) return origTemplate;
  if (tiddler.isTagged("drawing")) {
    return (template==DEFAULT_EDIT_TEMPLATE) ? "drawingEditTemplate" : "drawingViewTemplate";
  }
  console.log("rtrning orig templaste", origTemplate);
  return origTemplate;
};

if (!store.getTiddler("drawingViewTemplate")) {
  var drawingViewTemplate = store.createTiddler("drawingViewTemplate");
  drawingViewTemplate.text = "<div class='toolbar' macro='toolbar [[ToolbarCommands::ViewToolbar]]'></div>" +
    "<div class='title' macro='view title'></div>" +
    "<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date'></span> (<span macro='message views.wikified.createdPrompt'></span> <span macro='view created date'></span>)</div>" +
    "<div class='drawing' macro='drawing'></div>"; 
  store.saveTiddler("drawingViewTemplate");
}
autoSaveChanges(false);

if (!store.getTiddler("drawingEditTemplate")) {
  var drawingEditTemplate = store.createTiddler("drawingEditTemplate");
  drawingEditTemplate.text = "<div class='toolbar' macro='toolbar [[ToolbarCommands::EditToolbar]]'></div>" +
    "<div class='title' macro='Edit title'></div>" +
    "<div class='subtitle'><span macro='Edit modifier link'></span>, <span macro='Edit modified date'></span> (<span macro='message Edits.wikified.createdPrompt'></span> <span macro='Edit created date'></span>)</div>" +
    "<div class='drawing' macro='editDrawing'></div>"; 
  store.saveTiddler("drawingEditTemplate");
}

function log() { if (console) console.log.apply(console, arguments); }
