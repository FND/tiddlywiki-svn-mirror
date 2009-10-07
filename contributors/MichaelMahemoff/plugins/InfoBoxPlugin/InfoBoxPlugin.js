/***
|Name|InfoBoxPlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

/*{{{*/
(function() {

  if(version.extensions.InfoBoxPlugin) return;

  var plugin = version.extensions.InfoBoxPlugin = {installed:true};
  var $=jQuery;
  applyStyleSheet();

  var macro = config.macros.infoBox = {

    //================================================================================
    // MACRO INITIALISATION
    //================================================================================

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var boxEl = $("<div class='infoBox'/>")
        .css("marginRight", $(place).parents(".tiddler").find(".tagged").width()+30)
        .appendTo(place);
      var type = trim(paramString);
      if (!trim(type).length) {
        wikifier.subWikify(boxEl.get(0), ">>");
        return;
      }

      var headingEl = $("<h3/>").html(type).appendTo(boxEl);
      var messageEl = $("<div/>").appendTo(boxEl);
      $(wikifier.subWikify(messageEl.get(0), ">>"));
      var typeDefinitionTiddler = store.getTiddler(type+"InfoBox"); 
      if (!typeDefinitionTiddler) return;
      updateCSS(boxEl, "background", type, "background");
      updateCSS(boxEl, "borderColor", type, "borderColor");
      updateCSS(headingEl, "color", type, "headingColor");
      if (getSlice(type, "heading")) headingEl.html(getSlice(type, "heading"));
      updateCSS(messageEl, "color", type, "messageColor");
      updateCSS(messageEl, "fontStyle", type, "messageFontStyle");
      if (getSlice(type, "message")) messageEl.html(getSlice(type, "message"));

      var NORMAL_PADDING=parseInt(trim(store.getTiddlerText("InfoBoxPlugin::Padding")));
      if (getSlice(type, "iconURL")) {
        var iconURL = getSlice(type, "iconURL");
        boxEl.addClass("infoBoxIconed");
        boxEl.css({
          backgroundImage: "url('"+iconURL+"')",
          backgroundPosition: "5px center",
          backgroundRepeat: "no-repeat",
        });
        var leftPadding = (getSlice(type, "iconWidth")) ? (parseInt(getSlice(type, "iconWidth"))||40)+10 : 0;
        if (leftPadding) {
          boxEl.css({
            paddingLeft: leftPadding,
            width: usingIEBoxModel() ? 400 : 400-leftPadding+NORMAL_PADDING
          });
        }
      }

    }

  };

  function updateCSS(el, property, infoBoxType, sliceName) {
    var sliceValue = store.getTiddlerSlice(infoBoxType+"InfoBox", sliceName);
    if (sliceValue) el.css(property, sliceValue);
  }

  function getSlice(infoBoxType, property) {
    var value = wikifyStatic(store.getTiddlerSlice(infoBoxType+"InfoBox", property));
    var processed = store.getTiddlerText(value);
    return processed ? trim(processed) : value; // if !getTiddlerText, we assume its a URL
  }

  //################################################################################
  //# UTILITIES
  //################################################################################

  function usingIEBoxModel() {
    return config.browser.isIE && !(/Trident/.test(navigator.userAgent));
  }

  function applyStyleSheet() {
    var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
    config.shadowTiddlers["StyleSheetInfoBoxPlugin"] = stylesheet;
    store.addNotification("StyleSheetInfoBoxPlugin", refreshStyles);
  }

  function trim(s) { return s.replace(/^[ \n\t]*/, "").replace(/[ \n\t]*$/g, ""); }

  function log() {
    if (console && console.log) console.log.apply(console, arguments);
  }

  //################################################################################
  //# CUSTOM STYLESHEET
  //################################################################################

/***
!StyleSheet

div.infoBox { border: 1px solid [[ColorPalette::SecondaryDark]];
           background-color: [[ColorPalette::SecondaryPale]];
           padding: [[InfoBoxPlugin::Padding]]px;  margin: 0; width: 400px; }
div.infoBox h3 { border-bottom: 0; margin-top: 0; color: [[ColorPalette::PrimaryDark]]; }
div.infoBox .message { font-style: italic; }

!(end of StyleSheet)
|Padding|5|
!(end of padding)
***/

})();
/*}}}*/
