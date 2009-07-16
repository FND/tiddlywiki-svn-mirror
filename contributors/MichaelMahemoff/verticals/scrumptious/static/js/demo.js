$(function() {
  $("#commentSets li").click(function() {
    var commentSet = $(this).attr("id");
    $("#commentsContainer").comments(commentSet);
  });
});
