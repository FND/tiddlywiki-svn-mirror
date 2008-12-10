/*
  TiddlyWiki Comments Plugin - Online demo at http://tiddlyguv.org/CommentsPlugin.html

  TODO:
  - Support Cascade comment delete when the top-level tiddler is deleted

*/

/***
|Name|CommentsPlugin|
|Description|Macro for nested comments, where each comment is a separate tiddler.|
|Source|http://tiddlyguv.org/CommentsPlugin.html#CommentsPlugin|
|Documentation|http://tiddlyguv.org/CommentsPlugin.html#CommentsPluginInfo|
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

/*{{{*/
if(!version.extensions.CommentsPlugin) {

  version.extensions.CommentsPlugin = {installed:true};

  var macro = config.macros.comments = {



init: function() {
  var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
  config.shadowTiddlers["StyleSheetCommentsPlugin"] = stylesheet;
  store.addNotification("StyleSheetCommentsPlugin", refreshStyles);
},

handler: function(place,macroName,params,wikifier,paramString,tiddler) {
  macro.log(paramString);
  var macroParams = paramString.parseParams();
  macro.buildCommentsArea(tiddler, place, macroParams);
  macro.refreshComments(story.getTiddler(tiddler.title).commentsEl, tiddler, macroParams);
  // var macroParams = macroParams.parsemacroParams(null, "val", true);
},


buildCommentsArea: function(rootTiddler, place, macroParams) {
  var suffix = "_" + rootTiddler.title.trim();
  var commentsArea = createTiddlyElement(place, "div", null, "comments");
  // var heading = createTiddlyElement(commentsArea, "h2", null, "", "Comments");
  var comments = createTiddlyElement(commentsArea, "div", null, "");
  story.getTiddler(rootTiddler.title).commentsEl = comments;
  createTiddlyElement(commentsArea, "div");
  var newCommentArea = createTiddlyElement(commentsArea, "div", null, "newCommentArea", "");
  var newCommentEl = macro.makeTextArea(newCommentArea, macroParams);
	createTiddlyElement(newCommentArea, "br");
  var addComment = createTiddlyElement(newCommentArea, "button", null, "addComment", "Add Comment");
  addComment.onclick = function() {
    var comment = macro.createComment(newCommentEl.value, rootTiddler, macroParams); 
    newCommentEl.value = "";
  };
},

makeTextArea: function(container, macroParams) {
  var textArea = createTiddlyElement(container, "textarea");
  textArea.rows = getParam(macroParams, "textRows") || 4;
  textArea.cols = getParam(macroParams, "textCols") || 20;
  textArea.value = getParam(macroParams, "text") || "";
  if(!isLoggedIn()) {
	textArea.onclick = function() {
		config.macros.comments.showLogin();
	}
  }
  return textArea;
},


showLogin : function() {
	setStylesheet(
	"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
	"html > body > #backstageCloak {height:"+window.innerHeight*2+"px;}"+
	"#errorBox {border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
	var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
	box.style.position = 'absolute';
	box.style.width= "800px";
	var img = createTiddlyElement(box, "img");
	wikify("<<tiddler Login>>", box);
	ccTiddlyAdaptor.center(box);
	ccTiddlyAdaptor.showCloak();
},

refreshComments: function(daddyCommentsEl, tiddler, macroParams) {

  var refreshedEl;
  if (tiddler.fields.daddy) {
    var commentEl = macro.buildCommentEl(daddyCommentsEl, tiddler, macroParams);
    daddyCommentsEl.appendChild(commentEl);
    refreshedEl = commentEl;
  } else {
    removeChildren(daddyCommentsEl);
    refreshedEl = story.getTiddler(tiddler.title);
  }

  prev=null;
  for (var child = store.getTiddler(tiddler.fields.firstchild); child; child = store.getTiddler(child.fields.nextchild)) {
     if (prev==child) {
        macro.log(prev, child, "breaking");
        break;
      }
     macro.refreshComments(refreshedEl.commentsEl, child, macroParams);
     prev = child;
  }

},

buildCommentEl: function(daddyCommentsEl, comment, macroParams) {

  // COMMENT ELEMENT
  var commentEl = document.createElement("div");
  commentEl.className = "comment";

  // HEADING <- METAINFO AND DELETE
  var headingEl = createTiddlyElement(commentEl, "div", null, "heading");

  var metaInfoEl = createTiddlyElement(headingEl, "div", null, "commentTitle",  comment.modifier + '@' + comment.modified.formatString(getParam(macroParams,"dateFormat") || "DDD, MMM DDth, YYYY hh12:0mm:0ss am"));
  metaInfoEl.onclick = function() { 
    // story.closeAllTiddlers();
    story.displayTiddler("top", comment.title, null, true);
    // document.location.hash = "#" + comment.title;
  };

  var deleteEl = createTiddlyElement(headingEl, "div", null, "deleteComment", "X");
  deleteEl.onclick = function() {
    if (true || confirm("Delete this comment and all of its replies?")) {
      macro.deleteTiddlerAndDescendents(comment);
      commentEl.parentNode.removeChild(commentEl);
    }
  };

  // TEXT
  commentEl.text = createTiddlyElement(commentEl, "div", null, "commentText");
  wikify(comment.text, commentEl.text);

  // REPLY LINK
  var replyLinkZone = createTiddlyElement(commentEl, "div", null, "replyLinkZone");
  var replyLink = createTiddlyElement(replyLinkZone, "span", null, "replyLink", "reply to this comment");
  replyLink.onclick = function() { macro.openReplyLink(comment, commentEl, replyLink, macroParams); };

  // var clearance = createTiddlyElement(commentEl, "clearance", null, "clearance");
  // clearance.innerHTML = "&nbsp;";

  // COMMENTS AREA
  commentEl.commentsEl = createTiddlyElement(commentEl, "div", null, "comments");

  // RETURN
  return commentEl;

},

openReplyLink: function(commentTiddler, commentEl, replyLink, macroParams) {
  if (commentEl.replyEl) {
    commentEl.replyEl.style.display = "block";
    return;
  }

  commentEl.replyEl = document.createElement("div");
  commentEl.replyEl.className = "reply";

  replyLink.style.display = "none";
  var newReplyHeading = createTiddlyElement(commentEl.replyEl, "div", null, "newReply");
  createTiddlyElement(newReplyHeading, "div", null, "newReplyLabel", "New Reply:");
  var closeNewReply = createTiddlyElement(newReplyHeading, "div", null, "closeNewReply", "close");
  closeNewReply.onclick = function() {
    commentEl.replyEl.style.display = "none";
    replyLink.style.display = "block";
  };

  var replyText =  macro.makeTextArea(commentEl.replyEl, macroParams)
  var submitReply =  createTiddlyElement(commentEl.replyEl, "button", null, null, "Reply");
  submitReply.onclick = function() { 
    var newComment = macro.createComment(replyText.value, commentTiddler, macroParams);
    replyText.value = "";
    closeNewReply.onclick();
    macro.refreshComments(commentEl.commentsEl, newComment, macroParams);
  };

  commentEl.insertBefore(commentEl.replyEl, commentEl.commentsEl);
},


createComment: function(text, daddy, macroParams) {

  var newComment = macro.createCommentTiddler();// store.createTiddler(macro.generateCommentID());

  // macro.copyFields(daddy, newComment,
  // "server.bag", "server.host", /* "server.page.revision",*** "server.type", "server.workspace");
  var fieldsParam = getParam(macroParams, "fields") || "";
  var fields = fieldsParam.decodeHashMap();
  macro.log("fields", fields);
  macro.log(getParam(macroParams, "inheritedFields"));
  var inheritedFields = (getParam(macroParams, "inheritedFields") || "").split(",");
  macro.log("inheritedFields", inheritedFields);
  macro.forEach(inheritedFields, function(field) {
    macro.log("inherited", field);
    if (field!="") fields[field] = daddy.fields[field];
  });
  var tagsParam = getParam(macroParams, "tags") || "comment";

  var now = new Date();
  newComment.set(null, text, config.options.txtUserName, now, tagsParam.split(","), now, fields);
  // macro.copyFields(daddy, newComment, (getParam(macroParams, "inheritedFields") || "").split(","));

  newComment.fields.daddy = daddy.title;

  // macro.copyFields(daddy, newComment,
    // "server.bag", "server.host", /* "server.page.revision", */"server.type", "server.workspace");

  if (!daddy.fields.firstchild) {
    daddy.fields.firstchild = newComment.title;
  } else {
    for (last = store.getTiddler(daddy.fields.firstchild); last.fields.nextchild; last = store.getTiddler(last.fields.nextchild))
      {}
    last.fields.nextchild = newComment.title;
    store.saveTiddler(last.title);
  }

 newComment.fields['server.type'] = config.defaultCustomFields['server.type'];
 newComment.fields['server.workspace'] = config.defaultCustomFields['server.workspace'];
 newComment.fields['server.host'] = config.defaultCustomFields['server.host'];

 store.saveTiddler(newComment.title);

store.saveTiddler(daddy.title);
  autoSaveChanges(true);
  return newComment;
},

deleteTiddlerAndDescendents: function(tiddler, doAutoSave) {
  doAutoSave = (arguments.length==1 || doAutoSave);

  var daddy = store.getTiddler(tiddler.fields.daddy);
  if (daddy.fields.firstchild==tiddler.title) {
    tiddler.fields.nextchild ? daddy.fields.firstchild = tiddler.fields.nextchild :
                        delete daddy.fields.firstchild;
    store.saveTiddler(daddy.title);
  } else {
    for (prev = store.getTiddler(daddy.fields.firstchild); prev.fields.nextchild!=tiddler.title; prev = store.getTiddler(prev.fields.nextchild))
      {}
    tiddler.fields.nextchild ? prev.fields.nextchild = tiddler.fields.nextchild :
                               delete prev.fields.nextchild;
    store.saveTiddler(prev.title);
  }

    var child = store.getTiddler(tiddler.fields.firstchild);
  while (child) {
    var nextchild = store.getTiddler(child.fields.nextchild);
    macro.deleteTiddlerAndDescendents(child, false);
    child = nextchild;
  }

  store.deleteTiddler(tiddler.title);
  if (doAutoSave) autoSaveChanges(false); // Should only apply to top level
},


forEach: function(list, visitor) { for (var i=0; i<list.length; i++) visitor(list[i]); },
select: function(list, selector) { 
  var selection = [];
  macro.forEach(list, function(currentItem) {
    if (selector(currentItem)) { selection.push(currentItem); }
  });
  return selection;
},
map: function(list, mapper) { 
  var mapped = [];
  macro.forEach(list, function(currentItem) { mapped.push(mapper(currentItem)); });
  return mapped;
},
remove: function(list, unwantedItem) {
  return macro.select(list,
        function(currentItem) { return currentItem!=unwantedItem; });
},


// callers may replace this with their own ID generation algorithm
createCommentTiddler: function() {
  if (!store.createGuidTiddler) return store.createTiddler("comment_"+((new Date()).getTime()));
  return store.createGuidTiddler("comment_");
},

log: function() { if (console && console.firebug) console.log.apply(console, arguments); },


copyFields: function(fromTiddler, toTiddler, field1, field2, fieldN) {
  for (var i=2; i<arguments.length; i++) {
    fieldKey = arguments[i];
    if (fromTiddler.fields[fieldKey]) toTiddler.fields[fieldKey] = fromTiddler.fields[fieldKey];
  }
}

}


/***
!StyleSheet

.comments h1 { margin-bottom: 0; padding-bottom: 0; }
.comments { padding: 0; }
.comment .comments { margin-left: 1em; }

.comment { padding: 0 0 1em 0; margin: 1em 0 0; }
.comment .comment { margin 0; }
.comment .toolbar .button { border: 0; color: #9a4; }
.comment .heading { background: [[ColorPalette::PrimaryPale]]; color: [[ColorPalette::PrimaryDark]]; border-bottom: 1px solid [[ColorPalette::PrimaryLight]]; border-right: 1px solid [[ColorPalette::PrimaryLight]]; padding: 0.15em; height: 1.3em; color:[[ColorPalette::Background]]}
.commentTitle { float: left; }
.commentTitle:hover { text-decoration: underline; cursor: pointer; }
.commentText { clear: both; padding: 1em 0; }
.deleteComment { float: right; cursor: pointer; text-decoration:underline; color:[[ColorPalette::SecondaryDark]]; padding-right: 0.3em; }
.comment .reply { margin-left: 1em; }
.comment .replyLink { color:[[ColorPalette::SecondaryDark]]; font-style: italic; 
                     cursor: pointer; text-decoration: underline; margin: 0 0.0em; }
.comment .created { }
.comment .newReply { color:[[ColorPalette::SecondaryDark]]; margin-top: 1em; }
.newReplyLabel { float: left; }
.closeNewReply { cursor: pointer; float: right; text-decoration: underline; }
.comments textarea { width: 100%; }
.comments button { margin-top: 0.3em; }

.clearance { clear: both; }

!(end of StyleSheet)

***/

  macro.init();

} // end of 'install only once'
/*}}}*/