$(function() {

  $("#clickable").click(function() { $.modal.show("You clicked the thingo. There's another demo further down."); });
  $("#check").click(function() { if ($("#answer").val()=="10") $.modal.show("Correct! Now you can scroll up and down to see that the background mask applies to the whole web page."); });

});

