(function($) {
  $.modal = {}
  $.modal.show  = function(message) {

    $.fn.push = function(html) { return this.append(html).children(":last"); };

    var DIALOG_WIDTH = 400;
    var DIALOG_HEIGHT = 300;
    var CUSHION_LENGTH = 20000;
    $("<div/>") // Black mask
    .css({
      position: "absolute",
      top: -CUSHION_LENGTH,
      left: -CUSHION_LENGTH,
      background: "#000",
      zIndex: 999998,
      height: 2*CUSHION_LENGTH+$(window).height(),
      width: 2*CUSHION_LENGTH+$(window).width()
    })
    .click(function() {
      $(this).remove();
    })
    .push("<div/>")
      .css({
        position: "absolute",
        background: "#fff",
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
    .end()
    .appendTo($(document.body));

  }
})(jQuery);
