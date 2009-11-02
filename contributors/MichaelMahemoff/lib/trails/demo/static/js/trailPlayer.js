
var $resources, $predictedTitle, $note, $markers, selectedIndex, $hovered;

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

  $("#metaInfoTitle").html($("#trail #title").html());
  $("#metaInfoEdit").showIf($("#trail #edit").length).attr("href", $("#trail #edit").attr("href"));
  $("#noteTrailOwner").html($("#trail #owner").html());

  $resources.each(function(count) {
    $resource = $(this);
    (function(count) {
      $("<a class='marker'>&#9679;</a>")
      .attr("href", $resources.eq(count).attr("href"))
      .wireClickAndHover(predictForListItem)
      .appendTo($("#markers"));

      $("<option/>")
      .val(count)
      .html($resources.eq(count).html())
      .wireHover(predictForListItem)
      .appendTo($("#dropdown"));

      $("select")
      .data("predictor", function() { return $(this).val(); })
      .change(switchResource);

    })(count);
  });
  $markers = $(".marker");
  $resources.hide();

  $("#start").wireClickAndHover(function() { return 0; });
  $("#prev,#quickPrev").wireClickAndHover(function() { return Math.max(0, selectedIndex-1); });
  $("#next,#quickNext").wireClickAndHover(function() { return Math.min(selectedIndex+1, $resources.length-1); });
  $("#end").wireClickAndHover(function() { return $resources.length-1; });

  $("#closer #close").click(function() { document.location.href = $resources[selectedIndex].href; });
  $("#closer #hideBar").click(function() { showAndHideTopBar(false); });
  $("#topBarHidden #restore").click(function() { showAndHideTopBar(true); });

  $(".triangle, #note h4, #noteExpander").click(function() {
    if ($("#note").isVisible()) {
      $(".noteTriangle,#note").fadeOut();
      $(".invertedTriangle").fadeIn(function() { $("#noteExpander").html("+").addClass("inverted"); });
    } else {
      $(".invertedTriangle").fadeOut();
      $(".noteTriangle,#note,#noteExpander").fadeIn(
        function() { $("#noteExpander").html("-").removeClass("inverted"); }
      );
    }
  });
  switchResourceByIndex(0);
});

$.fn.wireClickAndHover = function(predictor) {
  $(this).data("predictor", predictor);
  return $(this)
    .wireHover(predictor)
    .click(switchResource)
}

$.fn.wireHover = function(predictor) {
  $(this).data("predictor", predictor);
  return $(this)
    .mouseenter(showPrediction)
    .mouseout(hidePrediction);
}

function showAndHideTopBar(shouldShow) {
  $("#topBar, #noteWrapper").showIf(shouldShow);
  $("#topBarHidden").setClassIf(!shouldShow, "available");
  $(".scripted body").css("paddingTop", shouldShow ? "48px":0); // todo klassify
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

function showPrediction() {
  $hovered = $(this);
  var predictedIndex = $(this).data("predictor").apply(this);
  $markers.eq(predictedIndex).addClass("hovered");
  updateNote(predictedIndex, true);

  var $predictedResource = $resources.eq(predictedIndex);
  $predictedTitle.html( (predictedIndex < selectedIndex) ?
    "&laquo; "+$predictedResource.title() : $predictedResource.title()+" &raquo");
}

function hidePrediction() {
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

  $("#progressWrapper").show();

  var url = $("#resources a").eq(index).attr("href");
  $('#resourceView').find("iframe").remove().end().create("<iframe/>")
    .src(url, function() { $("#progressWrapper").hide(); });

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
 * Utils
 *******************************************************************************/

function log() { if (window.console) console.log.apply(console, arguments); }
$.fn.create = function(html) { return this.append(html).children(":last"); };
$.fn.showIf = function(bool) { return $(this).css("display", bool ? "block":"none"); }
$.fn.setClassIf = function(bool, klass) { 
  return (bool ? $(this).addClass(klass) : $(this).removeClass(klass)); }
$.fn.isVisible = function() { return $(this).css("display")!="none"; }

$.fn.title = function() { 
  var title = $.trim($(this).html());
  return title.length ? title : $(this).attr("href");
}
