/*
  TiddlyWiki Comments Plugin - Online demo at http://tiddlyguv.org/CommentsPlugin.html

  TODO:
  - Support Cascade comment delete when the top-level tiddler is deleted
  - Support more than one < <comments> > per tiddler. This will probably entail creating an invisible root tiddler to
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

  (function(plugin) {

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
  if (!version.extensions.CommentsPlugin.retainViewTemplate) cmacro.enhanceViewTemplate();
},

enhanceViewTemplate: function() {
  var template = config.shadowTiddlers.ViewTemplate;
  if ((/commentBreadcrumb/g).test(template)) return; // already enhanced
  var TITLE_DIV = "<div class='title' macro='view title'></div>";
  var commentsDiv = "<div class='commentBreadcrumb' macro='commentBreadcrumb'></div>";
  config.shadowTiddlers.ViewTemplate = template.replace(TITLE_DIV,commentsDiv+"\n"+TITLE_DIV);
},

handler: function(place,macroName,params,wikifier,paramString,tiddler) {
  var macroParams = paramString.parseParams();
  var tiddlerParam = getParam(macroParams, "tiddler");
  tiddler = tiddlerParam ? store.getTiddler(tiddlerParam) : tiddler;
  if (!tiddler || !store.getTiddler(tiddler.title)) return;
  cmacro.buildCommentsArea(tiddler, place, macroParams);
  // cmacro.refreshCommentsFromRoot(story.getTiddler(tiddler.title).commentsEl, tiddler, macroParams);
  cmacro.refreshCommentsFromRoot(place.commentsEl, tiddler, macroParams);
},

//################################################################################
//# MACRO VIEW - RENDERING COMMENTS
//################################################################################

buildCommentsArea: function(rootTiddler, place, macroParams) {
  var commentsArea = createTiddlyElement(place, "div", null, "comments");
  var headingEl, heading = getParam(macroParams, "heading");
  if (heading) heading = heading.replace("%c",
    config.macros.comments.findCommentsFromRoot(rootTiddler).length);
  if (heading) headingEl = createTiddlyElement(commentsArea, "h1", null, null, heading);

  var comments = createTiddlyElement(commentsArea, "div", null, "");
  place.commentsEl = comments;

    var newCommentArea;
  if (cmacro.editable(macroParams)) {
    newCommentArea = createTiddlyElement(commentsArea, "div", null, "newCommentArea", "New comment:");
    cmacro.forceLoginIfRequired(params, newCommentArea, function() {
      var newCommentEl = cmacro.makeTextArea(newCommentArea, macroParams);
      // var addComment = createTiddlyElement(newCommentArea, "button", null, "addComment button", "Add Comment");
      var addComment = createTiddlyButton(newCommentArea, "Add Comment", null, function() {
        var comment = cmacro.createComment(newCommentEl.value, rootTiddler, macroParams); 
        newCommentEl.value = "";
        cmacro.refreshCommentsFromRoot(comments, rootTiddler, macroParams);
      }, "addComment button");
    });
  }

  var expandHeading = getParam(macroParams, "expandHeading");
  if (heading && expandHeading && expandHeading.toLowerCase()=="true") {
    var $expandPrompt, expandableElements;
    var $expandables = jQuery([place.commentsEl,newCommentArea]).hide();
    jQuery(headingEl)
      .append($expandPrompt = "<span id='expandPrompt'> &raquo;</span>")
      .addClass("expander").click(function() {
        $expandables.toggle();
      });
  }

},


makeTextArea: function(container, macroParams) {
  var textArea = createTiddlyElement(container, "textarea");
  textArea.rows = getParam(macroParams, "textRows") || 4;
  textArea.cols = getParam(macroParams, "textCols") || 20;
  textArea.value = getParam(macroParams, "text") || "";
  return textArea;
},

refreshCommentsFromRoot: function(rootCommentsEl, rootTiddler, macroParams) {
  cmacro.treeifyComments(rootTiddler);
  cmacro.refreshComments(rootCommentsEl, rootTiddler, macroParams);
},

refreshComments: function(daddyCommentsEl, tiddler, macroParams) {

  var commentsEl;
  if (tiddler.fields.daddy) {
    var commentEl = cmacro.buildCommentEl(daddyCommentsEl, tiddler, macroParams);
    daddyCommentsEl.appendChild(commentEl);
    commentsEl = commentEl.commentsEl;
  } else { // root element
    removeChildren(daddyCommentsEl);
    // refreshedEl = story.getTiddler(tiddler.title);
    commentsEl = daddyCommentsEl;
  }

  for (var child = tiddler.firstChild; child; child = child.next) {
     cmacro.refreshComments(commentsEl, child, macroParams);
  }

},

// This has become more complex due to "confused comments" - multiple comments
// pointing back to the same daddy (which implies they all think they're the first
// child) or a single "2nd-last" sibling (which implies they all think they're the
// last sibling). This happens in the typical "atomic transaction 101" scenario -
// user A opens wiki, user B opens wiki, one of the users submits a comment, 
// the other user submits a comment.
//
// Normally, each comment says "make my daddy's first child be me", or "make my prev
// sibling's next sibling be me". That's how the tree gets built. But to deal
// with confused comments, we now have to check if daddy/prev is already pointing
// to something. If so, we will have to walk through the list to find the right place
// for the new item.
//
// We begin by sorting by date; if we can assume we are walking through the comments by date, 
// the confused comments will appear in the right order.
treeifyComments: function(rootTiddler) {

  // First, clear the tree data
  // We sort the comments to ensure "confused" comments
  var comments = cmacro.findCommentsFromRoot(rootTiddler).sort(function(a,b) {
    return a.modified > b.modified;
  });
  var nodes=comments.concat(rootTiddler);
  for (var i=0; i<nodes.length; i++) {
    delete nodes[i]["firstChild"];
    delete nodes[i]["next"];
  }

  // Now walk through each comment
  cmacro.forEach(comments, function(comment) {
    var prev = comment.fields.prev;
    var daddy = comment.fields.daddy;
    if (prev) {
      var prevTiddler = store.getTiddler(prev);
      if (prevTiddler.next) {
        for (var lastChild=prevTiddler.next; lastChild.next; lastChild=lastChild.next)
          ;
        lastChild.next = comment;
      // } else {
      } else {
        prevTiddler.next = comment;
      }
    } else {
      var daddyTiddler = store.getTiddler(daddy);
      if (daddyTiddler.firstChild) {
        for (var lastChild=daddyTiddler.firstChild; lastChild.next; lastChild=lastChild.next)
          ;
        lastChild.next = comment;
      } else {
        daddyTiddler.firstChild = comment;
      }
    }
  });
  for (var i=0; i<comments.length; i++) {
    var c=comments.sort()[i];
  }

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
  if (cmacro.editable(macroParams)) {
    var replyLinkZone = createTiddlyElement(commentEl, "div", null, "replyLinkZone");
    var replyLink = createTiddlyElement(replyLinkZone, "span", null, "replyLink", "reply to this comment");
    replyLink.onclick = function() { cmacro.openReplyLink(comment, commentEl, replyLink, macroParams); };
  }

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

  cmacro.forceLoginIfRequired(params, commentEl.replyEl, function() {
    var replyText =  cmacro.makeTextArea(commentEl.replyEl, macroParams);
      var submitReply = createTiddlyButton(commentEl.replyEl, "Reply", null, function() {
        var newComment = cmacro.createComment(replyText.value, commentTiddler, macroParams);
        replyText.value = "";
        closeNewReply.onclick();
        cmacro.refreshComments(commentEl.commentsEl, newComment, macroParams);
      });
  });

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

  var rootTitle = daddy.fields.root ? daddy.fields.root : daddy.title;
    // second case is the situation where daddy *is* root
  var newComment = cmacro.createCommentTiddler(macroParams, rootTitle);
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
  newComment.fields.root = rootTitle;

  cmacro.saveTiddler(newComment.title);
  autoSaveChanges(false);
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
    cmacro.saveTiddler(next.title);
  }

  autoSaveChanges(false);

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
//# PARAMS
//##############################################################################

editable: function(params) {
  var editable = getParam(params, "editable");
  return (!editable || editable!="false");
},

needsLogin: function(params) {
  var loginCheck = getParam(params, "loginCheck");
  return loginCheck && !window[loginCheck]();
},

forceLoginIfRequired: function(params, loginPromptContainer, authenticatedBlock) {
  if (cmacro.needsLogin(params)) wikify("<<"+getParam(macroParams, "loginPrompt")+">>", loginPromptContainer);
  else authenticatedBlock();
},

//##############################################################################
//# GENERAL UTILS
//##############################################################################

mergeReadOnly: function(first, second) {
  var merged = {};
  for (var field in first) { merged[field] = first[field]; }
  for (var field in second) { merged[field] = second[field]; }
  return merged;
},

// callers may replace this with their own ID generation algorithm
createCommentTiddler: function(macroParams, rootTitle) {
  // var titleFormat = getParam(macroParams, "titleFormat") || "%root%Comment"; 
  var prefix = rootTitle+"Comment"; // was "_comment"
  if (!store.createGuidTiddler) return store.createTiddler(prefix+((new Date()).getTime()));
  return store.createGuidTiddler(prefix);
},
saveTiddler: function(tiddler) {
  var tiddler = (typeof(tiddler)=="string") ? store.getTiddler(tiddler) : tiddler; 
  store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, cmacro.mergeReadOnly(config.defaultCustomFields, tiddler.fields), false, tiddler.created)
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

config.macros.commentsCount = {
  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    var count = 0;
    if (tiddler && store.getTiddler(tiddler.title)) {
      var rootTiddler = paramString.length ? paramString : tiddler.title;
      count = config.macros.comments.findCommentsFromRoot(store.getTiddler(rootTiddler)).length;
    }
    createTiddlyText(place, count);
  }
},

config.macros.commentBreadcrumb = {
  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    if (!tiddler.fields.root) return;
    var rootLink = createTiddlyElement(place, "span", null, null);
    createTiddlyLink(rootLink, tiddler.fields.root, true);

    var rootIsParent = tiddler.fields.daddy==tiddler.fields.root;
    var rootIsGrandparent = (store.getTiddler(tiddler.fields.daddy)).fields.daddy==tiddler.fields.root;

    if (!rootIsParent) {
      if (!rootIsGrandparent) createTiddlyElement(place, "span", null, null, " > ... ");
      createTiddlyElement(place, "span", null, null, " > ");
      var daddyLink = createTiddlyElement(place, "span", null, null);
      createTiddlyLink(daddyLink, tiddler.fields.daddy, true);
    }

    createTiddlyElement(place, "span", null, null, " > ");

    // place.appendChild(createTiddlyLink(tiddler.fields.root));
  }
}

config.macros.tiddlyWebComments = {};
config.macros.tiddlyWebComments.handler =
  function(place,macroName,params,wikifier,paramString,tiddler) {
    paramString = "fields:'server.workspace:bags/comments' inheritedFields:'server.host,server.type'";
    config.macros.comments.handler(place,macroName,params,wikifier, paramString,tiddler);
  };

function log() { if (console && console.firebug) console.log.apply(console, arguments); }

})(version.extensions.CommentsPlugin);

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet

.comments h1 { margin-bottom: 0; padding-bottom: 0; }
.comments { padding: 0; }
.comment .comments { margin-left: 1em; }

.comment { padding: 0; margin: 1em 0 0; }
.comment .comment { margin 0; }
.comment .toolbar .button { border: 0; color: #9a4; }
.comment .heading { background: [[ColorPalette::PrimaryPale]]; color: [[ColorPalette::PrimaryDark]]; border-bottom: 1px solid [[ColorPalette::PrimaryLight]]; border-right: 1px solid [[ColorPalette::PrimaryLight]]; padding: 0.5em; height: 1.3em; }
.commentTitle { float: left; }
.commentTitle:hover { text-decoration: underline; cursor: pointer; }
.commentText { clear: both; padding: 1em 1em; }
.deleteComment { float: right; cursor: pointer; text-decoration:underline; color:[[ColorPalette::SecondaryDark]]; padding-right: 0.3em; }
.comment .reply { margin-left: 1em; }
.comment .replyLink { color:[[ColorPalette::SecondaryDark]]; font-style: italic; 
                     cursor: pointer; text-decoration: underline; margin: 0 1em; }
.comment .created { }
.comment .newReply { color:[[ColorPalette::SecondaryDark]]; margin-top: 1em; }
.newReplyLabel { float: left; }
.closeNewReply { cursor: pointer; float: right; text-decoration: underline; }
.comments textarea { width: 100%; padding: 0.3em; margin-bottom: 0.6em; }
.newCommentArea { margin-top: 0.5em; }

.clearance { clear: both; }
.expander { cursor: pointer; }

!(end of StyleSheet)

***/

  config.macros.comments.init();

} // end of 'install only once'
/*}}}*/

// function log() { if (console && console.firebug) console.log.apply(console, arguments); }
