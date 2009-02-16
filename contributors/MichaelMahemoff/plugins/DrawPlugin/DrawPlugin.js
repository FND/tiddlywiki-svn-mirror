/***
|Name|CommentsPlugin|
|Description|Macro for nested comments, where each comment is a separate tiddler.|
|Source|http://tiddlyguv.org/CommentsPlugin.html#CommentsPlugin|
|Documentation|http://tiddlyguv.org/CommentsPlugin.html#CommentsPluginInfo|
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

Having problem at start due to no formatter for this very plugin, oddly.

***/

/*{{{*/

if(!version.extensions.DrawPlugin) {

  version.extensions.DrawPlugin = {installed:true};

config.macros.newDrawing = {};
(function(macro) {
  merge(macro, 
  {
    API_KEY: encodeURIComponent("hJHLNc3+mGtyo4HpMzZ78YwogWMEZXOY8XWizs2oBZcyTnh+d3F24w=="),

    init: function() {
      var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
      if (stylesheet) { // check necessary because it happens more than once for some reason
        config.shadowTiddlers["StyleSheetCommentsPlugin"] = stylesheet;
        store.addNotification("StyleSheetCommentsPlugin", refreshStyles);
      }
    },

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
      drawingTiddler.fields.width = "300";
      drawingTiddler.fields.height = "400";
      log("drawing", drawingTiddler);

      autoSaveChanges(false);
      // story.displayTiddler(DEFAULT_EDIT_TEMPLATE, drawingTiddler);
      console.log("displaying with edit template");
      macro.newestSessionID = sessionID;
      story.displayTiddler("top", drawingTiddler, DEFAULT_EDIT_TEMPLATE);

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
    xhr.tiddler = tiddler;
  }
};

var count=0;
config.macros.editDrawing = {
  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    if (!place) return; // seems to execute in side menu
    var sessionID = paramString.trim().length ? paramString : tiddler.fields.sessionid;
    console.log("newest Session ID", config.macros.newDrawing.newestSessionID);
    console.log("Session ID", sessionID);
    var isNew = (sessionID == config.macros.newDrawing.newestSessionID);
    console.log("isNew", isNew);
    if (isNew) config.macros.newDrawing.newestSessionID=null;
    var sessionURL = "http://draw.labs.autodesk.com/ADDraw/api.html?" +
      "_a=" + encodeURIComponent(sessionID) +
      "&_o=" + config.macros.newDrawing.API_KEY;
    window.open(sessionURL, "editor");
    createTiddlyElement(place, "div", "editDrawingInstructions", null, "To edit your drawing:");
    var instructions = createTiddlyElement(place, "ol");
    var launchStep = createTiddlyElement(instructions, "li", null, null);
    if (isNew) {
      createTiddlyElement(launchStep, "div", null, null, "Enter the drawing editor and start editing. If the editor was not launched, please check your browser's popup window settings and ensure it's possible to popup a new window from TiddlyWiki.");
    } else {
      var launcher = createTiddlyElement(launchStep, "a", null, null, "Launch the editor");
      launcher.onclick = function() { window.open(sessionURL, "editor"+count); }
      createTiddlyElement(launchStep, "span", null, null, 
        " in a popup window, if your drawing is not already open.");
    }
    createTiddlyElement(instructions, "li", null, null,
      "In the drawing editor, choose Save from the File menu. PLEASE DON'T FORGET THIS STEP - You must save your drawing inside Project Draw for it to show inside TiddlyWiki.");
    createTiddlyElement(instructions, "li", null, null,
      "Click \"done\" in the toolbar above this tiddler.");
    // var launcher = createTiddlyElement(place, "button", null, null, "launch editor");
    // launcher.onclick = function() { window.open(sessionURL, "editor"+count); }
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
  svgObject.style.width = xhr.tiddler.width + "px";
  svgObject.style.height = xhr.tiddler.height + "px";
  svgObject.style.display = "overflow: none";
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

if (!store.getTiddler("drawingEditTemplate")) {
  var drawingEditTemplate = store.createTiddler("drawingEditTemplate");
  drawingEditTemplate.text = "<div class='editDrawing'><div class='toolbar' macro='toolbar [[ToolbarCommands::EditToolbar]]'></div>" +
    "<div class='title' macro='view title'></div>" +
    "<div class='editor' macro='edit title'></div>" +
    "<div class='annotations'></div>" +
    "<div class='editDrawing' macro='editDrawing'></div>" +
    "<div>Width: <span class='drawingWidth' macro='edit width'></span> px</div>" +
    "<div>Height: <div class='drawingHeight' macro='edit height'></div></div>" +
    "<div class='editor tags' macro='edit tags'></div><div class='editorFooter'><span macro='message views.editor.tagPrompt'></span><span macro='tagChooser excludeLists'></span></div></div>";
  store.saveTiddler("drawingEditTemplate");
}

/* TODO
if (!store.getTiddler("apiKey")) {
  var apiKey = store.createTiddler("apiKey");
  apiKey.text = "hJHLNc3+mGtyo4HpMzZ78YwogWMEZXOY8XWizs2oBZcyTnh+d3F24w==";
  store.saveTiddler(apiKey);
}
*/

autoSaveChanges(false);

var origHandler = config.commands.editTiddler.handler;
config.commands.editTiddler.handler = function() {
  origHandler.apply(null, arguments);
}

function log() { if (console) console.log.apply(console, arguments); }

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet

.editDrawing .annotations { margin-bottom: 2em; }
.editDrawing .tags { margin-top: 2em; }
.editDrawing a { cursor: pointer; }
.drawingWidth input, .drawingHeight input { width: 4em; text-align: right; }

!(end of StyleSheet)

***/

} // end of 'install only once'
/*}}}*/

