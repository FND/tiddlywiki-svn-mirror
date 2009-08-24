(function($) {
  $.modal = {}
  $.modal.show  = function(message) {

    // http://fnd.lewcid.org/blog/archive/109
    $.fn.push = function(html) { return this.append(html).children(":last"); };

    console.log("mes", message);
    var DIALOG_WIDTH = 400;
    var DIALOG_HEIGHT = 300;
    $("<div/>")
    .css({
      position: "absolute", top: 0, left: 0,
      background: "#000",
      zIndex: 999998,
      height: $(window).height(),
      width: $(window).width(),
    })
    .push("<div/>")
      .css({
        position: "absolute",
        background: "#fff",
        width: DIALOG_WIDTH,
        height: DIALOG_HEIGHT,
        zIndex: 999999,
        top: $(window).height()/2-DIALOG_HEIGHT/2,
        left: $(window).width()/2-DIALOG_WIDTH/2
      })
      .html(message)
    .end()
    .appendTo($(document.body));

    console.log(DIALOG_HEIGHT);
    console.log(DIALOG_WIDTH);
    console.log("done");
  }
})(jQuery);
console.log("aa",$.modal);
