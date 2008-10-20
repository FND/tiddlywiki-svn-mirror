
/*
TODO 
  AND should refactor buld sequence - no longer need to pass in daddycommentsfield

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

/* TODO 
  Don't autosavechanges on each delete recursion - create an outside wrapper fn
  Cascade comment delete when the top-level tiddler is deleted
*/

//##############################################################################
//# CONFIG
//##############################################################################

DATE_FORMAT = "DDD, MMM DDth, YYYY hh12:0mm:0ss am";

//##############################################################################
//# COLLECTION CLOSURES
//##############################################################################

function forEach(list, visitor) { for (var i=0; i<list.length; i++) visitor(list[i]); }
function select(list, selector) { 
  var selection = [];
  forEach(list, function(currentItem) {
    if (selector(currentItem)) { selection.push(currentItem); }
  });
  return selection;
}
function map(list, mapper) { 
  var mapped = [];
  forEach(list, function(currentItem) { mapped.push(mapper(currentItem)); });
  return mapped;
}

function remove(list, unwantedItem) {
  return select(list,
        function(currentItem) { return currentItem!=unwantedItem; });
}

//##############################################################################
//# TIDDLYWIKI UTILS
//##############################################################################

function copyFields(fromTiddler, toTiddler, field1, field2, fieldN) {
  for (var i=2; i<arguments.length; i++) {
    fieldKey = arguments[i];
    toTiddler.fields[fieldKey] = fromTiddler.fields[fieldKey];
  }
}

//################################################################################
//# RELATIONSHIP MANAGEMENT
//#
//# This establishes a tree model for a collection of tiddlers. Each tiddler in the
//# tree always has three properties: "daddy", "children", and "root"). ("daddy"
//# is used because "parent" is already overloaded in web-based Javascript to mean
//# the parent frame.) The relationships are persisted using the extended fields
//# model, but manipulated using direct pointers to other tiddlers (ie daddy
//# points to the daddy tiddler, children is an array of child tiddlers, and
//# root points to the root tiddler).
//# 
//# For daddy and root, the stored value
//# is the tiddler title. Or an empty string if there is none (only during
//# construction, as there should *always* be a daddy and a root - even the root
//# element has a daddy and a root - both of these point to itself, which is a
//# popular and convenient idiom in tree algorithms. For children, the value is 
//# a comma-separated list of zero or more tiddlers.
//# 
//# The functions are low-level and afford direct manipulation of the three
//# fields. No attempt is made to check integrity - the caller is responsible
//# for ensuring referenced tiddlers exist, and root, daddy, and chldren across
//# all tiddlers are consistent with each other, avoiding any circular references
//# 
//# The functions abstract away manipulation of tiddler fields. As a user of 
//# these functions, you work directly 
//# with relationship expandos -> tiddler.root, and tiddler.parent,
//# tiddler.children
//# To endow a tiddler with relationships:
//#   - load or create the tiddler from the store
//#   - call tiddler.initialiseRelationships()
//#     This will establish relationship expandos, or if it already contains
//#     that
//#       relationship data, the expandos will be populated.
//#     You can now manipulate the expandos directly.
//#   - call tiddler.serialiseRelationships() to set fields from the expandos,
//#   so the 
//#     tiddler is ready for saving. You will need to make your own arrangements 
//#     for the tiddler to be saved subsequently (e.g. call autoSaveChanges()).
//# 
//################################################################################

// Tiddler.prototype.initialiseRelationships = function() {
  // if (this.fields.daddy) return;
  // this.fields.daddy = this.fields.firstchild = this.fields.nextchild = "";
// }

//################################################################################
//# MACRO INITIALISATION
//################################################################################

config.macros.comments = {

  handler: function(place,macroName,params,wikifier,paramstring,tiddler) {
    // tiddler.initialiseRelationships();
    buildCommentsArea(tiddler, place);
    refreshCom(story.getTiddler(tiddler.title).commentsEl, tiddler);
  }

};

