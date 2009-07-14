(function() {

var scrumptiousURL = "http://comments.boz:8080/comments/static/index.html?pageURL="+encodeURIComponent(window.location.href);

document.body.style.padding = "0";
document.body.style.margin = "0";

var style = document.createElement("style");
style.innerHTML = "#scrumptiousToolbar a, .scrumptiousToolbar a:visited, .scrumptiousToolbar a:hover, .pseudolink { cursor: pointer; backgroundColor: white; color: #00b; text-decoration: underline; }";
document.body.appendChild(style);

function $(id) {
  return document.getElementById(id);
}

function removeEl(id) {
  var unwanted = $(id);
  if (unwanted) unwanted.parentNode.removeChild(unwanted);
}

function openOpener() {
  removeEl("scrumptiousComments");
  var opener = document.createElement("div");
  opener.id = "scrumptiousOpener";
  opener.style.color = "#00b";
  opener.style.background = "#fff";
  opener.style.borderRight = opener.style.borderBottom = "1px solid #888";
  opener.style.lineHeight="1em";
  opener.innerHTML = "c<br/>o<br/>m<br/>m<br/>e<br/>n<br/>t<br/>s<br/>&#187;";
  opener.style.cursor = "pointer";
  opener.onclick = openComments;
  opener.style.width = "1.5em";
  opener.style.paddingLeft = "0.25em";
  opener.style.height = "9em";
  opener.style.fontFamily = "fixed";
  opener.style.textAlign = "center";
  opener.style.position = "absolute";
  opener.style.top = "0";

  opener.style.opacity = "0.25";
  opener.onmouseover = function() {
    opener.style.opacity = "0.8";
  }
  opener.onmouseout = function() {
    opener.style.opacity = "0.25";
  }

  document.body.appendChild(opener);
}

function openComments() {
  removeEl("scrumptiousOpener");

  var overlay=document.createElement("div");
  overlay.id="scrumptiousComments";
  document.body.insertBefore(overlay, document.body.firstChild);
  overlayHeight=(document.height>1024 ? document.height:1024);
  // overlay.style.height=overlayHeight+"px";
  overlay.style.height=overlayHeight+"px";

  overlay.style.backgroundColor = "#fff";

  overlay.style.zIndex = "999999";
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

  var toolbar = document.createElement("div");
  toolbar.id = "scrumptiousToolbar";
  toolbar.style.padding = "5px 0.4em 5px 0.4em";

  var full = document.createElement("div");
  full.innerHTML = "<a target='scrumptousFull' href='"+scrumptiousURL+"'>launch&nbsp;full&nbsp;page</a>";
  full.style.width="100px";
  full.style.cssFloat="left";
  // full.style.color="blue";
  toolbar.appendChild(full);

  var close = document.createElement("div");
  close.innerHTML="&#171; close";
  close.style.cssFloat = "right";
  close.style.color = "#00b";
  close.style.textDecoration = "underline";
  close.style.cursor = "pointer";
  close.onclick = openOpener;
  toolbar.appendChild(close);
  overlay.appendChild(toolbar);

  var iframe=document.createElement("iframe");
  iframe.style.borderWidth="0";
  iframe.src=scrumptiousURL;
  iframe.style.width="100%";
  iframe.style.height=(overlayHeight-30)+"px";
  // iframe.style.height=(document.height-20)+"px";
  overlay.appendChild(iframe);
}

openOpener();
scroll(0,0)

window.openScrumptiousComments = openComments;

})();
