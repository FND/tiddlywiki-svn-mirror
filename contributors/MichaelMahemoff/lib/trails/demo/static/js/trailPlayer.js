
var $resources, $predictedTitle, $note, $markers, selectedIndex, $hovered, $tooltip;

/*******************************************************************************
 * Initialise - build and wire the UI
 * - Reads resources list, which is a simple gracefully degrading link list,
 *   and builds and wires the UI from those resources.
 * - Each element declares a "predict" function indicating what will happen when
 *   the element is clicked/selected. Precisely, the "predict" function returns
 *   the index of the resource which to be opened, within the list of resources.
 *******************************************************************************/

$(function() {

  $resources = $("#resources a");
  $predictedTitle = $("#predictedTitle");
  $note = $("#note");
  $tooltip = $("<div class='tooltip'/>").hide().appendTo("body");

  $("#metaInfoTitle #text").html($("#trail #title").html());
  $("#metaInfoEdit").showIf($("#trail #edit").length).attr("href", $("#trail #edit").attr("href"));
  $("#infoTrailOwner,#noteTrailOwner").html($("#trail #owner").html());

  $resources.each(function(count) {
    $resource = $(this);
    (function(count) {
      $("<a class='marker'>&#9679;</a>")
      .attr("href", $resources.eq(count).attr("href"))
      .appendTo($("#markers"));

      $("<option/>")
      .val(count)
      .html($resources.eq(count).html())
      .appendTo($("#dropdown"));

      $("select")
      .data("predictor", function() { return $(this).val(); })
      .change(switchResource);

    })(count);
  });
  $markers = $(".marker");

  $("#start").wireClickAndHover(function() { return 0; });
  $("#prev,#miniPrev").wireClickAndHover(function() { return Math.max(0, selectedIndex-1); });
  $("#next,#miniNext").wireClickAndHover(function() { return Math.min(selectedIndex+1, $resources.length-1); });
  $("#end").wireClickAndHover(function() { return $resources.length-1; });

  $("#close").click(function() { document.location.href = $resources[selectedIndex].href; });
  $("#hide").click(function() { toggleTopBar(false); });
  $("#infoLink").click(showWelcome);
  $("#miniBar #restore").click(function() { toggleTopBar(true); });
  $("#miniLink").click(function() { return false; });

  $(".noteToggle,#noteControl").click(toggleNote);
  /*
  $(".triangle, #note h4, #noteExpander").click(function() {
    if ($("#note").isDisplayed()) {
      $(".noteTriangle,#note").fadeOut();
      $(".invertedTriangle").fadeIn(function() { $("#noteExpander").html("+").addClass("inverted"); });
    } else {
      $(".invertedTriangle").fadeOut();
      $(".noteTriangle,#note,#noteExpander").fadeIn(
        function() { $("#noteExpander").html("hide").removeClass("inverted"); }
      );
    }
  });
  */
  var resourceSwitched = updateResourceFromURL();
  if (!resourceSwitched) switchResourceByIndex(0);
  //
  // showWelcome(true);
});

$.fn.wireClickAndHover = function(predictor) {
  $(this).data("predictor", predictor);
  return $(this)
    .wireHover(predictor)
    .click(switchResource);
};

$.fn.wireHover = function(predictor) {
  $(this).data("predictor", predictor);
  return $(this)
    .mouseenter(showPrediction)
    .mouseout(hidePrediction);
};

/*******************************************************************************
 * Welcome message - this is the list of links
 ******************************************************************************/

var welcomeMessage;
function showWelcome(isLaunching) {
 welcomeMessage = $("#welcomeTemplate").clone().attr("id", "welcome");
 welcomeMessage.html(welcomeMessage.html()
    .replace(/\[\[username\]\]/g, $("#owner").html())
    .replace(/\[\[title\]\]/g, $("#title").html())
    .replace(/\[\[resources\]\]/g, $("#resources").html())
  );
  welcomeMessage.find(".resourceItem").eq(selectedIndex).addClass("selected");
  $("button", welcomeMessage).live("click", function() { $.modal.close(); });
  $("input[type=checkbox]", welcomeMessage).live("click", function() {
    $(".note", welcomeMessage).showIf($(this).is(":checked"), {
      showEffect: function() { $(this).fadeIn(); },
      hideEffect: function() { $(this).fadeOut(); }
    });
  });
  $(".caption").live("click", function(ev) {
    ev.preventDefault();
    $("input[type=checkbox]", welcomeMessage).click();
  });
  //
  // hijack resource links
  $("ol", welcomeMessage).live("click", function(ev) {
    if (ev.which!=1) return; // left button only
    var $target = $(ev.target).closest("li");
    if ($target.length) {
      $(".modal").data("close", null);
      $.modal.close();
      switchResourceByIndex($target.prevAll().length);
      return false;
    }
  });

  var modalOptions = {
    dialogWidth: 600,
    dialogHeight: 600
  }
  if (isLaunching) modalOptions.close = switchResourceByIndex;
  $.modal.show(welcomeMessage, modalOptions);
}

