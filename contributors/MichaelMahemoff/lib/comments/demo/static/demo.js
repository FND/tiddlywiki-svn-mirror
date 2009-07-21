$(function() {
  $("#topics li").click(function() {
    var topic = $(this).attr("id");
    $("#topics li").removeClass("selected");
    $(this).addClass("selected");
    $("#commentsContainer").fadeOut('slow', function() { $(this).comments(topic).fadeIn('slow') });
  });
  $("#fish").click();
});
