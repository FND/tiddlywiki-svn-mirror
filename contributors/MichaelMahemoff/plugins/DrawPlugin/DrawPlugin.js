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

  (function(plugin) {

  //################################################################################
  //# GENERIC UTILS
  //################################################################################

  plugin.log = function() {
    if (console) console.log.apply(console, arguments);
  }

  plugin.makeShadowsFromSlices = function(names) {
    for (var i=0; i<names.length; i++)
      config.shadowTiddlers[names[i]] = store.getTiddlerText(tiddler.title + "##" + names[i]);
  }

  config.macros.fieldCheckbox = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var field = params[0];
      var checkbox = createTiddlyElement(place, "input");
      checkbox.type = "checkbox";
      tiddler.fields[field] && tiddler.fields[field].toLowerCase()=="true" ?
        (checkbox.checked = true) : delete checkbox.checked;
      checkbox.onclick = checkbox.onchange = function() {
        tiddler.fields[field] = ""+(checkbox.checked);
        store.saveTiddler(tiddler.title);
        autoSaveChanges(false);
      }
    }
  }


  //################################################################################
  //# PLUGIN-SPECIFIC UTILS
  //################################################################################

  plugin.apiKey = function() {
    return encodeURIComponent(config.options.txtDrawingAPIKey);
  }

  //################################################################################
  //# INITIALISATION
  //################################################################################

  var options = config.options;

  if (!options.txtDrawingAPIKey || !options.txtDrawingAPIKey.trim().length)
    options.txtDrawingAPIKey = "hJHLNc3+mGtyo4HpMzZ78YwogWMEZXOY8XWizs2oBZcyTnh+d3F24w==";
    if (typeof(options.chkDrawingSVG)==="undefined") options.chkDrawingSVG = true;

  plugin.makeShadowsFromSlices(
    ["DrawingOptions", "DrawingViewTemplate", "DrawingEditTemplate", "DrawingStyleSheet"]);
  store.addNotification("DrawingStyleSheet", refreshStyles);

  // adapted from TaggedTemplateTweak
  // decided to copy and modify to avoid dependence
  var origChooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
  Story.prototype.chooseTemplateForTiddler = function(title,template) {
    // TODO FIX this
    origTemplate = origChooseTemplateForTiddler.apply(null, arguments);
    var tiddler = store.getTiddler(title);
    if (!tiddler) return origTemplate;
    if (tiddler.isTagged("Drawing")) {
      return (template==DEFAULT_EDIT_TEMPLATE) ? "DrawingEditTemplate" : "DrawingViewTemplate";
    }

    return origTemplate;
  };

  //################################################################################
  //# NEW DRAWING MACRO
  //################################################################################

  config.macros.newDrawing = {

    init: function() {
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var text = (paramString && paramString.trim().length) ? paramString : "New Drawing";
      var launcher = createTiddlyElement(place, "a", "", "newDrawing", text);
      launcher.onclick = function() {
        var loadingMessage = createTiddlyElement(place, "div", null, null, "Loading ...");
        var url = "http://draw.labs.autodesk.com/ADDraw/api/set/";
        var data = "API_KEY=" + plugin.apiKey() + "&BROWSER=IE";
        var xhr = httpReq("POST",url,config.macros.newDrawing.onStartSessionResponse,null,null,data);
        xhr.place = place;
        xhr.loadingMessage = loadingMessage;

        // $.post(url, data, onStartSessionResponse);
      };
      // launcher.onclick(); // for testing
   },

    onStartSessionResponse: function(status,params,responseText,url,xhr) {

      var sessionURL = responseText;
      var matches = sessionURL.match(/\?_a=(.*)&/);
      if (matches) {
        var sessionID = decodeURIComponent(matches[1]);
        window.open(sessionURL, "editor");

        var title = "New Drawing [" + sessionID + "]";
        // drawingTiddler.fields.sessionID = sessionID;
        // drawingTiddler.modifier = 
        // drawingTiddler.text = "<<drawing " + sessionID + ">>";
        // drawingTiddler.tags = ["drawing"];
        var drawingTiddler = store.saveTiddler(title, title, "", 
          config.options.txtUserName, new Date(),
          ["Drawing"], {sessionid: sessionID});
        drawingTiddler.fields.width = "300";
        drawingTiddler.fields.height = "400";
        drawingTiddler.fields.usesvg = "true";

        autoSaveChanges(false);
        // story.displayTiddler(DEFAULT_EDIT_TEMPLATE, drawingTiddler);
        config.macros.newDrawing.newestSessionID = sessionID;
        story.displayTiddler("top", drawingTiddler, DEFAULT_EDIT_TEMPLATE);
      } else {
        displayMessage("Cannot open drawing editor. Please try later.");
      }

      if (xhr.loadingMessage) {
        removeNode(xhr.loadingMessage);
        xhr.loadingMessage = null;
      }

    }
  }

  //################################################################################
  //# MACRO - DRAWING 
  //################################################################################

  var drawingMacro = config.macros.drawing = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      if (!place) return; // seems to execute in side menu
      var sessionID = paramString.trim().length ? paramString : tiddler.fields.sessionid;
      var data =    "API_KEY=" + plugin.apiKey() +
                    "&SESSIONID=" + encodeURIComponent(sessionID);
      // var usesvg = (tiddler.fields.usesvg.toLowerCase()=="true");
      if (drawingMacro.useSVG()) {
        var url = "http://draw.labs.autodesk.com/ADDraw/api/get/xml";
        var xhr = httpReq("POST",url,config.macros.drawing.onGetXMLResponse,null,null,data);
        xhr.place = place;
        xhr.tiddler = tiddler;
      } else {
        var image = createTiddlyElement(place, "img", "drawingImage")
        image.src = "http://draw.labs.autodesk.com/ADDraw/FileAndLogoProcessor?REQUEST_TYPE=LOAD_IMAGE&_a=" + encodeURIComponent(sessionID) + "&_o=" + plugin.apiKey();
        drawingMacro.clipDrawing(tiddler, image);
      }
    },

    onGetXMLResponse: function(status,params,responseText,url,xhr) {
      if (!xhr.place) return;
      // var container = createTiddlyElement(xhr.place, "div", null, null, null);
      // container.innerHTML = responseText;

      console.log(responseText);
      var drawingEl;
      if (drawingMacro.isIE()) {
        plugin.log("isIE - placing SVG directly");
        drawingEl = createTiddlyElement(xhr.place, "div", null, null, responseText);
      } else {
        plugin.log("is not IE - placing SVG in object element");
        drawingEl = document.createElement('object');
        drawingEl.setAttribute('type', 'image/svg+xml');
        drawingEl.setAttribute('data', 'data:image/svg+xml,'+ responseText);
        xhr.place.appendChild(drawingEl);
      }
      drawingMacro.clipDrawing(xhr.tiddler, drawingEl);
    },

    isIE: function() { return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent); },
    // isIE: function() { return false; },

    clipDrawing: function(tiddler, drawingEl) {
      drawingEl.style.width = tiddler.fields.width + "px";
      drawingEl.style.height = tiddler.fields.height + "px";
      drawingEl.style.overflow = "hidden";
    },

    useSVG: function() {
      return !drawingMacro.isIE() || drawingMacro.isASVInstalled();
    },

    isASVInstalled: function() {
      try {
         var asv = new ActiveXObject("Adobe.SVGCtl");
          return true;
      }
      catch(e){ }
      return false;
    }

  };

  //################################################################################
  //# MACRO - EDIT DRAWING
  //################################################################################

  plugin.editorCount=0;
  config.macros.editDrawing = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      if (!place) return; // seems to execute in side menu
      var sessionID = paramString.trim().length ? paramString : tiddler.fields.sessionid;
      var isNew = (sessionID == config.macros.newDrawing.newestSessionID);
      if (isNew) config.macros.newDrawing.newestSessionID=null;
      var sessionURL = "http://draw.labs.autodesk.com/ADDraw/api.html?" +
        "_a=" + encodeURIComponent(sessionID) +
        "&_o=" + plugin.apiKey();
      // window.open(sessionURL, "editor");
      createTiddlyElement(place, "div", "editDrawingInstructions", null, "To edit your drawing:");
      var instructions = createTiddlyElement(place, "ol");
      var launchStep = createTiddlyElement(instructions, "li", null, null);
      if (isNew) {
        createTiddlyElement(launchStep, "div", null, null, "Edit Drawing. (Enter the drawing editor and start editing. If the editor was not launched, please check your browser's popup window settings and ensure it's possible to popup a new window from TiddlyWiki.)");
      } else {
        var launcher = createTiddlyElement(launchStep, "a", null, "launchEditor", "Launch drawing editor.");
        launcher.onclick = function() { window.open(sessionURL, "editor"+plugin.editorCount); }
      }
      createTiddlyElement(instructions, "li", null, null,
        "Save drawing within editor. (Inside the drawing editor, choose Save from the File menu.)");
      createTiddlyElement(instructions, "li", null, null,
        "Save this tiddler (Click \"done\" above).");
      plugin.editorCount++;
    }
  };

  })(version.extensions.DrawPlugin);

