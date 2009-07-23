var currentSlotIndex = 0;
$(function() {
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
    slot.click(function() { console.log("clicked ",i); selectResource(i); });
  });
  // resources = snake.find(".resource");
  // $("#snakeWrapper").empty().append(snake);
  selectResource(1);
});

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
  // var currentResource = $(resources[currentResourceIndex]).addClass("currentResource");
  // log("switching to ",resourceIndex, "current", currentResource);
  // var nextResource, prevResource;
  // if (currentResourceIndex<resources.length-1) nextResource = $(resources[currentResourceIndex+1]).clone();
  // if (currentResourceIndex>0) prevResource = $(resources[currentResourceIndex-1]).clone();
  // $("#snakeWrapper .resource").remove();
  // $("#currentResource").append(currentResource);
  // if (prevResource) $("#prevResource").append(prevResource);
  // if (nextResource) $("#nextResource").append(nextResource);
  // $("#currentResource").append(currentResource);

  // resources.each(function() { this.className = "resource"; }); // clear any others - selected etc
  // currentResource.addClass("currentResource");
  // if (prevResource) prevResource.addClass("prevResource");
  // if (nextResource) nextResource.addClass("nextResource");
}

function log() { if (console) console.log.apply(console, arguments); }
