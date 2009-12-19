/***
|Name|specialUI|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

!StyleSheet

!Javascript
{{{
***/

(function($) {

  version.extensions.specialUI = {installed:true};

  var macro = config.macros.specialUI = {

    init: function() {
      $("select").live("change", function() {
        // $("video").attr("src", $(this).val()).get()[0].load();
        var video = $("video");
        /* SHOULD WORK BUT DOESN'T: video.src = $(this).val() video.load(); */
        $("<video autoplay='autoplay'/>").attr("src", $(this).val()).insertBefore(video);
        $("#play").html("pause");
        video.remove();
      });
      $("#play").live("click", function() {
        var video = $("video")[0];
        video.paused ? $(this).html("pause") && video.play() : $(this).html("play") && video.pause();
      });
    }

  }

})(jQuery);

/*}}}*/
