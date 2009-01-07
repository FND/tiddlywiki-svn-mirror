/*
  TiddlyWiki Comments Plugin - Online demo at http://tiddlyguv.org/CommentsPlugin.html

  TODO:
  - Support Cascade comment delete when the top-level tiddler is deleted
  - Support more than one <<comments>> per tiddler. This will probably entail creating an invisible root tiddler to
    hold all the comments for a macro together. The user will need to provide an ID for this tiddler.
  - Don't use global "macro" var (use "macro" param a la jquery)

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

  var cmacro = config.macros.comments = {

//##############################################################################
//# CONFIG
//##############################################################################

//################################################################################
//# MACRO INITIALISATION
//################################################################################

init: function() {
  var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
  config.shadowTiddlers["StyleSheetCommentsPlugin"] = stylesheet;
  store.addNotification("StyleSheetCommentsPlugin", refreshStyles);
},

handler: function(place,macroName,params,wikifier,paramString,tiddler) {
log(":o");
  var macroParams = paramString.parseParams();
log("dd");
	if(getParam(macroParams, "tiddler"))
  		tiddler = store.getTiddler(getParam(macroParams, "tiddler"));
log("t_", tiddler);
	  cmacro.buildCommentsArea(tiddler, place, macroParams);

log("c_",tiddler.title);
  cmacro.refreshComments(store.getTiddler(tiddler.title).commentsEl, tiddler, macroParams, place);
  // var macroParams = macroParams.parsemacroParams(null, "val", true);
},

//################################################################################
//# MACRO VIEW - RENDERING COMMENTS
//################################################################################

buildCommentsArea: function(rootTiddler, place, macroParams) {
  var suffix = "_" + rootTiddler.title.trim();
  var commentsArea = createTiddlyElement(place, "div", null, "comments");
  // var heading = createTiddlyElement(commentsArea, "h2", null, "", "Comments");
  var comments = createTiddlyElement(commentsArea, "div", null, "");

  store.getTiddler(rootTiddler.title).commentsEl = comments;

  createTiddlyElement(commentsArea, "div");
  var newCommentArea = createTiddlyElement(commentsArea, "div", null, "newCommentArea", "New comment:");
  var newCommentEl = cmacro.makeTextArea(newCommentArea, macroParams);
  var addComment = createTiddlyElement(newCommentArea, "button", null, "addComment", "Add Comment");
  addComment.onclick = function() {
    var comment = cmacro.createComment(newCommentEl.value, rootTiddler, macroParams); 
    newCommentEl.value = "";
  };
},

makeTextArea: function(container, macroParams) {
  var textArea = createTiddlyElement(container, "textarea");
  textArea.rows = getParam(macroParams, "textRows") || 4;
  textArea.cols = getParam(macroParams, "textCols") || 20;
  textArea.value = getParam(macroParams, "text") || "";
  return textArea;
},

refreshComments: function(daddyCommentsEl, tiddler, macroParams, place) {

  var refreshedEl;
  if (tiddler.fields.daddy) {
    var commentEl = cmacro.buildCommentEl(daddyCommentsEl, tiddler, macroParams);
    daddyCommentsEl.appendChild(commentEl);
    refreshedEl = commentEl;
  } else {
    removeChildren(daddyCommentsEl);
    refreshedEl = store.getTiddler(tiddler.title);
  }
var count = 0;
  prev=null;
  for (var child = store.getTiddler(tiddler.fields.firstchild); child; child = store.getTiddler(child.fields.nextchild)) {
     if (prev==child) {
        // macro.log(prev, child, "breaking");
        break;
      }
console.log(count++);
     cmacro.refreshComments(refreshedEl.commentsEl, child, macroParams);
     prev = child;
  }

},


countComments : function(tiddlerTitle) {

/*
	var tiddler = store.getTiddler(tiddlerTitle);
	var count = 0;
	  prev=null;
	  for (var child = store.getTiddler(tiddler.fields.firstchild); child; child = store.getTiddler(child.fields.nextchild)) {
	     if (prev==child) {
	     // macro.log(prev, child, "breaking");
	        break;
	      }
		count++;
 		//	cmacro.countComments(child.title);
	     prev = child;
	}
	return count;
	
*/
return 1;
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
      cmacro.deleteTiddlerAndDescendents(comment);
      commentEl.parentNode.removeChild(commentEl);
    }
  };

  // TEXT
  commentEl.text = createTiddlyElement(commentEl, "div", null, "commentText");
  wikify(comment.text, commentEl.text);

  // REPLY LINK
  var replyLinkZone = createTiddlyElement(commentEl, "div", null, "replyLinkZone");
  //var replyLink = createTiddlyElement(replyLinkZone, "span", null, "replyLink", "reply to this comment");
 // replyLink.onclick = function() { cmacro.openReplyLink(comment, commentEl, replyLink, macroParams); };

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

  var replyText =  cmacro.makeTextArea(commentEl.replyEl, macroParams)
  var submitReply =  createTiddlyElement(commentEl.replyEl, "button", null, null, "Reply");
  submitReply.onclick = function() { 
    var newComment = cmacro.createComment(replyText.value, commentTiddler, macroParams);
    replyText.value = "";
    closeNewReply.onclick();
    cmacro.refreshComments(commentEl.commentsEl, newComment, macroParams);
  };

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

  // macro.copyFields(daddy, newComment,
  // "server.bag", "server.host", /* "server.page.revision",*** "server.type", "server.workspace");
  var fieldsParam = getParam(macroParams, "fields") || "";
  var fields = fieldsParam.decodeHashMap();
  // macro.log("fields", fields);
  // macro.log(getParam(macroParams, "inheritedFields"));
  var inheritedFields = (getParam(macroParams, "inheritedFields") || "").split(",");
  // macro.log("inheritedFields", inheritedFields);
  cmacro.forEach(inheritedFields, function(field) {
    // macro.log("inherited", field);
    if (field!="") fields[field] = daddy.fields[field];
  });
  var tagsParam = getParam(macroParams, "tags") || "comment";

  var now = new Date();
  newComment.set(null, text, config.options.txtUserName, now, tagsParam.split(","), now, fields);
  // macro.copyFields(daddy, newComment, (getParam(macroParams, "inheritedFields") || "").split(","));

  newComment.fields.daddy = daddy.title;
	store.saveTiddler(newComment.title, newComment.title,  text, config.options.txtUserName, now,tagsParam.split(","),merge(config.defaultCustomFields, fields));

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

  store.saveTiddler(newComment.title);
  store.saveTiddler(daddy.title);
  autoSaveChanges(false);
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
    cmacro.deleteTiddlerAndDescendents(child, false);
    child = nextchild;
  }

  store.deleteTiddler(tiddler.title);
  if (doAutoSave) autoSaveChanges(false); // Should only apply to top level
},

