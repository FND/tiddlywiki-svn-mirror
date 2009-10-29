
var $resources, $predictedTitle, $markers, selectedIndex, $hovered;

function onMouseEnter() {
  $hovered = $(this);
  var predictedIndex = $(this).data("predictor").apply(this);

  $markers.eq(predictedIndex).addClass("hovered");

  if (selectedIndex==predictedIndex) return;
  var resourceTitle = $resources[predictedIndex].innerHTML;
  $predictedTitle.html( (predictedIndex < selectedIndex) ?
    "&laquo; " + resourceTitle : resourceTitle + " &raquo");
}

function onMouseOut() {
  $predictedTitle.empty();
  $markers.removeClass("hovered");
}

$.fn.shallOpen = function(predictor) {

  $(this).data("predictor", predictor);
  return $(this)
    .click(function() { 
      var predictedIndex = predictor.apply(this);
      switchResource(predictedIndex);
      if ($hovered) {
        onMouseOut.apply($hovered);
        onMouseEnter.apply($hovered);
      }
    })
    .mouseenter(onMouseEnter)
    .mouseout(onMouseOut)
}

function predictForListItem() {
  return $(this).prevAll().length;
}

function switchResourceForList() {
  switchResource($(this).prevAll().length);
}

function showpredictedTitleForList() {
  var index = $(this).prevAll().length;
  var description = $("#resources a").eq(index).html();
  $("#predictedTitle").html(description);
}

function switchResource(index) {
  updateControls(selectedIndex = index);
  var url = $("#resources a").eq(index).attr("href");
  $('#resourceView').empty().create("<iframe/>").attr("src", url);
}

function updateControls(index) {
  $("#dropdown option").eq(index).attr("selected", true);

  $(".markerSelected").removeClass("markerSelected")
  $(".hovered").removeClass("hovered")
  $(".marker").eq(index).addClass("markerSelected");

}

function renderNote(resource) {
  var note = selected().attr("note");
  $("#note")
    .empty()
    .create("<div class='more'/>")
      .text("expand")
      .click(showFullNote)
    .end()
    .create("<span class='text' />")
      .text(note)
    .end();
}

function showFullNote() {
  var message = $("<div/>")
    .append("<h1>"+selected().html()+"</h1>")
    .append(selected().attr("note"));
  $.modal.show(message);
}

$(function() {

  $resources = $("#resources a");
  $predictedTitle = $("#predictedTitle");

  $resources.each(function(count) {
    $resource = $(this);
    (function(count) {
      $("<span class='marker'>&#9679;</span>")
      .shallOpen(predictForListItem)
      .appendTo($("#markers"));

      $("<option/>")
      .data("index", count)
      .html($resource.html())
      // .shallOpen(function() { return count; })
      .shallOpen(predictForListItem)
      .appendTo($("#dropdown"));
    })(count);
  });
  $markers = $(".marker");
  $resources.hide();

  $("#start").shallOpen(function() { return 0; });
  $("#prev").shallOpen(function() { return Math.max(0, selectedIndex-1); });
  $("#next").shallOpen(function() { return Math.min(selectedIndex+1, $resources.length-1); });
  $("#end").shallOpen(function() { return $resources.length-1; });

  $("#closer").click(function() { document.location.href = $(".selected").attr("href"); });

  switchResourceForList(0);
});

function log() { if (window.console) console.log.apply(console, arguments); }
$.fn.create = function(html) { return this.append(html).children(":last"); };
