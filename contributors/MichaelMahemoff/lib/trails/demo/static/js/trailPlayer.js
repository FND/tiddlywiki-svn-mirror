
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

  $resources.each(function(count) {
    $resource = $(this);
    (function(count) {
      $("<a class='marker'>&#9679;</a>")
      .attr("href", $resources.eq(count).attr("href"))
      .wireClickAndHover(predictForListItem)
      .appendTo($("#markers"));

      $("<option/>")
      .html($resource.title())
      .wireClickAndHover(predictForListItem)
      .appendTo($("#dropdown"));
    })(count);
  });
  $markers = $(".marker");
  $resources.hide();

  $("#start").wireClickAndHover(function() { return 0; });
  $("#prev").wireClickAndHover(function() { return Math.max(0, selectedIndex-1); });
  $("#next").wireClickAndHover(function() { return Math.min(selectedIndex+1, $resources.length-1); });
  $("#end").wireClickAndHover(function() { return $resources.length-1; });

  $("#closer").click(function() { document.location.href = $resources[selectedIndex].href; });

  $(".triangle").click(function() {
    if ($("#note").isVisible()) {
      $(".noteTriangle,#note").fadeOut();
      $(".invertedTriangle").fadeIn();
    } else {
      $(".invertedTriangle").fadeOut();
      $(".noteTriangle,#note").fadeIn();
    }
  });
  switchResource(0);
});

$.fn.wireClickAndHover = function(predictor) {

  $(this).data("predictor", predictor);
  return $(this)
    .click(function() { 
      var predictedIndex = predictor.apply(this);
      switchResource(predictedIndex);
      if ($hovered) {
        showPrediction.apply($hovered);
        hidePrediction.apply($hovered);
      }
      return false;
    })
    .mouseenter(showPrediction)
    .mouseout(hidePrediction)
}

// There's no need to create a new function dynamically for each of the dropdown and 
// marker items; each of these always returns the same value, which can be predicted 
// purely from the element's identity. Thus each of those elements' "predict" function
// is the same function, which uses "this" to determine the element's identity.
function predictForListItem() {
  return $(this).prevAll().length;
}

/*******************************************************************************
 * Changing UI - these update UI in response to user events
 *******************************************************************************/

function showPrediction() {

  $hovered = $(this);
  var predictedIndex = $(this).data("predictor").apply(this);
  var $predictedResource = $resources.eq(predictedIndex);

  $markers.eq(predictedIndex).addClass("hovered");

  // if (selectedIndex==predictedIndex) return;
  updateNote(predictedIndex, true);
  var resourceTitle = $predictedResource.title();
  $predictedTitle.html( (predictedIndex < selectedIndex) ?
    "&laquo; " + resourceTitle : resourceTitle + " &raquo");

}

function hidePrediction() {
  $predictedTitle.empty();
  $markers.removeClass("hovered");
  updateNote(selectedIndex);
}

function switchResource(index) {

  if (selectedIndex==index) return;
  $("#progressWrapper").css("display", "block");

  updateControls(selectedIndex = index);

  var url = $("#resources a").eq(index).attr("href");
  // $('#resourceView').find("iframe").remove().end().create("<iframe/>").attr("src", url);
  $('#resourceView').find("iframe").remove().end().create("<iframe/>").src(url);
  $('#resourceView').find("iframe").remove().end().create("<iframe/>")
    .src(url, function() { $("#progressWrapper").css("display", "none"); });
    // .src(url, null, { onReady: function() { $("#progressWrapper").css("display" "none"); }});

  updateNote(index);

}

function updateControls(index) {
  $("#dropdown option").eq(index).attr("selected", true);

  $(".markerSelected").removeClass("markerSelected")
  $(".hovered").removeClass("hovered")
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
