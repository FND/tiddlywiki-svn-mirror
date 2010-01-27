(function($) {

    config.macros.readyDemo = {};
    config.macros.readyDemo.ready = function () {
        for(var i=0;i<10;i++) {
            $(this).fadeOut("slow").fadeIn("slow");
        }
    };

})(jQuery);
