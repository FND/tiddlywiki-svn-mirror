modifier:mahemoff
scripts: _jQuery_, http://mahemoff.com/test/script.js, effects

$(function() {
  jQuery("button").click(function() { $(this).blink(); });
  // console.log("d", dojo.query("button"));
  // dojo.query("button").fadeOut().play();
});