//################################################################################
//# MACRO VIEW - RENDERING COMMENTS
//################################################################################

function buildCommentsArea(rootTiddler, place) {
  var suffix = "_" + rootTiddler.title.trim();
  var commentsArea = createTiddlyElement(place, "div", null, "comments");
  var heading = createTiddlyElement(commentsArea, "h2", null, "", "Comments");
  var comments = createTiddlyElement(commentsArea, "div", null, "");
  story.getTiddler(rootTiddler.title).commentsEl = comments;
  createTiddlyElement(commentsArea, "div");
  var newCommentArea = createTiddlyElement(commentsArea, "div", null, "newCommentArea", "New comment:");
  var newCommentEl = createTiddlyElement(newCommentArea, "textarea");
  newCommentEl.rows = 1;
  newCommentEl.cols = 80;
  var addComment = createTiddlyElement(newCommentArea, "button", null, null, "Add Comment");
  addComment.onclick = function() {
    var comment = createComment(newCommentEl.value, rootTiddler); 
    // refreshComments(comment);
    // appendComment(comment, rootTiddler.commentsEl, newCommentArea);
    newCommentEl.value = "";
  };
}

/*
function appendComment(comment, parentEl, nextEl) {
  var commentEl = buildCommentEl(comment);
  parentEl.insertBefore(commentEl, nextEl);
}
*/
var count = 0;
function refreshCom(daddyCommentsEl, tiddler) {

  log("daddyCommentsEl", daddyCommentsEl, "refreshCom", tiddler);

  var refreshedEl;
  if (tiddler.isTagged("comment")) {
    var commentEl = buildCommentEl(daddyCommentsEl, tiddler);
    // rootTiddler.commentsEl.appendChild(commentEl);
    // log("daddy element", story.getTiddler(tiddler.fields.daddy));
    // story.getTiddler(tiddler.fields.daddy).commentsEl.appendChild(commentEl);
    daddyCommentsEl.appendChild(commentEl);
    refreshedEl = commentEl;
  } else {
    // log("render non-comment");
    removeChildren(daddyCommentsEl);
    refreshedEl = story.getTiddler(tiddler.title);
  }

   // log("start child loop for ", tiddler, "first child:", tiddler.fields.firstchild);
  prev=null;
  for (var child = store.getTiddler(tiddler.fields.firstchild); child; child = store.getTiddler(child.fields.nextchild)) {
     if (prev==child) {
        console.log(prev, child, "breaking");
        break;
      }
     // log("tiddler and child", refreshedEl, tiddler, child);
     refreshCom(refreshedEl.commentsEl, child);
     prev = child;
  }
   // log("end child loop for " + tiddler.title);

}

/*
function refreshComment(rootTiddler, comment, offsetEms) {

  var commentEl = buildCommentEl(comment);
  commentEl.style.marginLeft = offsetEms + "em";
  offsetEms += 2;
  rootTiddler.commentsEl.appendChild(commentEl);

  for (var child = store.getTiddler(rootTiddler.fields.firstchild); child; child = store.getTiddler(child.nextchild)) {
    refreshComment(rootTiddler, child, offsetEms);
  }

}
*/

function buildCommentEl(daddyCommentsEl, comment) {
  log("build", comment);

  // COMMENT ELEMENT
  var commentEl = document.createElement("div");
  commentEl.className = "comment";

  // HEADING <- METAINFO AND DELETE
  var headingEl = createTiddlyElement(commentEl, "div", null, "heading");

  var metaInfoEl = createTiddlyElement(headingEl, "div", null, "commentTitle",  comment.modifier + '@' + comment.modified.formatString(DATE_FORMAT));
  metaInfoEl.onclick = function() { 
    story.closeAllTiddlers();
    story.displayTiddler("bottom", comment.title, null, true);
    document.location.hash = "#" + comment.title;
  };

  var deleteEl = createTiddlyElement(headingEl, "div", null, "deleteComment", "X");
  deleteEl.onclick = function() {
    if (true || confirm("Delete this comment and all of its replies?")) {
      deleteTiddlerAndDescendents(comment);
      log("refreshing inside", daddyCommentsEl);
      commentEl.parentNode.removeChild(commentEl);
    }
  };

  // TEXT
  commentEl.text = createTiddlyElement(commentEl, "div", null, "commentText");
  wikify(comment.text, commentEl.text);

  // REPLY LINK
  var replyLink = createTiddlyElement(commentEl, "span", null, "replyLink", "reply to this comment");
  replyLink.onclick = function() { openReplyLink(comment, commentEl, replyLink); };

  // COMMENTS AREA - MM NEW
  commentEl.commentsEl = createTiddlyElement(commentEl, "div", null, "comments");

  // RETURN
  return commentEl;

}

