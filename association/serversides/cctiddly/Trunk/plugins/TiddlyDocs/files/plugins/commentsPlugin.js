/*
  TiddlyWiki Comments Plugin - Online demo at http://tiddlyguv.org/CommentsPlugin.html

  TODO:
  - Support Cascade comment delete when the top-level tiddler is deleted
  - Don't use global "cmacro" var (use "cmacro" param a la jquery)

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

  (function() {

  var cmacro = config.macros.comments = {

//##############################################################################
//# CONFIG
//##############################################################################

//################################################################################
//# MACRO INITIALISATION
//################################################################################

init: function() {
  var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
  if (stylesheet) { // check necessary because it happens more than once for some reason
    config.shadowTiddlers["StyleSheetCommentsPlugin"] = stylesheet;
    store.addNotification("StyleSheetCommentsPlugin", refreshStyles);
  }
},

handler: function(place,macroName,params,wikifier,paramString,tiddler) {
  var macroParams = paramString.parseParams();
  cmacro.buildCommentsArea(tiddler, place, macroParams);
  cmacro.refreshCommentsFromRoot(story.getTiddler(tiddler.title).commentsEl, tiddler, macroParams);
},

//################################################################################
//# MACRO VIEW - RENDERING COMMENTS
//################################################################################

buildCommentsArea: function(rootTiddler, place, macroParams) {
  var suffixUSELESSREMOVE = "_" + rootTiddler.title.trim();
  var commentsArea = createTiddlyElement(place, "div", null, "comments");
  // var heading = createTiddlyElement(commentsArea, "h2", null, "", "Comments");
  var comments = createTiddlyElement(commentsArea, "div", null, "");
  story.getTiddler(rootTiddler.title).commentsEl = comments;
  createTiddlyElement(commentsArea, "div");
  var newCommentArea = createTiddlyElement(commentsArea, "div", null, "newCommentArea", "");
  var newCommentEl = cmacro.makeTextArea(newCommentArea, macroParams);
createTiddlyElement(newCommentArea, "br");
  var addCommentOnclick = function() {
    var comment = cmacro.createComment(newCommentEl.value, rootTiddler, macroParams); 
    newCommentEl.value = "";
    cmacro.refreshCommentsFromRoot(comments, rootTiddler, macroParams);
  };
createTiddlyButton(newCommentArea, "New Comment", "", addCommentOnclick);
},

makeTextArea: function(container, macroParams) {
  var textArea = createTiddlyElement(container, "textarea");
  textArea.rows = getParam(macroParams, "textRows") || 4;
  textArea.cols = getParam(macroParams, "textCols") || 20;
  textArea.value = getParam(macroParams, "text") || "";
  return textArea;
},

refreshCommentsFromRoot: function(daddyCommentsEl, rootTiddler, macroParams) {
  cmacro.treeifyComments(rootTiddler);
  cmacro.refreshComments.apply(null, arguments);
},

refreshComments: function(daddyCommentsEl, tiddler, macroParams) {

  var refreshedEl;
  if (tiddler.fields.daddy) {
    var commentEl = cmacro.buildCommentEl(daddyCommentsEl, tiddler, macroParams);
    // var commentEl = createTiddlyElement(daddyCommentsEl, "div", "", "", tiddler.text);
    // commentEl.commentsEl = createTiddlyElement(commentEl, "div");
    daddyCommentsEl.appendChild(commentEl);
    refreshedEl = commentEl;
  } else { // root element
    removeChildren(daddyCommentsEl);
    refreshedEl = story.getTiddler(tiddler.title);
  }

  for (var child = tiddler.firstChild; child; child = child.next) {
     cmacro.refreshComments(refreshedEl.commentsEl, child, macroParams);
  }

},

treeifyComments: function(rootTiddler) {

  var comments = cmacro.findCommentsFromRoot(rootTiddler);
  cmacro.logComments(comments);

  cmacro.forEach(comments, function(comment) {
    var prev = comment.fields.prev;
    var daddy = comment.fields.daddy;
    if (prev) {
      store.getTiddler(prev).next = comment;
    } else {
      store.getTiddler(daddy).firstChild = comment;
    }
  });

},

logComments: function(comments) {
  for (var i=0; i<comments.length; i++) {
    var comment = comments[i];
  }
},

findCommentsFromRoot: function(rootTiddler) {
  var comments = [];
  store.forEachTiddler(function(title,tiddler) {
    if (tiddler.fields.root==rootTiddler.title) comments.push(tiddler);
  });
  return comments;
},

findChildren: function(daddyTiddler) {
  var comments = [];
  store.forEachTiddler(function(title,tiddler) {
    if (tiddler.fields.daddy==daddyTiddler.title) comments.push(tiddler);
  });
  return comments;
},

refreshCommentsOld: function(daddyCommentsEl, tiddler, macroParams) {

  var refreshedEl;
  if (tiddler.fields.daddy) {
    var commentEl = cmacro.buildCommentEl(daddyCommentsEl, tiddler, macroParams);
    daddyCommentsEl.appendChild(commentEl);
    refreshedEl = commentEl;
  } else {
    removeChildren(daddyCommentsEl);
    refreshedEl = story.getTiddler(tiddler.title);
  }

  prev=null;
  for (var child = store.getTiddler(tiddler.fields.firstchild); child; child = store.getTiddler(child.fields.nextchild)) {
     if (prev==child) {
        // macro.log(prev, child, "breaking");
        break;
      }
     cmacro.refreshComments(refreshedEl.commentsEl, child, macroParams);
     prev = child;
  }

},

buildCommentEl: function(daddyCommentsEl, comment, macroParams) {

  // COMMENT ELEMENT
  var commentEl = document.createElement("div");
  commentEl.className = "comment";

  // HEADING <- METAINFO AND DELETE
  var headingEl = createTiddlyElement(commentEl, "div", null, "heading");

  var metaInfoEl = createTiddlyElement(headingEl, "div", null, "commentTitle",  comment.modifier + '@' + comment.modified.formatString(getParam(macroParams,"dateFormat") || "DDD, MMM DDth, YYYY 0hh:0mmam"));
  metaInfoEl.onclick = function() { 
    // story.closeAllTiddlers();
    story.displayTiddler("top", comment.title, null, true);
    // document.location.hash = "#" + comment.title;
  };

  var deleteEl = createTiddlyElement(headingEl, "div", null, "deleteComment", "X");
  deleteEl.onclick = function() {
    if (true || confirm("Delete this comment and all of its replies?")) {
      cmacro.deleteTiddlerAndDescendents(comment);
      commentEl.parentNode.removeChild(commentEl);
    }
  };

  // TEXT
  commentEl.text = createTiddlyElement(commentEl, "div", null, "commentText");
  wikify(comment.text, commentEl.text);

  // REPLY LINK
  var replyLinkZone = createTiddlyElement(commentEl, "div", null, "replyLinkZone");
  var replyLink = createTiddlyElement(replyLinkZone, "span", null, "replyLink", "reply to this comment");
  replyLink.onclick = function() { cmacro.openReplyLink(comment, commentEl, replyLink, macroParams); };

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


  var replyText =  cmacro.makeTextArea(commentEl.replyEl, macroParams);
  var submitReplyOnclick = function() { 
    var newComment = cmacro.createComment(replyText.value, commentTiddler, macroParams);
    replyText.value = "";
    closeNewReply.onclick();
    cmacro.refreshComments(commentEl.commentsEl, newComment, macroParams);
  };

	createTiddlyButton(commentEl.replyEl, "reply", null, submitReplyOnclick);


  commentEl.insertBefore(commentEl.replyEl, commentEl.commentsEl);
},

//################################################################################
//# RELATIONSHIP MANAGEMENT
//#
//# Children are held in a singly linked list structure.
//#
//# The root tiddler (containing comments macro) and all of its comments have
//# one or more of the following custom fields:
//#   - daddy: title of parent tiddler ("parent" is already used in DOM, hence "daddy")
//#   - firstchild: title of first child
//#   - nextchild: title of next child in the list (ie its sibling). New comments are always
//#     appended to the list of siblings at the end, if it exists.
//#
//# Iff daddy is undefined, this is the root in the hierarchy (ie it's the thing that the 
//# comments are about)
//# Iff firstchild is undefined, this tiddler has no children
//# Iff nextchild is undefined, this tiddler is the most 
//#
//# Incidentally, the only redundancy with this structure is with "daddy" field. This field exists only
//# to give the comment some context in isolation. It's redundant as it could be derived
//# from inspecting all tiddlers' firstchild and nextchild properties. However, 
//# that would be exceedingly slow, especially where the tiddlers live on a server.
//#
//################################################################################

createComment: function(text, daddy, macroParams) {

  var newComment = cmacro.createCommentTiddler();// store.createTiddler(macro.generateCommentID());
  var fieldsParam = getParam(macroParams, "fields") || "";
  var fields = fieldsParam.decodeHashMap();
  var inheritedFields = (getParam(macroParams, "inheritedFields") || "").split(",");
  cmacro.forEach(inheritedFields, function(field) {
    if (field!="") fields[field] = daddy.fields[field];
  });
  var tagsParam = getParam(macroParams, "tags") || "comment";
  var now = new Date();
  newComment.set(null, text, config.options.txtUserName, now, tagsParam.split(","), now, fields);

  var youngestSibling = cmacro.findYoungestChild(daddy)
  if (youngestSibling) newComment.fields.prev = youngestSibling.title;
  newComment.fields.daddy = daddy.title;
  newComment.fields.root = daddy.fields.root ? daddy.fields.root : daddy.title;
    // second case is the situation where daddy *is* root
  store.saveTiddler(newComment.title, newComment.title, text, config.options.txtUserName, new Date(), "", merge(newComment.fields,config.defaultCustomFields));
  autoSaveChanges();
  return newComment;
},

findYoungestChild: function(daddy) {

  var siblingCount = 0;
  var elderSiblings = cmacro.mapize(cmacro.selectTiddlers(function(tiddler) {
    isChild = (tiddler.fields.daddy==daddy.title);
    if (isChild) siblingCount++;
    return isChild;
  }));
  if (!siblingCount) return null;

  // Find the only sibling that doesn't have a prev pointing at it
  var youngestSiblings = cmacro.clone(elderSiblings) // as a starting point
  cmacro.forEachMap(elderSiblings, function(tiddler) {
    delete youngestSiblings[tiddler.fields.prev];
  });
  
  for (title in youngestSiblings) { return youngestSiblings[title]; }

},

// The recursive delete is run by a separate function (nested inside
// this one, for encapsulation purposes).
deleteTiddlerAndDescendents: function(tiddler) {

  function deleteRecursively(tiddler) {
    for (var child = tiddler.firstChild; child; child = child.next) {
      deleteRecursively(child);
    }
    store.removeTiddler(tiddler.title);
  }

  cmacro.treeifyComments(store.getTiddler(tiddler.fields.root));

  // save some info prior to deleting
  var prev = tiddler.fields.prev;
  var next = tiddler.next;

  deleteRecursively(tiddler);

  // used saved info
  if (next) {
    next.fields.prev = prev;
    story.saveTiddler(next.title);
  }

  autoSaveChanges();

},

//##############################################################################
//# COLLECTION CLOSURES
//##############################################################################

forEach: function(list, visitor) { for (var i=0; i<list.length; i++) visitor(list[i]); },
forEachMap: function(map, visitor) { for (var key in map) visitor(map[key]); },
select: function(list, selector) { 
  var selection = [];
  cmacro.forEach(list, function(currentItem) {
    if (selector(currentItem)) { selection.push(currentItem); }
  });
  return selection;
},
selectTiddlers: function(selector) { 
  var tiddlers = [];
  store.forEachTiddler(function(title, tiddler) {
    var wanted = selector(tiddler);
    if (wanted) tiddlers.push(tiddler);
  });
  return tiddlers;
},
map: function(list, mapper) { 
  var mapped = [];
  cmacro.forEach(list, function(currentItem) { mapped.push(mapper(currentItem)); });
  return mapped;
},
remove: function(list, unwantedItem) {
  return cmacro.select(list,
        function(currentItem) { return currentItem!=unwantedItem; });
},
mapize: function(tiddlerList) {
  var map = {};
  cmacro.forEach(tiddlerList, function(tiddler) { map[tiddler.title] = tiddler; });
  return map;
},
clone: function(map) { return merge({}, map); },

//##############################################################################
//# GENERAL UTILS
//##############################################################################

// callers may replace this with their own ID generation algorithm
createCommentTiddler: function() {
  if (!store.createGuidTiddler) return store.createTiddler("comment_"+((new Date()).getTime()));
  return store.createGuidTiddler("comment_");
},

log: function() { if (console && console.firebug) console.log.apply(console, arguments); },
assert: function() { if (console && console.firebug) console.assert.apply(console, arguments); },

//##############################################################################
//# TIDDLYWIKI UTILS
//##############################################################################

copyFields: function(fromTiddler, toTiddler, field1, field2, fieldN) {
  for (var i=2; i<arguments.length; i++) {
    fieldKey = arguments[i];
    if (fromTiddler.fields[fieldKey]) toTiddler.fields[fieldKey] = fromTiddler.fields[fieldKey];
  }
}

}

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet
.comments h1 { margin-bottom: 0; padding-bottom: 0; }
.comments { padding: 0; }
.comment .comments { margin-left: 1em; }
button.button {
	font-size : 1.1em;
	font-weight: bold;
}

.comment { padding: 0 0 1em 0; margin: 1em 0 0; }
.comment .comment { margin 0; }
.comment .toolbar .button { border: 0; color: #9a4; }
.comment .heading { background: [[ColorPalette::PrimaryPale]]; color: [[ColorPalette::PrimaryDark]]; border-bottom: 1px solid [[ColorPalette::PrimaryLight]]; border-right: 0px solid [[ColorPalette::PrimaryLight]]; padding: 0.15em; height: 1.3em; }
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
  })();
  config.macros.comments.init();


} // end of 'install only once'
/*}}}*/

function log() { if (console && console.firebug) console.log.apply(console, arguments); }
