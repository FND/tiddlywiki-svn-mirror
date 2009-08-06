// NOTE:
// indexes are rather confusing, because:
// (a) carousel confusingly starts counting at 1
// (b) the code here adds an invisible start element and end element
// The two things ~cancel each other out, if you see what I mean.

var selectedSlot = 2;

function select(slot) {
  var resource = $($("#resources a")[slot-1]);
  $('#resourceView').attr("src", resource.attr("href"));
  $('#resources a').removeClass("selected");
  resource.addClass("selected");
}

function selectNewResource(na,na,index,action) {
   if (action=="next") {
      if (index!=$("#resources a").length) selectedSlot++;
   } else if (action=="prev") {
      selectedSlot--;
   }
   select(selectedSlot);
}

$(function() {

  $('#resources a').each(function(i) { $(this).data("slot", i+1); });

  $('#resources').jcarousel({visible: 3, scroll: 1, offset: 1, itemFirstInCallback: selectNewResource})
  /* $('#resources a').click(function() { select($(this).data("slot")); }); */
  $('#resources a').click(function() { return false; });

  $("#closer").click(function() { document.location.href = $(".selected").attr("href"); });

});

function log() { if (console) console.log.apply(console, arguments); }
