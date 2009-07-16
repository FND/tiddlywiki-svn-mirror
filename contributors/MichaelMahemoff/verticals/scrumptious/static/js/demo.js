$(function() {
  $("#commentSets li").click(function() {
    var commentSet = $(this).attr("id");
    $("#commentSets li").removeClass("selected");
    $(this).addClass("selected");
    $("#commentsContainer").fadeOut('slow').comments(commentSet).fadeIn('slow');
  });
  $("#fish").click();
});
