$(function () {

  self.opener.$.fn.comments.updateLoginUI();

  // strictly speaking, unnecessary
  var userID = $.cookie("tiddlyweb_user");
  if (userID) {
    $("#userIDArea").show();
    $("#userID").html(userID);
  }

  var timer = setInterval(function() {
    var countdown = $("#countdown").html();
    if (countdown==1) { 
      clearTimeout(timer);
      window.close();
    } else {
      $("#countdown").html(countdown-1);
    }
  }, 1000);
});
