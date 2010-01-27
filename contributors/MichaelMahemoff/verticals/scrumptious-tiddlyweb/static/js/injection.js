(function() {

var utils = {

  registerClick: function(el, callback) {
    (typeof(jQuery)=="undefined") ? (el.onclick=callback) : jQuery(el).click(callback);
  },

  registerMouseOver: function(el, callback) {
    (typeof(jQuery)=="undefined") ? (el.onmouseover=callback) : jQuery(el).mouseover(callback);
  },

  registerMouseOut: function(el, callback) {
    (typeof(jQuery)=="undefined") ? (el.onmouseout=callback) : jQuery(el).mouseout(callback);
  },

  create: function(nodeType) {
    return utils.getDocument().createElement(nodeType);
  },

  removeEl: function(id) {
    var unwanted = utils.getDocument().getElementById(id);
    if (unwanted) unwanted.parentNode.removeChild(unwanted);
  },

  applyStyle: function() {
    var style = utils.create("style");
    style.innerHTML = "body { margin: 0; padding: 0; } #scrumptiousToolbar a, .scrumptiousToolbar a:visited, .scrumptiousToolbar a:hover, .pseudolink { cursor: pointer; backgroundColor: white; color: #00b; text-decoration: underline; }";
    utils.getDocument().body.appendChild(style);
  },

  getDocument: function() {
    return typeof(document)=="undefined" ? jetpack.tabs.focused.contentDocument : document;
  },

  getWindow: function() {
    return (typeof(window)=="undefined") ? jetpack.tabs.focused.contentWindow : window;
  },

  scrollToTop: function() {
    utils.getWindow().scroll(0,0)
  }

};

var injector = {

  init: function(id) {
    injector.scrumptiousURL = "http://comments.boz:8080/comments/static/index.html?pageURL="+encodeURIComponent(location.href);
    utils.applyStyle();

    var win = utils.getWindow();
    if (win.scrumptiousConfig && win.scrumptiousConfig.initialUI) {
      if (win.scrumptiousConfig.initialUI=="opener") {
        injector.openOpener();
      } else if (win.scrumptiousConfig.initialUI=="comments") {
        injector.openComments();
      }
    }

    utils.scrollToTop();

    utils.getWindow().openScrumptiousComments = injector.openComments;

  },

  openOpener: function() {
    utils.removeEl("scrumptiousComments");
    var opener = utils.create("div");
    opener.style.zIndex = "2147483600";
    opener.id = "scrumptiousOpener";
    opener.style.color = "#00b";
    opener.style.background = "#fff";
    opener.style.borderRight = opener.style.borderBottom = "1px solid #888";
    opener.style.lineHeight="1em";
    // injector.openOpener();
    opener.innerHTML = "c<br/>o<br/>m<br/>m<br/>e<br/>n<br/>t<br/>s<br/>&#187;";
    opener.style.cursor = "pointer";
    // $(opener).click(function() { doc.body.style.backgroundColor="orange"; });
    // opener.onclick = injector.openComments; // WHY?????
    // opener.setAttribute("onclick", injector.openComments); // WHY?????
    utils.registerClick(opener, injector.openComments);
    opener.style.width = "1.5em";
    opener.style.paddingLeft = "0.25em";
    opener.style.height = "9em";
    opener.style.fontFamily = "fixed";
    opener.style.textAlign = "center";
    opener.style.position = "absolute";
    opener.style.top = "0";
    opener.style.opacity = "0.25";
    utils.registerMouseOver(opener, function() { opener.style.opacity = "0.8"; });
    utils.registerMouseOut(opener, function() { opener.style.opacity = "0.25"; });

    utils.getDocument().body.appendChild(opener);
  },

  openComments: function() {
    var doc = utils.getDocument();
    utils.removeEl("scrumptiousOpener");

    var overlay=utils.create("div");
    overlay.id="scrumptiousComments";
    doc.body.insertBefore(overlay, doc.body.firstChild);
    overlayHeight=(doc.height>1024 ? doc.height:1024);
    // overlay.style.height=overlayHeight+"px";
    overlay.style.height=overlayHeight+"px";

    overlay.style.backgroundColor = "#fff";

    overlay.style.zIndex = "2147483600";
    overlay.style.width="350px";
    overlay.style.overflowY="visible";

    overlay.style.position="absolute";
    overlay.style.left="0";
    overlay.style.top="0";
    // overlay.style.bottom="-20px";

    overlay.style.opacity="0.95";
    overlay.style.margin="0px";
    // overlay.style.marginRight="20px";
    overlay.style.borderWidth="0";
    overlay.style.borderRight="1px solid #888";

    var toolbar = utils.create("div");
    toolbar.id = "scrumptiousToolbar";
    toolbar.style.padding = "5px 0.4em 5px 0.4em";

    var full = utils.create("div");
    full.innerHTML = "<a target='scrumptousFull' href='"+injector.scrumptiousURL+"'>launch&nbsp;full&nbsp;page</a>";
    full.style.width="100px";
    full.style.cssFloat="left";
    // full.style.color="blue";
    toolbar.appendChild(full);

    var close = utils.create("div");
    close.innerHTML="&#171; close";
    close.style.cssFloat = "right";
    close.style.color = "#00b";
    close.style.textDecoration = "underline";
    close.style.cursor = "pointer";
    utils.registerClick(close, injector.openOpener);
    toolbar.appendChild(close);
    overlay.appendChild(toolbar);

    var iframe=utils.create("iframe");
    iframe.style.borderWidth="0";
    iframe.src=injector.scrumptiousURL;
    iframe.style.width="100%";
    iframe.style.height=(overlayHeight-30)+"px";
    // iframe.style.height=(doc.height-20)+"px";
    overlay.appendChild(iframe);
  }

}

function log() {
  if (console) console.log.apply(console, arguments);
}
// jetpack.tabs.focused.contentWindow.scroll(0,0)

injector.init();

})();
