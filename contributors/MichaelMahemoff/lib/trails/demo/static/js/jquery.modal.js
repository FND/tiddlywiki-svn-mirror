(function($) {
  $.modal = {}
  $.modal.show  = function(message, options) {

    $.fn.attach = function(html) { return this.append(html).children(":last"); };

    var defaults = {
      dialogWidth: 400,
      dialogHeight: 300,
      close: function() { return $(this); }
    }
    var settings = $.extend(defaults, options);

    var CUSHION_LENGTH = 20000;
    FADE_DURATION = 500;
    var mask = $("<div/>")
      .animate({opacity: 0.85}, FADE_DURATION)
      .css({
        position: "absolute",
        top: -CUSHION_LENGTH,
        left: -CUSHION_LENGTH,
        background: "#999",
        zIndex: 9999998,
        height: 2*CUSHION_LENGTH+$(window).height(),
        width: 2*CUSHION_LENGTH+$(window).width(),
        opacity: 0.01
      })
      .click(function(ev) {
        $.modal.close(ev);
      })
      .appendTo($(document.body));

    var dialog = $("<div class='modal'/>")
      .fadeIn(FADE_DURATION)
      .css({
        position: "absolute",
        background: "#fff",
        border: "1px solid #666",
        // "-moz-border-radius": 5,
        // "-webkit-border-radius": 5,
        width: settings.dialogWidth,
        height: settings.dialogHeight,
        zIndex: 9999999,
        top: $(window.body).scrollTop()+$(window).height()/2-settings.dialogHeight/2,
        left: $(window).width()/2-settings.dialogWidth/2
      })
      .attach("<div/>")
        .css({
          margin: "10px"
        })
        .append(message)
      .end()
      .attach("<div/>")
        .css({
          position: "absolute",
          top: "-1.2em",
          right: "4px",
          cursor: "pointer"
        })
        .html("X")
        .click(function(ev) {
          $.modal.close(ev);
        })
      .end()
      .data("close", settings.close)
      .appendTo($(document.body));

    $(window.body).keyup(function(ev) { 
      if (ev.charCode==27 || ev.keyCode==27) $.modal.close(ev);
    });

    $.modal.close = function(ev) {
      if (ev) ev.stopPropagation();
      var close = dialog.data("close");
      dialog.slideUp(FADE_DURATION, function() { dialog.remove(); });
      mask.fadeOut(FADE_DURATION, function() {
        mask.remove();
        log("close", close);
        if (close) close.apply(dialog);
      });
    }
    return dialog;

  }
})(jQuery);
