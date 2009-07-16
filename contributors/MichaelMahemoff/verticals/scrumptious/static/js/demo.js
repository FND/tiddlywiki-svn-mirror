$(function() {
  $("#commentSets li").click(function() {
    var commentSet = $(this).attr("id");
    $("#commentSets li").removeClass("selected");
    $(this).addClass("selected");
    $("#commentsContainer").fadeOut('slow', function() { $(this).comments(commentSet).fadeIn('slow') });
  });
  $("#fish").click();
});