//################################################################################
//# SHADOWS
//################################################################################

/***
!DrawingOptions

API Key: <<option txtDrawingAPIKey>>

Use SVG? <<option chkDrawingSVG>>
!(end of DrawingOptions)
***/


/***
!DrawingViewTemplate

<div class='toolbar' macro='toolbar [[ToolbarCommands::ViewToolbar]]'></div>
<div class='title' macro='view title'></div>
<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date'></span> (<span macro='message views.wikified.createdPrompt'></span> <span macro='view created date'></span>)</div>
<div class='drawing' macro='drawing'></div>

!(end of DrawingViewTemplate)
***/

/***
!DrawingEditTemplate

<div class='editDrawing'><div class='toolbar' macro='toolbar [[ToolbarCommands::EditToolbar]]'></div>
<div class='title' macro='view title'></div>
<div class='editor' macro='edit title'></div>
<div class='annotations'></div>
<div class='editDrawing' macro='editDrawing'></div>
<div>Width: <span class='drawingWidth' macro='edit width'></span> px</div>
<div>Height: <span class='drawingHeight' macro='edit height'></span> px</div>
<div style='display:none;'>Use SVG (instead of image)?: <span class='fieldCheckbox' macro='fieldCheckbox usesvg'></span></div>
<div class='editor tags' macro='edit tags'></div><div class='editorFooter'><span macro='message views.editor.tagPrompt'></span><span macro='tagChooser excludeLists'></span></div></div>

!(end of DrawingEditTemplate)

***/

/***
!DrawingStyleSheet

a.newDrawing { cursor: pointer; }
a.launchEdit { cursor: pointer; }
.editDrawing .annotations { margin-bottom: 2em; }
.editDrawing .tags { margin-top: 2em; }
.editDrawing a { cursor: pointer; }
.drawingWidth input, .drawingHeight input { width: 4em; text-align: right; }

!(end of DrawingStyleSheet)

***/

} // end of 'install only once'
/*}}}*/