/*******************************************************************************
 * Toggle Top Bar and Note
 ******************************************************************************/

function toggleTopBar(shouldShow) {
  var DELAY=300;
  if (shouldShow) {
      $("#note").css("opacity",0).animate({opacity:1}, DELAY);
      $("#topBar").slideDown(DELAY);
      $(".scripted body").animate({"paddingTop": 48}, DELAY, function() {
        // $("#miniBar").removeClass("available");
        $("#miniBar").css({zIndex: 1, opacity: 0});
      });
  } else {
      $("#note").css("opacity",1).animate({opacity:0}, DELAY);
      $("#topBar").slideUp(DELAY);
      $(".scripted body").animate({"paddingTop": 0}, DELAY, function() {
        // $("#miniBar").addClass("available").blink();
        $("#miniBar").addClass("available").css("zIndex", 999999).blink(). hover(function() {
          $(this).css("opacity", 1);
        }, function() {
          $(this).css("opacity", 0.05);
        });
      });
  }
}

function toggleNote() {
  var willBeHidden = $("#note").isDisplayed();
  if (willBeHidden) {
    $("#noteControl").removeClass("showing");
  } else {
    $("#noteControl").addClass("showing");
    $("#noteHide").css("opacity", 1);
  }
  $("#note").slideToggle();
}

/*******************************************************************************
 Event handlers
 *******************************************************************************/

function switchResource() {
  var predictor = $(this).data("predictor");
  if (predictor) switchResourceByIndex($(this).data("predictor").apply(this));
  return false;
}

var tooltipTimer;
function showPrediction(ev) {
  /*
  $hovered = $(this);
  var predictedIndex = $(this).data("predictor").apply(this);
  $markers.eq(predictedIndex).addClass("hovered");
  updateNote(predictedIndex, true);

  var $predictedResource = $resources.eq(predictedIndex);
  $predictedTitle.html( (predictedIndex < selectedIndex) ?
    "&laquo; "+$predictedResource.title() : $predictedResource.title()+" &raquo");
  */

  var predictedIndex = $(this).data("predictor").apply(this);
  if (predictedIndex==selectedIndex) return;
  var $predictedResource = $resources.eq(predictedIndex);

  if ($tooltip.data("predictor")==this && $tooltip.isDisplayed()) return;
  clearTimeout(tooltipTimer);
  var xPos = (ev.pageX+55 < $("body").width()) ? ev.pageX+5 : $("body").width()-55; // crude
  $tooltip
    .data("predictor", this)
    .html(spacify($predictedResource.title()))
    .css({left: xPos, top: ev.pageY+5})
    .show();
}

function hidePrediction() {
  tooltipTimer = setTimeout(function() {
    $tooltip.hide();
  }, 500);
  $predictedTitle.empty();
  $markers.removeClass("hovered");
  updateNote(selectedIndex);
}

/*******************************************************************************
 * Switching resource UI
 *******************************************************************************/

function switchResourceByIndex(index) {

  if (!index||index>=$resources.length) index=0;

  if ($hovered) hidePrediction.apply($hovered);

  if (selectedIndex==index) return;
  updateControls(selectedIndex = index);

  updateNote(index);
  updateURLFromResource(index);

  /*
    if ($hovered) {
      hidePrediction.apply($hovered);
      showPrediction.apply($hovered);
    }
  */

  $("#progress").visible(true);

  var $resource  = $resources.eq(index);
  var url  = $resource.attr("href");
  var name = $resource.html();
  document.title = name + "'" + $("#trail #title").html() + "' - trail - Scrumptious";
  $('#resourceView').removeChildren("#ZZZinitialBacking").find("iframe").remove().end().create("<iframe/>").src(url, function() { $("#progress").visible(false); });

  $("#close,#miniLink").attr("href", url);

}

