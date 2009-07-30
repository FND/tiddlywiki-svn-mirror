(function($) {

  //################################################################################
  //# PRIVATE ATTRIBUTES
  //################################################################################

  var plugin;

  //################################################################################
  //# PUBLIC INTERFACE
  //################################################################################

  plugin = $.fn.comments = function(topic, options) {
    options = options || {};
    context = {
      container: $(this),
      options: options,
      topic: topic||"___defaultComments___"
    }

    // This is a best-guess - for use with static plugin. If embedding in a
    // regular web page, this should be updated
    options.path =
      options.path || window.location.href.replace(/(.*)\/static\/.*/, "$1");
    options.afterLoginPath =
      options.afterLoginPath || window.location.href.replace(/(.*\/static)\/.*/, "$1/afterLogin.html");
    options.cookiePath =
      options.cookiePath || window.location.pathname.replace(/(.*\/)static\/.*/, "$1");

    // container = $(this);
    $.fn.comments.buildUI(context);
    $.fn.comments.updateLoginUI(context);
    $.fn.comments.wireEvents(context);
    $.fn.comments.loadData(context);
    return $(this);
  }

  //################################################################################
  //# SERVER INTERACTION
  //################################################################################

  plugin.loadData = function(context) {
    context.store = {}
    context.store[context.topic] = context.root = {
      title: context.topic,
      text: "",
      tags: ["url"],
      fields: {
        name: context.topic,
        url: decodeURIComponent(context.topic),
        "server.workspace": "bags/pages",
        "server.host": context.options.path,
        "server.type": "tiddlyweb",
        "server.title": context.topic
      }
    };
    plugin.loadComments(context);
  }

  plugin.loadComments = function(context) {
    var commentsList;
      $.ajax({
        url: context.options.path + "/bags/comments/tiddlers.json?fat=1&select=topic:"+(encodeURIComponent(context.root.title)),
        success: function(json) {
        commentsList = $.parseJSON(json);
      },
      error: function(xhr) {
        if (xhr.status!=404) return;
        commentsList = [];
      },
      complete: function() {
        $.each(commentsList, function(count) {
          context.store[this.title] = this;
        })
        plugin.treeify(context);
        plugin.refreshComments(context.ui.comments, context.root);
      }
    });
  }

  //################################################################################
  //# USER INTERFACE
  //################################################################################

  plugin.buildUI = function(context) {
    var container = context.container.empty();
    var ui = context.ui = {};
    ui.area =
      $("<div class='commentsArea'></div>")
        .append("<h3>Comments</h3>")
        .append(ui.loginArea=$("<div class='commentsLoginArea'></div>"))
        // .append("<a class='newCommentLink' href='#newCommentArea'>Jump to New Comment</a>")
        .append(ui.comments=$("<div class='allComments'></div>"))
        .append(ui.newCommentArea=$("<div class='newCommentArea'></div>")
                                  .html("New comment:")
                  .append(ui.newCommentWrapper=$("<div class='commentWrapper'></div>")
                              .append(ui.newComment=$("<textarea rows='4'>Enter your comment here</textarea>"))
                         )
                  .append(plugin.buildBioInfoUI(ui))
                  .append(ui.addComment=$("<button class='addComment'>Add Comment</button>"))
               )
        .appendTo(container);
  }

  plugin.buildBioInfoUI = function(commentEl) {
    return $("<table></table>")
        .append($("<tr class='userIDArea'></tr>")
          .append($("<td colspan='2'>Logged in as <span class='userID'></span></td>"))
        )
        .append($("<tr class='bioNameArea'></tr>")
          .append($("<td>Name: </td>"))
          .append($("<td></td>")
            .append(commentEl.bioName=$("<input class='bioName'></input>"))
          )
        )
        .append($("<tr class='bioHomepageArea'></tr>")
          .append($("<td>Homepage: </td>"))
          .append($("<td></td>")
            .append(commentEl.bioHomepage=$("<input class='bioHomepage'></input>"))
          )
        )
  }

  plugin.updateLoginUI = function(context, fadeEffect) {

    var userID = plugin.findUserID();
    log("fe", fadeEffect);

    if (userID) {
      $(".userIDArea").show();
      $(".userID").html(userID);
      $(".bioNameArea,.bioHomepageArea").hide();
    } else {
      $(".userIDArea").hide();
      $(".bioNameArea,.bioHomepageArea").show();
    }

    var content = $("<div id='authArea'></div>");
    if (userID) {
      content.append($("<span>Logged in as: "+userID+"</span>"))
             .append(" ")
             .append($("<span class='pseudoLink' id='logout'>Logout</span>").click(plugin.logout, true));
    } else {
      content = $("<a target='scrumptiousLogin' href='"+context.options.path+"/challenge/openid?tiddlyweb_redirect="+encodeURIComponent(context.options.afterLoginPath)+"'>Login (optional)</a>");
    }
    var delay = fadeEffect ? 0 : delay;
    $(".commentsLoginArea").fadeOut(delay, function() { $(".commentsLoginArea").html(content) }).fadeIn(delay);

  }

  plugin.wireEvents = function(context) {
      context.ui.addComment.click(function() {
        var rootTiddler = context.store[context.topic];
        var customFields = {
          bioName: context.ui.bioName.val(),
          bioHomepage: context.ui.bioHomepage.val()
        };
        var comment = plugin.createComment(context, context.ui.newComment.val(), customFields, rootTiddler);
        context.ui.newComment.val("");
        plugin.treeify(context);
        plugin.refreshComments(context.ui.comments, rootTiddler, comment.title);
    });
  }

  //################################################################################
  //# ID/AUTH MODEL
  //################################################################################

  plugin.findUserID = function() {
    var cookie = $.cookie("tiddlyweb_user");
    return cookie ?  (cookie.split(":"))[0].substr(1) : null;
  }

  plugin.logout = function() {
    $.cookie("tiddlyweb_user", null, { path: context.options.cookiePath });
    // eraseCookie("tiddlyweb_user");
    plugin.updateLoginUI(context, true);
  }

  //################################################################################
  //# DATA MODEL
  //################################################################################

  plugin.treeify = function(context) {
    $.each(context.store, function(count, tiddler) {
      var prev = tiddler.fields.prev, daddy = tiddler.fields.daddy;
      if (prev) {
        context.store[prev].next = tiddler;
      } else if (daddy) {
        context.store[daddy].firstChild = tiddler;
      } else {
        // root; do nothing
      }
    });
  }

  plugin.refreshComments = function(daddyCommentsEl, tiddler, highlightedTitle) {
    plugin.refreshCommentsRecursive(daddyCommentsEl, tiddler);
    var highlightedEl = $("#"+highlightedTitle);
    if (!highlightedEl.length) return;
    highlightedEl.css("backgroundColor", "yellow").animate({backgroundColor: "white"}, 2500);
    // document.location.hash = "#"+$(highlightedEl).attr("id");
    // console.log(highlightedEl.id());
    $.scrollTo( highlightedEl, 800 );
    // $.scrollTo( commentEl, 800, {easing:'swing'} );
    // commentEl.hide().css("backgroundColor", "yellow").fadeIn(3000, function() { commentEl.css("backgroundColor", "")});
    // $.scrollTo( '#target-examples', 800, {easing:'elasout'} );
    // commentEl.animate({backgroundColor: "violet"});
  }

  plugin.refreshCommentsRecursive = function(daddyCommentsEl, tiddler) {
    var commentsEl;
    if (plugin.isComment(tiddler)) { // not root
      var commentEl = plugin.buildCommentEl(daddyCommentsEl, tiddler);
      $(daddyCommentsEl).append(commentEl);
      // console.log(tiddler.title, "|||", highlightedTitle);
      // if (tiddler.title==highlightedTitle) console.log("highil " , tiddler);
      // $("body").append(commentEl);
      commentsEl = commentEl.commentsEl;
    } else { // root
      $(daddyCommentsEl).empty();
      commentsEl = daddyCommentsEl;
    }

    for (var child = tiddler.firstChild; child; child = child.next) {
      plugin.refreshCommentsRecursive(commentsEl, child);
    }

  }

  plugin.buildCommentEl = function(daddyCommentsEl, comment) {
    var commentEl = $("<div id='"+comment.title+"' class='comment'></div>");
    commentEl.append(commentEl.heading=$("<div class='heading'>")
                     .append($("<a href='#"+comment.title+"' class='permalink'>#</a>"))
                     .append(commentEl.metaInfoEl=
                              $("<div></div>")
                                .append($("<span class='commenterMessage'></span>")
                                  .html(plugin.buildCommenterMessage(comment)+"@"+$.tiddly.renderDate(comment.modified))
                                )
                     )
              )
              .append($("<div class='commentText'>"+comment.text+"</div>"));
    /* if admin */
     if (false) {
       commentEl.deleteEl=$("<div class='deleteComment'>X</div>")
                            .click(plugin.deleteComment)
                            .insertAfter(commentEl.metaInfoEl);
    }
    commentEl.append(commentEl.replyLink = $("<div class='replyLink'>reply&nbsp;to&nbsp;this&nbsp;comment</div>"));
    commentEl.replyLink.click(function() { plugin.openReplyLink(comment, commentEl); });
    commentEl.commentsEl = $("<div id='"+comment.title+"Comments' class='comments'></div>")
    commentEl.append(commentEl.commentsEl);
    return commentEl;
  }

  plugin.buildCommenterMessage = function(comment) {
    var message="";
    if (comment.modifier=="GUEST") {
      if (isFilled(comment.fields.bioName)) {
        message+=(comment.fields.bioName);
        if (isFilled(comment.fields.bioHomepage)) message="<a href='"+comment.fields.bioHomepage+"'>"+message+"</a>";
      } else {
        message="guest";
      }
    } else {
      message = "<a href='http://"+comment.modifier+"'>"+comment.modifier+"</a>";
    }
    return message;
  }

  plugin.openReplyLink = function(comment, commentEl) {

    if (commentEl.replyEl) {
      commentEl.replyEl.slideDown();
      return;
    }

    commentEl.replyLink.hide();

    (commentEl.replyEl = $("<div class='reply'></div>")
      .append(commentEl.newReply = $("<div class='newReply'></div>")
                  .append(commentEl.newReplyHeading = ($("<div class='newReplyLabel'>New Reply:</div>")))
                  .append(commentEl.closeNewReply = $("<div class='closeNewReply'>close</div>")
                            .click(function() {
                              commentEl.replyEl.slideUp();
                              commentEl.replyLink.show();
                            })
                          )
          )
      .append($("<div class='clearance'>&nbsp;</div>"))
     .append(commentEl.replyTextWrapper = $("<div class='commentWrapper'></div>")
                                          .append(commentEl.replyText = $("<textarea rows='4' cols='80'></textarea>"))
             )
      .append(plugin.buildBioInfoUI(commentEl))
      .append((commentEl.submitReply = $("<button>Reply</button>"))
               .click(function() {
                  var customFields={
                    bioName: commentEl.bioName.val(),
                    bioHomepage: commentEl.bioHomepage.val()
                  };
                  var newComment = plugin.createComment(context, commentEl.replyText.val(), customFields, comment);
                  $(commentEl.find("input,textarea")).val("");

                  // same as click sequence, except no animation
                  commentEl.replyEl.hide();
                  commentEl.replyLink.show();

                  plugin.refreshComments(commentEl.commentsEl, newComment, newComment.title);
                })
             )
    ).hide().insertBefore(commentEl.commentsEl).slideDown();
    plugin.updateLoginUI(context);
  }

  plugin.createComment = function(context, text, customFields, daddy) {
    log("daddy", daddy);
    var title = "comment_"+plugin.makeGUID();

    var modifier = plugin.findUserID() || "GUEST";

    var newComment = {
      title: title,
      text: text,
      modifier: modifier,
      modified: $.tiddly.composeDateString(new Date()),
      tags: ["comment", "systemConfig", "awesome"],
      fields: {
        "server.workspace": "bags/comments",
        "server.host": context.options.path,
        "server.type": "tiddlyweb",
        "server.title": title,
      daddy: daddy.title,
      topic: daddy.fields.topic ? daddy.fields.topic : daddy.title
      }
    }

    for (var field in customFields) { newComment.fields[field] = customFields[field]; }

    var youngestSibling = plugin.findYoungestChild(daddy);
    if (youngestSibling) newComment.fields.prev = youngestSibling.title;

    context.store[title] = newComment;

    plugin.putTiddler(context, newComment);

    return newComment;
  }

  plugin.deleteComment = function(comment) {
    // log("deleting ", comment);
  }

  plugin.findYoungestChild = function(daddy) {
    // NOTE different, simpler, algorithm to tiddlywiki plugin
    plugin.treeify(context);
    if (!daddy.firstChild) return null;
    for (child=daddy.firstChild; child.next; child=child.next) {}
    return child;
  }

  plugin.isComment = function(tiddler) { return tiddler.tags[0]=="comment"; }

  //################################################################################
  //# GENERIC
  //################################################################################

  // hijack Ajax for cross-domain
  var origAjax = $.ajax;
  $.ajax = function() {
    origAjax.apply(this, arguments);
  }

  plugin.makeGUID = function() { return ""+(new Date()).getTime(); }

  plugin.putTiddler = function(context, tiddler) {
    log("put tiddler", tiddler);
    $.ajax({type:"POST",
    url: context.options.path+"/"+tiddler.fields["server.workspace"]+"/tiddlers/"+encodeURIComponent(tiddler.title)
         + "?http_method=PUT",
/*
    $.ajax({type:"PUT",
    url: context.options.path+"/"+tiddler.fields["server.workspace"]+"/tiddlers/"+tiddler.title,
*/
    data: $.toJSON(tiddler),
    contentType: "application/json; charset=UTF-8"
    });
  }

  plugin.getPageTitle = function(theURL) {
    var url = decodeURIComponent(theURL);
    if (! /^[a-zA-Z]+:/.test(url)) url="http://" + url;
    // encodeURIComponent(theURL.replace(/^[a-zA-Z]+:\/\//, "").replace(/\//g,"_"));
    // return encodeURIComponent(theURL.replace(/^[a-zA-Z]+:\/\//, "").replace(/\//g,"_"));
    // return encodeURIComponent(decodeURIComponent(theURL).replace(/^[a-zA-Z]+:\/\//, ""));
    return url;
  }

  isFilled = function(o) {
    if (!o) return false;
    if (typeof(o)=="string"||(typeof(o)=='object'&&o.splice)) return (o.length?true:false);
    if (typeof(o)=="number") return o!=0;
    return false;
  }

  function log() {
    if (console) console.log.apply(console, arguments);
  }

})(jQuery);

