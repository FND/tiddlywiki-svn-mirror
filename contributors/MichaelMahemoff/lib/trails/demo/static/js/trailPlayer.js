var currentIndex = 1;

function select(index) {
    var resource = $($("#resources a")[index]);
    console.log("select", index, "res", resource);
    $('#resourceView').attr("src", resource.attr("href"));
    $('#resources a').removeClass("selected");
    resource.addClass("selected");
}

function selectNewResource(na,na,index,action) {
     if (action=="next") {
        if (index!=$("#resources a").length) currentIndex++;
     } else if (action=="prev") {
        currentIndex--;
     }
     select(currentIndex);
}

$(function() {

  $('#resources a').each(function(i) { $(this).data("index", i); });

  $('#resources').jcarousel({visible: 3, scroll: 1, offset: 1, itemFirstInCallback: selectNewResource})
  $('#resources a').click(function() { select($(this).data("index")); });

  $("#closer").click(function() { document.location.href = $(".selected").attr("href"); });

});

function log() { if (console) console.log.apply(console, arguments); }