function openReplyLink(commentTiddler, commentEl, replyLink) {
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

  var replyText =  createTiddlyElement(commentEl.replyEl, "textarea");
  replyText.cols = 80; replyText.rows = 1;
  var submitReply =  createTiddlyElement(commentEl.replyEl, "button", null, null, "Reply");
  submitReply.onclick = function() { 
    var newComment = createComment(replyText.value, commentTiddler);
    replyText.value = "";
    closeNewReply.onclick();
    refreshCom(commentEl.commentsEl, newComment);
  };

  commentEl.insertBefore(commentEl.replyEl, commentEl.commentsEl);
}

//################################################################################
//# MACRO MODEL - MANIPULATING TIDDLERS
//################################################################################

commentSeq = 0;
function createComment(text, daddy) {
  // var newComment =  store.createTiddler("comment"+((new Date()).getTime()));
  // var newComment =  store.saveTiddler(null, "comment"+(++commentSeq));
  var newComment =  store.createTiddler("comment"+(++commentSeq));
  var now = new Date();
  newComment.set(null, text, config.options.txtUserName, now, ["comment"], now, {});

  newComment.fields.daddy = daddy.title;
  copyFields(daddy, newComment,
    "server.bag", "server.host", "server.page.revision", "server.type", "server.workspace");

  if (!daddy.fields.firstchild) {
    daddy.fields.firstchild = newComment.title;
    log("createComment - daddy has no child");
  } else {
    for (last = store.getTiddler(daddy.fields.firstchild); last.fields.nextchild; last = store.getTiddler(last.fields.nextchild)) {}
      last.fields.nextchild = newComment.title;
  }
  // console.log(newComment.title, daddy.fields.firstchild, daddy, newComment);

  store.saveTiddler(newComment.title);
  store.saveTiddler(daddy.title);
  // autoSaveChanges(null, [daddy, newComment]);
  saveChanges(null, [daddy, newComment]);
  log("saved");
  // refreshCom(newComment);
  return newComment;
}

function deleteTiddlerAndDescendents(tiddler) {
  var daddy = store.getTiddler(tiddler.fields.daddy);
  log("delete", tiddler, tiddler.fields.daddy);
  log("daddy", daddy);
  if (daddy.fields.firstchild==tiddler.title) {
    log("deleting firstChild", daddy, tiddler);
    log("tiddler.nextchild?", tiddler.fields.nextchild);
    tiddler.fields.nextchild ? daddy.fields.firstchild = tiddler.fields.nextchild :
                        delete daddy.fields.firstchild;
    store.saveTiddler(daddy.title);
  } else {
    for (prev = store.getTiddler(daddy.fields.firstchild); prev.fields.nextchild!=tiddler.title; prev = store.getTiddler(prev.fields.nextchild))
      ;
    log("before - prev fields", prev.fields.nextchild);
    log("tiddler nxt", tiddler.fields.nextchild);
    log("deleting from prev", prev, tiddler.fields.nextchild);
    tiddler.fields.nextchild ? prev.fields.nextchild = tiddler.fields.nextchild :
                               delete prev.fields.nextchild;
    log("after - prev fields", prev.fields.nextchild);
    store.saveTiddler(prev.title);
  }

  // for (child = store.getTiddler(tiddler.fields.firstchild); child; child = store.getTiddler(child.fields.nextchild)) {
    // log("going to delete ", child);
    // deleteTiddlerAndDescendents(child);
  // }

  var child = store.getTiddler(tiddler.fields.firstchild);
  while (child) {
    var nextchild = store.getTiddler(child.fields.nextchild);
    deleteTiddlerAndDescendents(child);
    child = nextchild;
  }

  log("deleting from store", tiddler.title);
  store.deleteTiddler(tiddler.title);

  autoSaveChanges(false);
}

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

