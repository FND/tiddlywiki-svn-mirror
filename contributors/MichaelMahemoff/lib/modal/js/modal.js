(function($) {
  $.modal = {}
  $.modal.show  = function(message) {

    $.fn.push = function(html) { return this.append(html).children(":last"); };
    $.fn.destroy = function() { return this.fadeOut(FADE_DURATION, function() { $(this).remove(); }) }

    var DIALOG_WIDTH = 400;
    var DIALOG_HEIGHT = 300;
    var CUSHION_LENGTH = 20000;
    FADE_DURATION = 400;
    var mask = $("<div/>") // Black mask
    .animate({opacity: 0.85}, FADE_DURATION)
    .css({
      position: "absolute",
      top: -CUSHION_LENGTH,
      left: -CUSHION_LENGTH,
      background: "#999",
      zIndex: 999998,
      height: 2*CUSHION_LENGTH+$(window).height(),
      width: 2*CUSHION_LENGTH+$(window).width(),
      opacity: 0.01
    })
    .click(function(ev) {
      $(this).destroy();
      ev.stopPropagation();
    })
    .push("<div/>")
      .fadeIn(FADE_DURATION)
      .css({
        position: "absolute",
        background: "#fff",
        border: "1px solid #666",
        width: DIALOG_WIDTH,
        height: DIALOG_HEIGHT,
        zIndex: 999999,
        top: CUSHION_LENGTH+$(window.body).scrollTop()+$(window).height()/2-DIALOG_HEIGHT/2,
        left: CUSHION_LENGTH+$(window).width()/2-DIALOG_WIDTH/2
      })
      .click(function(ev) {
        ev.stopPropagation();
       })
      .push("<div/>")
        .css({
          margin: "10px",
        })
        .html(message)
      .end()
      .push("<div/>")
        .css({
          position: "absolute",
          top: "-1.2em",
          right: "4px",
          cursor: "pointer"
        })
        .html("X")
        .click(function(ev) {
          $(this).parents("div").destroy();
        })
      .end()
    .end()
    .appendTo($(document.body));

    $(window.body).keyup(function(ev) { 
      if (ev.charCode==27 || ev.keyCode==27) mask.destroy();
      ev.stopPropagation();
    });

  }
})(jQuery);
