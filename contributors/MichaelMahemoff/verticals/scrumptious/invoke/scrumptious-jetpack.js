jetpack.statusBar.append({  
  html: "comments <span id='open'>open</span>",
  onReady: function() {
    doc=jetpack.tabs.focused.contentDocument;
    console.log("hello", doc);
    inject();
    $("open").onclick = function() {
      alert("hi");
    }
  },
  onxClick: function() {
    console.log(jetpack.tabs.focused.contentWindow.openScrumptiousComments);
    jetpack.tabs.focused.contentWindow.openScrumptiousComments();
  }
  /* onFocus: inject */
});  

function inject() {
    jetpack.tabs.focused.contentWindow.scrumptiousConfig = {
      // initialUI: "opener"
    }
    $.get("http://comments.boz:8080/comments/static/js/injection.js", function(script) {
      eval(script);
    });
}