function updateControls(index) {
  setTimeout(function() { $("#dropdown").val(index); }, 1);
  /*
  try { // http://is.gd/4KngN
    // $("#dropdown option").eq(index).attr("selected", true);
    $("#dropdown").val(index);
  } catch(ex) {
    setTimeout(function() { $("#dropdown").val(index) }, 1);
  }
  */
  $(".markerSelected").removeClass("markerSelected")
  $(".marker").eq(index).addClass("markerSelected");
}

function updateNote(index, isPrediction) {
  $("#note").setClassIf(isPrediction, "prediction");
  var note = $.trim($("#resources .note").eq(index).html());
  var resourceLink = $("<a/>").attr("href", $resources[index].href).html($resources.eq(index).title());
  $("#note h5").html(resourceLink);
  $('#note .content').html(note);
  $("#note .existingNote").showIf(note.length);
  $("#note .absentNote").showIf(!note.length);
  $(".invertedTriangle").setClassIf(note.length, "existingNote");
  $('#note .content').html(note);

  var noteWordCount = wordCount(note);
  $('#wordCount').html($.trim(note).length>0 ? wordCount(note)+" word" : "no");

  return note;
}

/*******************************************************************************
 * Sync URL with application state
 *******************************************************************************/

function updateURLFromResource(index) {
  var url = $resources[index].href;
  document.location.hash = "#/" + index;
}

function updateResourceFromURL() {

  var hash = document.location.hash;
  if (!hash) return;
  var index = parseInt(hash.substr(2)); // 0th is #; 1st is /
  if (typeof(index)=="NaN" || index>=$resources.length) return;

  switchResourceByIndex(index);
  return true;

}

var lastHash = document.location.hash;
(function pollURL() {
  if (document.location.hash!=lastHash) updateResourceFromURL();
  lastHash = document.location.hash;
  setTimeout(pollURL, 1000);
})();

/*******************************************************************************
 * MINI TOP BAR 
 *******************************************************************************/

/*******************************************************************************
 * Utils
 *******************************************************************************/

function log() { if (window.console) console.log.apply(console, arguments); }
$.fn.create = function(html) { return this.append(html).children(":last"); };
$.fn.showIf = function(shouldShow, options) {
  var defaults = {
    showEffect: function() { $(this).show(); },
    hideEffect: function() { $(this).hide(); }
  }
  var settings = $.extend(defaults, options);
  // return $(this).css("display", bool ? "block":"none");
  shouldShow ? settings.showEffect.apply(this) : settings.hideEffect.apply(this);
  return $(this);
}
$.fn.setClassIf = function(bool, klass) { 
  return (bool ? $(this).addClass(klass) : $(this).removeClass(klass)); }
$.fn.isDisplayed = function() { return $(this).css("display")!="none"; }
$.fn.replaceWith = function(el) { $(this).after(el).remove(); return el; };
$.fn.visible = function(visible) { 
  if (!arguments.length) return $(this).css("visibility")=="visible";
  for (var i=0; i<this.length; i++) {
    $(this).eq(i).css("visibility", visible ? "visible":"hidden");
  }
  return $(this);
}
$.fn.toggleVisibility = function() {
  for (var i=0; i<$(this).length; i++) {
    $(this).eq(i).visible(!$(this).visible());
  }
  return $(this);
}
$.fn.slideToggle = function() { return $(this)[$(this).isDisplayed() ? "slideUp":"slideDown"](); }
// $.fn.blink = function() { delay=500; return $(this).animate({opacity: 1}, delay, function() { $(this).animate({opacity: 0.01}, delay, function() { $(this).animate({opacity: 1}, delay, $(this).animate({opacity: 0.0001}, delay, function() { $(this).animate({opacity: 1})})})})};
$.fn.blink = function() {
  for (var i=0; i<3; i++) {
    $(this).fadeTo(200, 1).fadeTo(i==2?1000:200, 0.05); }
  return $(this);
}
$.fn.removeChildren = function(selector) { $(this).find(selector).remove(); return $(this); }

$.fn.title = function() { 
  var title = $.trim($(this).html());
  return title.length ? title : $(this).attr("href");
}

function spacify(s) { return s.replace(" ", "&nbsp;"); }
function wordCount(s) { return s.split(/\s+/).length; }
