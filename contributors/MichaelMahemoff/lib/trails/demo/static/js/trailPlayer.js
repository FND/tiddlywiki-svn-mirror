
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

  $("#metaInfoTitle").html($("#trail #title").html());
  $("#metaInfoEdit").showIf($("#trail #edit").length).attr("href", $("#trail #edit").attr("href"));
  $("#noteTrailOwner").html($("#trail #owner").html());

  $resources.each(function(count) {
    $resource = $(this);
    (function(count) {
      $("<a class='marker'>&#9679;</a>")
      .attr("href", $resources.eq(count).attr("href"))
      // .wireClickAndHover(predictForListItem)
      .appendTo($("#markers"));

      $("<option/>")
      .val(count)
      .html($resources.eq(count).html())
      // .wireHover(predictForListItem)
      .appendTo($("#dropdown"));

      $("select")
      .data("predictor", function() { return $(this).val(); })
      .change(switchResource);

    })(count);
  });
  $markers = $(".marker");
  $resources.hide();

  $("#start").wireClickAndHover(function() { return 0; });
  $("#prev,#miniPrev").wireClickAndHover(function() { return Math.max(0, selectedIndex-1); });
  $("#next,#miniNext").wireClickAndHover(function() { return Math.min(selectedIndex+1, $resources.length-1); });
  $("#end").wireClickAndHover(function() { return $resources.length-1; });

  $("#close").click(function() { document.location.href = $resources[selectedIndex].href; });
  $("#hide").click(function() { toggleTopBar(false); });
  $("#miniBar #restore").click(function() { toggleTopBar(true); });
  $("#miniLink").click(function() { return false; });

  $(".noteToggle").click(toggleNote);
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
  switchResourceByIndex(0);
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

function toggleTopBar(shouldShow) {
  var DELAY=300;
  if (shouldShow) {
      $("#note").css("opacity",0).animate({opacity:1}, DELAY);
      $("#topBar").slideDown(DELAY);
      $(".scripted body").animate({"paddingTop": 48}, DELAY, function() {
        $("#miniBar").removeClass("available");
      });
  } else {
      $("#note").css("opacity",1).animate({opacity:0}, DELAY);
      $("#topBar").slideUp(DELAY);
      $(".scripted body").animate({"paddingTop": 0}, DELAY, function() {
        $("#miniBar").addClass("available");
      });
  }
}

function toggleNote() {
  console.log($("#note").css("display"));
  var willBeHidden = $("#note").isDisplayed();
  if (willBeHidden) {
    $("#noteExpand").animate({opacity: 1});
  } else {
    $("#noteExpand").animate({opacity: 0});
    $("#noteHide").css("opacity", 1);
  }
  $("#note").slideToggle();
}

// There's no need to create a new function dynamically for each of the dropdown and 
// marker items; each of these always returns the same value, which can be predicted 
// purely from the element's identity. Thus each of those elements' "predict" function
// is the same function, which uses "this" to determine the element's identity.
function predictForListItem() {
  return $(this).prevAll().length;
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

  if ($hovered) hidePrediction.apply($hovered);

  if (selectedIndex==index) return;
  updateControls(selectedIndex = index);

  updateNote(index);

  /*
    if ($hovered) {
      hidePrediction.apply($hovered);
      showPrediction.apply($hovered);
    }
  */

  $("#progress").visible(true);

  var $resource  = $("#resources a").eq(index);
  var url  = $resource.attr("href");
  var name = $resource.html();
  document.title = name + "'" + $("#trail #title").html() + "' trail - ";
  $('#resourceView').find("iframe").remove().end().create("<iframe/>")
    .src(url, function() { $("#progress").visible(false); });

  $("#close,#miniLink").attr("href", url);

}

function updateControls(index) {
  setTimeout(function() { $("#dropdown").val(index) }, 1);
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
  return note;
}

/*******************************************************************************
 * MINI TOP BAR 
 *******************************************************************************/

/*******************************************************************************
 * Utils
 *******************************************************************************/

function log() { if (window.console) console.log.apply(console, arguments); }
$.fn.create = function(html) { return this.append(html).children(":last"); };
$.fn.showIf = function(bool) { return $(this).css("display", bool ? "block":"none"); }
$.fn.setClassIf = function(bool, klass) { 
  return (bool ? $(this).addClass(klass) : $(this).removeClass(klass)); }
$.fn.isDisplayed = function() { return $(this).css("display")!="none"; }
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

$.fn.title = function() { 
  var title = $.trim($(this).html());
  return title.length ? title : $(this).attr("href");
}

function spacify(s) { return s.replace(" ", "&nbsp;"); }
