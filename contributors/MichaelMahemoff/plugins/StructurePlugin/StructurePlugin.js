/***
|Name|StructurePlugin|
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

  if(version.extensions.StructurePlugin) return;

  var plugin = version.extensions.StructurePlugin = {installed:true};
  var $=jQuery;
  $.fn.attach = function(html) { return $(html).appendTo(this); };
  applyStyleSheet();

  EMPTY_SECTION_MESSAGE = 'This section is empty. Click "edit" above to create new content.';

  var macro = config.macros.structuredContent = {

    //================================================================================
    // MACRO INITIALISATION
    //================================================================================

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {

      var macroParams = paramString.parseParams();
      m=macroParams;
      log(getParam(macroParams, "stylePreamble"));
      if (getParam(macroParams, "stylePreamble")=="true") applyStyleSheet("Preamble");

      $(place).parents(".tiddler").find(".defaultCommand").removeClass("defaultCommand");

      var structure = paramString.replace(/.*?(\S+)$/, "$1");

      // var sections = store.calcAllSlices(paramString);
      var sections = trim(store.getTiddlerText(structure)).split(/[ \n\t]+/);
      var structuredContent = $("<div class='structuredContent'/>").appendTo(place);
      $.each(sections, function(i, section) {
        var sectionName = section.replace(/Section$/, "");
        var tiddlerTitle = tiddler.title+"_"+sectionName;
        var sectionTiddler = store.getTiddler(tiddlerTitle);
        var sectionEl = $("<div class='section'/>");
        sectionEl
          .data("tiddlerTitle", tiddlerTitle)
          .attach("<h2/>")
            .append("<span>"+sectionName+"</span>")
            .attach("<span class='editLink'>edit</div>")
              .click(function() { editSection($(this).parents(".section"), true); })
            .parent()
          .parent()
          .append("<div class='preamble'/>")
          .attach("<div class='content'></div>")
            .html(sectionTiddler ? wikifyStatic(sectionTiddler.text) : "<div class='empty'>"+EMPTY_SECTION_MESSAGE+"</div>")
            .dblclick(function() { editSection($(this).parents(".section"), true); })
          .parent()
          .attach("<div class='contentEditor'></div>")
            .hide()
            .append("<textarea rows='4' cols='60'/>")
            .attach("<div/>")
              .attach("<button>save</button>")
                .click(function() { closeEditor($(this).parents(".section"), true); })
              .parent()
              .attach("<button>cancel</button>")
                .click(function() { closeEditor($(this).parents(".section"), false); })
              .parent()
            .parent()
          .parent()
          .appendTo(structuredContent);

        var sectionSpecTiddler = store.getTiddler(section);
        console.log(section, sectionSpecTiddler);
        // if (sectionSpecTiddler && version.extensions.InfoBoxPlugin) {
        if (sectionSpecTiddler && trim(sectionSpecTiddler.text).length) {
          wikify(sectionSpecTiddler.text, $(".preamble", sectionEl).get(0));
        }
      });
    }

  };

  function editSection(sectionEl) {
    console.log("sec", sectionEl);
    $(".content", sectionEl).hide();
    $("textarea", sectionEl).val(store.getTiddlerText(sectionEl.data("tiddlerTitle"))).show();
    $(".contentEditor", sectionEl).slideDown();
  }

  function closeEditor(sectionEl, shouldSave) {
    var tiddlerTitle = sectionEl.data("tiddlerTitle");
    var tiddler = store.getTiddler(tiddlerTitle);
    if (shouldSave && tiddlerTitle) {
      console.log(sectionEl, "saving", tiddlerTitle, "v", sectionEl.val());
      tiddler = store.saveTiddler(tiddlerTitle, tiddlerTitle,$("textarea", sectionEl).val(),config.options.txtUserName,new Date(),
      tiddler ? tiddler.tags : "",
      tiddler ? tiddler.fields : []);
      log("after save", tiddler);
    }
    $(".contentEditor", sectionEl).slideUp(
      function() {
        wikify(tiddler ? tiddler.text:"", $(".content", sectionEl).empty().show().get(0));
      }
    );
  }

  //################################################################################
  //# UTILITIES
  //################################################################################

  function trim(s) { return s ? s.replace(/^[ \n\t]*/, "").replace(/[ \n\t]*$/g, "") : ""; }

  function applyStyleSheet(prefix) {
    var prefix = prefix||"";
    var stylesheet = store.getTiddlerText("StructurePlugin##"+prefix+"StyleSheet");
    log("sty", prefix,"--",stylesheet);
    config.shadowTiddlers[prefix+"StyleSheetStructurePlugin"] = stylesheet;
    store.addNotification(prefix+"StyleSheetStructurePlugin", refreshStyles);
  }

  function log() {
    if (console && console.log) console.log.apply(console, arguments);
  }

  //################################################################################
  //# CUSTOM STYLESHEET
  //################################################################################

// Primary Secondary Tertiary | Pale Light Mid Dark
/***
!StyleSheet
.structuredContent h2 { margin: 1em 0 0; border-bottom: 0; }
.structuredContent .content { cursor: pointer; }
.structuredContent .editLink { color: [[ColorPalette::TertiaryMid]]; margin-left: 4px; font-size: x-small; }
.structuredContent .editLink:hover { color: [[ColorPalette::TertiaryDark]]; cursor: pointer; }
.structuredContent textarea { margin: 0.5em 0; padding: 5px; }
.structuredContent button { margin-right: 5px; }
.structuredContent .empty { color: [[ColorPalette::TertiaryMid]]; font-style: italic; }
!(end of StyleSheet)
***/

/***
!PreambleStyleSheet
.preamble { font-style: italic; padding: 5px; background: [[ColorPalette::SecondaryPale]]; border: 1px solid [[ColorPalette::SecondaryMid]]; float: left; }
!
***/

})();
/*}}}*/