//##############################################################################
//# COLLECTION CLOSURES
//##############################################################################

forEach: function(list, visitor) { for (var i=0; i<list.length; i++) visitor(list[i]); },
select: function(list, selector) { 
  var selection = [];
  cmacro.forEach(list, function(currentItem) {
    if (selector(currentItem)) { selection.push(currentItem); }
  });
  return selection;
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

//##############################################################################
//# GENERAL UTILS
//##############################################################################

// callers may replace this with their own ID generation algorithm
createCommentTiddler: function() {
  if (!store.createGuidTiddler) return store.createTiddler("comment_"+((new Date()).getTime()));
  return store.createGuidTiddler("comment_");
},

log: function() { if (console && console.firebug) console.log.apply(console, arguments); },

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

.comment { padding: 0 0 1em 0; margin: 1em 0 0; }
.comment .comment { margin 0; }
.comment .toolbar .button { border: 0; color: #9a4; }
.comment .heading { background: [[ColorPalette::PrimaryPale]]; color: [[ColorPalette::PrimaryDark]]; border-bottom: 1px solid [[ColorPalette::PrimaryLight]]; border-right: 1px solid [[ColorPalette::PrimaryLight]]; padding: 0.15em; height: 1.3em; }
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

  cmacro.init();

} // end of 'install only once'
/*}}}*/
