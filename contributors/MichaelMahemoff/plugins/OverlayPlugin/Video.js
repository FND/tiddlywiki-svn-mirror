/*
!Content
<p>A video demo</p>
<video controls="controls" src="http://tinyvid.tv/file/7prvuge6arom.ogg"></video>
<p><button id="closeOverlay">close</button></p>
!StyleSheet
video { width: 500px; height: 400px; }
!Code
*/
config.Video = {
  onLoad: function() {
    jQuery("#closeOverlay").click(version.extensions.overlay.toggle);
  },
  onOpen: function() { (jQuery("video").get(0).play()); },
  onClose: function() {}
}