// inspired by http://svn.tiddlywiki.org/Trunk/contributors/SaqImtiaz/plugins/DropDownMenuPlugin/DropDownMenuPlugin.js, suggested by Saq Imtiaz
config.shadowTiddlers["StyleSheetCommentsPlugin"] = 
".comments h1 { margin-bottom: 0; padding-bottom: 0; }\n" +
".comments { padding: 0; }\n" +
".comment .comments { margin-left: 1em; }\n" +

".comment { padding: 0 0 1em 0; margin: 1em 0 0; }\n" +
".comment .toolbar .button { border: 0; color: #9a4; }\n" +
".comment .heading { background: #bfb; color: #040; border: 1px solid #afa; border-bottom: 1px solid #9b9; border-right: 1px solid #9b9; padding: 0.2em; height: 1.4em; }\n" +
".commentTitle { float: left; }\n" +
".commentTitle:hover { text-decoration: underline; cursor: pointer; }\n" +
".commentText { clear: both; padding: 1em 0; }\n" +
".deleteComment { float: right; cursor: pointer; text-decoration:underline; color:[[ColorPalette::SecondaryDark]]; padding-right: 0.3em; }\n" +
".comment .reply { margin-left: 1em; }\n" +
".comment .replyLink { color:[[ColorPalette::SecondaryDark]]; font-style: italic; \n" +
                      "cursor: pointer; text-decoration: underline; margin: 0 0.0em; }\n" +
".comment .created { }\n" +
".comment .newReply { color:[[ColorPalette::SecondaryDark]]; margin-top: 1em; }\n" +
".newReplyLabel { float: left; }\n" +
".closeNewReply { cursor: pointer; float: right; text-decoration: underline; }\n" +
".comments textarea { width: 100%; }\n";

/*
".comments h1 { margin-bottom: 0; padding-bottom: 0; }\n" +
".comments { padding: 0; }\n" +
".comment .comments { margin-left: 1em; }\n" +

".comment { background: #fcf; border: 1px solid #f9f; padding: 0.3em 0.6em 1em 0.3em; margin: 1em 0 0; }\n" +
".comment .toolbar .button { border: 0; color: #9a4; }\n" +
".commentTitle { font-size: 1em; opacity: 0.6; filter: alpha(opacity=60); float: left; }\n" +
".commentTitle:hover { text-decoration: underline; cursor: pointer; }\n" +
".commentText { clear: both; }\n" +
".deleteComment { float: right; cursor: pointer; text-decoration:underline; color:[[ColorPalette::SecondaryDark]]; }\n" +
".comment .reply { margin-left: 1em; }\n" +
".comment .replyLink { color:[[ColorPalette::SecondaryDark]]; font-style: italic; \n" +
                      "cursor: pointer; text-decoration: underline; margin: 0 auto; }\n" +
".comment .created { }\n" +
".comment .newReply { color:[[ColorPalette::SecondaryDark]]; margin-top: 1em; }\n" +
".newReplyLabel { float: left; }\n" +
".closeNewReply { cursor: pointer; float: right; text-decoration: underline; }\n" +
".comments textarea { width: 100%; }\n";
*/
store.addNotification("StyleSheetCommentsPlugin", refreshStyles);

function log() { console.log.apply(null, arguments); }
// function log() { alert(arguments.join(" ")); }
