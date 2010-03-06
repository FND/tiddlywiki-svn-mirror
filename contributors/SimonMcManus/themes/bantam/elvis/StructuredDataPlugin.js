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
(function($) {

  if(version.extensions.StructurePlugin) return;

  var plugin = version.extensions.StructurePlugin = {installed:true};
  $.fn.attach = function(html) { return $(html).appendTo(this); };
  applyStyleSheet();

  EMPTY_SECTION_MESSAGE = 'This section is empty. Click "edit" above to create new content.';

  $.fn.shortSection = function(sectionName) {
    return $(this)
      .addClass("shortSection")
      .append("<h2>"+sectionName+": </h2>")
      .append("<span class='content' />")
      .append("<span class='editLink'>edit</div>")
      .append("<div class='contentEditor' />");
  };

  $.fn.longSection = function(sectionName) {
    return $(this)
        .attach("<h2/>")
          .append("<span>"+sectionName+"</span>")
          .append("<span class='editLink'>edit</div>")
        .parent()
        .append("<div class='preamble'/>")
        .append("<div class='clearance'>&nbsp;</div>")
        .append("<div class='content' />")
        .append("<div class='contentEditor' />");
  };

  $.fn.textareaEdit = function(sectionName, sectionEditOptions) {
    return $("<textarea nam='"+sectionName+"' rows='4' cols='60' class='StructureEditBox' />");
  };
  
  $.fn.dropdownEdit = function(sectionName, sectionEditOptions) {
    var options = "";
    var editOptions = sectionEditOptions.split('\n');
    for (var i=0; i<editOptions.length; i++) {
        options += "<option value='"+editOptions[i]+"'>"+editOptions[i]+"</option>";
    }
    return $("<select name='"+sectionName+"'class='StructureEditBox' />")
        .append(options);
  };
  
  $.fn.textEdit = function(sectionName, sectionEditOptions) {
    return $("<input name='"+sectionName+"' type='text' class='StructureEditBox' />");
  };

  $.fn.updateSection = function(section, sectionContentTiddler) {
      var text =   getSection(section, "preText", "")
                 + stripEOL(sectionContentTiddler?sectionContentTiddler.text:"")
                 + getSection(section, "postText", "");
      return $(this).html(sectionContentTiddler ? 
        wikifyStatic(trim(text)) : "<div class='empty'>"+EMPTY_SECTION_MESSAGE+"</div>");
  };

  var macro = config.macros.structuredContent = {

    //================================================================================
    // MACRO INITIALISATION
    //================================================================================

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {

      var macroParams = paramString.parseParams();
      m=macroParams;

      $(place).parents(".tiddler").find(".defaultCommand").removeClass("defaultCommand");

      var structure = paramString.replace(/.*?(\S+)$/, "$1");

      // var sections = store.calcAllSlices(paramString);
      var sections = trim(store.getTiddlerText(structure)).split(/[ \n\t]+/);
      var structuredContent = $("<div class='structuredContent'/>").appendTo(place);

      var contentRootTiddler = store.getTiddler(getParam(macroParams, "tiddler"))||tiddler;

      $.each(sections, function(i, section) {

        var sectionSpecTiddler = store.getTiddler(section);
        var sectionName = section.replace(/Section$/, "");
        var tiddlerTitle = contentRootTiddler.title+"_"+sectionName;
        var sectionContentTiddler = store.getTiddler(tiddlerTitle);

        var sectionEl = $("<div class='section'/>").data("tiddlerTitle", tiddlerTitle);
        $(sectionEl)[getSlice(section, "style","long")+"Section"](sectionName).appendTo(structuredContent);
        var editBox = $(sectionEl)[getSlice(section, "editType", "textarea")+"Edit"](sectionName, getSection(section, "editOptions"));
  populatePreamble(sectionEl, getSection(section, "Preamble"));
        wireEvents(sectionEl, section, sectionContentTiddler, editBox);
        finaliseUIUsingOptions(sectionEl, section);
      });
    }

  };

  function populatePreamble(sectionEl, preambleSpec) {
    var preambleEl = $(".preamble", sectionEl);
    if (preambleEl.length) {
      preambleEl.empty();
      if (preambleSpec) {
        // wikify(sectionSpecTiddler.text, $(".preamble", sectionEl).get(0));
        var content = $("<div/>").appendTo(preambleEl);
        wikify(preambleSpec, content.get(0));
      }
    }
  }


  function wireEvents(sectionEl, section, sectionContentTiddler, editBox) {
    $(".editLink", sectionEl).click(function() { editSection($(this).parents(".section"), true); });
    $(".content", sectionEl)
      .updateSection(section, sectionContentTiddler)
      .dblclick(function() { editSection($(this).parents(".section"), true); });
    $(".contentEditor", sectionEl)
      .hide()
      .append(editBox)
      .attach("<div/>")
        .attach("<button>save</button>")
          .click(function() { closeEditor($(this).parents(".section"), true); })
        .parent()
        .attach("<button>cancel</button>")
          .click(function() { closeEditor($(this).parents(".section"), section, false); })
        .parent()
      .parent();
  }

  function editSection(sectionEl) {
    $(".content", sectionEl).hide();
    $(".StructureEditBox", sectionEl).val(store.getTiddlerText(sectionEl.data("tiddlerTitle"))).show();
    $(".contentEditor", sectionEl).slideDown();
    $(".StructureEditBox", sectionEl).focus();
  }

  function closeEditor(sectionEl, shouldSave, section) {
    var tiddlerTitle = sectionEl.data("tiddlerTitle");
    var tiddler = store.getTiddler(tiddlerTitle);
    if (shouldSave && tiddlerTitle) {
      tiddler = store.saveTiddler(tiddlerTitle, tiddlerTitle,$(".StructureEditBox", sectionEl).val(),config.options.txtUserName,new Date(),
      tiddler ? tiddler.tags : "",
      tiddler ? tiddler.fields : merge({}, config.defaultCustomFields));
      autoSaveChanges();
    }
    $(".contentEditor", sectionEl).slideUp(
      function() { $(".content", sectionEl).updateSection(section, tiddler).show(); }
    );
  }

  function finaliseUIUsingOptions(sectionEl, section) {
    if (getSlice(section, "showTitle", "true") != "true") {
      $("h2", sectionEl).hide();
    }
    if (readOnly) $(".editLink").hide();
  }


  function getSlice(section, key, defaultVal) {
    var sectionSpecTiddler = store.getTiddler(section);
    if (!sectionSpecTiddler) return defaultVal;
    var val = trim(store.getTiddlerSlice(sectionSpecTiddler.title, key));
    return val.length ? val : defaultVal;
  }

  function getSection(section, key, defaultVal) {
    var sectionSpecTiddler = store.getTiddler(section);
    if (!sectionSpecTiddler) return defaultVal;
    // var val = trim(store.getTiddlerText(sectionSpecTiddler.title+"##"+key));
    // return val.length ? val : defaultVal;
    var val = store.getTiddlerText(sectionSpecTiddler.title+"##"+key);
    if (val) val = stripEOL(val);
    return val&&val.length ? val : defaultVal;
  }

  function trim(s) { return s ? s.replace(/^[ \n\t]*/, "").replace(/[ \n\t]*$/g, "") : ""; }

  function stripEOL(s) { return s ? s.replace(/\n$/m, "") : ""; }

  function applyStyleSheet(prefix) {
    prefix = prefix||"";
    var stylesheet = store.getTiddlerText("StructurePlugin##"+prefix+"StyleSheet");
    config.shadowTiddlers[prefix+"StyleSheetStructurePlugin"] = stylesheet;
    store.addNotification(prefix+"StyleSheetStructurePlugin", refreshStyles);
  }

  function log() {
    if (console && console.log) console.log.apply(console, arguments);
  }

  function invokeMacro(place,macro,params,wikifier,tiddler) {
    var m = config.macros[macro];
    var tiddlerElem=story.findContainingTiddler(place);
    window.tiddler=tiddlerElem?store.getTiddler(tiddlerElem.getAttribute
    ("tiddler")):null;
    window.place = place;
    m.handler(place,macro,params.readMacroParams
    (),wikifier,params,tiddler);
  }


// Primary Secondary Tertiary | Pale Light Mid Dark
/***
!StyleSheet
.structuredContent h2 { margin: 1em 0 0; border-bottom: 0; }
.structuredContent .clearance { clear: left; height: 1px; line-height: 1px; }
.structuredContent .content { cursor: pointer; }
.structuredContent .editLink { color: [[ColorPalette::TertiaryMid]]; margin-left: 4px; font-size: x-small; }
.structuredContent .editLink:hover { color: [[ColorPalette::TertiaryDark]]; cursor: pointer; }
.structuredContent textarea { margin: 0.5em 0; padding: 5px; }
.structuredContent button { margin-right: 5px; }
.structuredContent .empty { color: [[ColorPalette::TertiaryMid]]; font-style: italic; }
.structuredContent .preamble div { font-size: small; font-style: italic; margin: 4px 0; padding: 2px; background: [[ColorPalette::SecondaryPale]]; border: 1px solid [[ColorPalette::SecondaryMid]]; float: left; max-width: 400px; text-align: center; }

.structuredContent .shortSection h2 { display: inline;  }
.structuredContent .shortSection { margin-top: 1em; }

!(end of StyleSheet)
***/

})(jQuery);
/*}}}*/