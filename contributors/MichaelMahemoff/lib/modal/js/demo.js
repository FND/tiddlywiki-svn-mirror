$(function() {

  $("#clickable").click(function() { $.modal.show("You clicked the thingo."); });
  $("#check").click(function() { if ($("#answer").val()=="10") $.modal.show("Correct!"); });

});

