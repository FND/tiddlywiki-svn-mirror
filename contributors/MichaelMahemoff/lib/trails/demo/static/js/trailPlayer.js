// var currentSlotIndex = 0;
$(function() {
  $('#resources').jcarousel({visible: 3});
  $("#closer").click(function() { document.location.href = $(".selected").attr("href"); });
  $('#resources a').click(function() {
    console.log("hello click");
    $('#resourceView').attr("src", $(this).attr("href"));
    $('#resources a').removeClass("selected");
    $(this).addClass("selected");
  });
  var links = $('#resources a');
  if (links.length) $(links[0]).click();
  /*
  setupSlots();
  selectResource(0);
  */
});

function setupSlots() {
  var resources = $(".resource");
  if (!resources.length) return;
  var slots = $("<div id='slots'></div>").appendTo($("#slotsWrapper"));
  resources.each(function(i) {
    // var slot = $(this).clone().addClass("slot").append("<div class='nav'></div>").data("index", i).appendTo(slots);
    var slot = $("<a class='slot'></a>")
      .attr("href", $(this).attr("href"))
      .attr("target", $(this).attr("target"))
      .append("<div class='nav'></div>")
      .append($("<span>"+$(this).html()+"</span>"))
      .appendTo(slots);
    slot.click(function() { selectResource(i); });
  });
}

function selectResource(slotIndex) {
  $("#slots").css("marginLeft", slotIndex ? "0" : "270px"); // workaround
  var slots = $(".slot");
  $(".slot").hide().each(function() {
    this.className="slot";
    $(this).find(".nav").empty();
  });
  $(slots[slotIndex]).show().addClass("current");
  $(slots[slotIndex]).prev().show().addClass("prev").find(".nav").append("&#171;");
  $(slots[slotIndex]).next().show().addClass("next").find(".nav").append("&#187;");;
}

function log() { if (console) console.log.apply(console, arguments); }
