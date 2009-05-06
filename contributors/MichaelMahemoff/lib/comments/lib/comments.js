(function($) {

  //################################################################################
  //# PRIVATE ATTRIBUTES
  //################################################################################

  var plugin;
  var ROOT = "http://comments.boz:8080"; // will be replaced when running off server

  //################################################################################
  //# PUBLIC INTERFACE
  //################################################################################

  plugin = $.fn.comments = function(options) {
  options = options || {};
  // options.pageURL = "http://project.mahemoff.com/guid0/";
  context = {
    container: $(this),
    options: options
  }
  // container = $(this);
  $.fn.comments.buildUI(context, context);
  $.fn.comments.wireEvents(context, context);
  $.fn.comments.loadData(context);
  }

  //################################################################################
  //# SERVER INTERACTION
  //################################################################################

  plugin.loadData = function(context) {
    context.store = {}
    plugin.loadPage(context);
  }

  plugin.loadPage = function(context) {
    var title = plugin.getPageTitle(context.options.pageURL);
    $.ajax({
      url: ROOT + "/bags/pages/tiddlers/" + title + ".json",
      success: function(json) {
        context.store[title] = context.root = $.parseJSON(json, true);
      },
      error: function(xhr) {
        if (xhr.status!=404) return;
        context.store[title] = context.root = {
          title: title,
          text: "",
          tags: ["url"],
          fields: {
          name: context.options.pageURL,
          url: context.options.pageURL,
          "server.workspace": "bags/pages",
          "server.host": ROOT,
          "server.type": "tiddlyweb",
          "server.title": title
          }
        };
        plugin.putTiddler(context.root);
      },
      complete: function() {
        plugin.renderPageInfo(context);
        plugin.loadComments(context);
      }
    });
  }

  plugin.loadComments = function(context) {
    var commentsList;
      $.ajax({
        url: ROOT + "/bags/comments/tiddlers.json?fat=1&filter=[root["+context.root.title+"]]",
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
    var container = context.container;
    var ui = context.ui = {};
    ui.area =
      $("<div class='commentsArea'></div>")
        .append($("<div class='pageInfo'>")
          .append(ui.heading=$("<h2>Loading ...</h2>"))
          .append(ui.pageURL=$("<a></a>"))
         )
        .append(ui.commentsHeading=$("<h3>Comments</h3>"))
        .append(ui.comments=$("<div></div>"))
        .append(ui.newCommentArea=$("<div class='newCommentArea'></div>"))
        .append(ui.newComment=$("<textarea rows='4' cols='80'>Hello this is the comment</textarea>"))
        .append(ui.addComment=$("<button class='addComment'>Add Comment</button>"))
        .appendTo(container);
  }

  plugin.wireEvents = function(context) {
      context.ui.addComment.click(function() {
      var rootTiddler = context.store[plugin.getPageTitle(context.options.pageURL)];
      var comment = plugin.createComment(context, context.ui.newComment.val(), rootTiddler);
      context.ui.newComment.empty();
      plugin.treeify(context);
      plugin.refreshComments(context.ui.comments, rootTiddler);
    });
  }

  plugin.renderPageInfo = function(context) {
    console.log("name", context.root.fields.name, "root", context.root);
    context.ui.heading.html(context.root.fields.name);
    context.ui.pageURL.attr("href", context.root.fields.url);
    context.ui.pageURL.html(context.root.fields.name);
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

  plugin.refreshComments = function(daddyCommentsEl, tiddler) {
    log("refresh ", tiddler);
    var commentsEl;
    if (plugin.isComment(tiddler)) { // not root
      var commentEl = plugin.buildCommentEl(daddyCommentsEl, tiddler);
      $(daddyCommentsEl).append(commentEl);
      // $("body").append(commentEl);
      commentsEl = commentEl.commentsEl;
    } else { // root
      $(daddyCommentsEl).empty();
      commentsEl = daddyCommentsEl;
    }

    for (var child = tiddler.firstChild; child; child = child.next) {
      plugin.refreshComments(commentsEl, child);
    }

  }

  plugin.buildCommentEl = function(daddyCommentsEl, comment) {
    var commentEl = $("<div class='comment'></div>")
    .append($("<div class='commentText'>"+comment.text+"</div>"));
    commentEl.append(commentEl.replyLink = $("<div class='replyLink'>reply to this comment</span>"));
    commentEl.replyLink.click(function() { plugin.openReplyLink(comment, commentEl); });
    commentEl.commentsEl = $("<div id='"+comment.title+"Comments'class='comments'></div>")
    commentEl.append(commentEl.commentsEl);
    return commentEl;
  }

  plugin.openReplyLink = function(comment, commentEl) {

    if (commentEl.replyEl) {
      commentEl.replyEl.show();
      return;
    }

    commentEl.replyLink.hide();

    (commentEl.replyEl = $("<div class='reply'></div>")
      .append(commentEl.newReplyHeading = 
        ($("<div class='newReplyLabel'>New Reply:</div>")
          .append(commentEl.closeNewReply =
            $("<div class='closeNewReply'>close</div>")
            .click(function() {
              commentEl.replyEl.hide();
              commentEl.replyLink.show();
            })
          )
        )
      )
      .append(commentEl.replyText = $("<textarea rows='4' cols='80'></textarea>"))
      .append((commentEl.submitReply = $("<button>Reply</button>"))
               .click(function() {
                  var newComment = plugin.createComment(context, commentEl.replyText.val(), comment);
                  commentEl.replyText.val("");
                  commentEl.closeNewReply.click();
                  plugin.refreshComments(commentEl.commentsEl, newComment);
                })
             )
    ).insertBefore(commentEl.commentsEl);

  }

  plugin.createComment = function(context, text, daddy) {
    log("cc", arguments);
    var title = "comment_"+plugin.makeGUID();
    var newComment = {
      title: title,
      text: text,
      modifier: "guest", // TODO
      tags: ["comment"],
      fields: {
        "server.workspace": "bags/comments",
        "server.host": ROOT,
        "server.type": "tiddlyweb",
        "server.title": title,
      daddy: daddy.title,
      root: daddy.fields.root ? daddy.fields.root : daddy.title
      }
    }
    var youngestSibling = plugin.findYoungestChild(daddy);
    if (youngestSibling) newComment.fields.prev = youngestSibling.title;
    context.store[title] = newComment;

    $.ajax({type:"PUT",
      url: ROOT+"/"+newComment.fields["server.workspace"]+"/tiddlers/"+newComment.title,
      data: $.toJSON(newComment),
      contentType: "application/json; charset=UTF-8"
    });
    // $.put(ROOT+"/"+newComment.fields["server.workspace"]+"/tiddlers/comment_"+newComment.title,
    // $.toJSON(newComment));

    return newComment;
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
    netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
    origAjax.apply(this, arguments);
  }

  plugin.makeGUID = function() { return ""+(new Date()).getTime(); }

  plugin.putTiddler = function(tiddler) {
    $.ajax({type:"PUT",
    url: ROOT+"/"+tiddler.fields["server.workspace"]+"/tiddlers/"+tiddler.title,
    data: $.toJSON(tiddler),
    contentType: "application/json; charset=UTF-8"
    });
  }

  plugin.getPageTitle = function(url) {
    return escape(url.replace(/^http:\/\//, "").replace(/\//g,"_"));
  }

  function log() {
    if (log) console.log.apply(console, arguments);
  }

})(jQuery);

//################################################################################
// http://jollytoad.googlepages.com/json.js
//################################################################################

(function ($) {
    var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        s = {
            'array': function (x) {
                var a = ['['], b, f, i, l = x.length, v;
                for (i = 0; i < l; i += 1) {
                    v = x[i];
                    f = s[typeof v];
                    if (f) {
                        v = f(v);
                        if (typeof v == 'string') {
                            if (b) {
                                a[a.length] = ',';
                            }
                            a[a.length] = v;
                            b = true;
                        }
                    }
                }
                a[a.length] = ']';
                return a.join('');
            },
            'boolean': function (x) {
                return String(x);
            },
            'null': function (x) {
                return "null";
            },
            'number': function (x) {
                return isFinite(x) ? String(x) : 'null';
            },
            'object': function (x) {
                if (x) {
                    if (x instanceof Array) {
                        return s.array(x);
                    }
                    var a = ['{'], b, f, i, v;
                    for (i in x) {
                        v = x[i];
                        f = s[typeof v];
                        if (f) {
                            v = f(v);
                            if (typeof v == 'string') {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a.push(s.string(i), ':', v);
                                b = true;
                            }
                        }
                    }
                    a[a.length] = '}';
                    return a.join('');
                }
                return 'null';
            },
            'string': function (x) {
                if (/["\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            }
        };

	$.toJSON = function(v) {
		var f = isNaN(v) ? s[typeof v] : s['number'];
		if (f) return f(v);
	};
	
	$.parseJSON = function(v, safe) {
		if (safe === undefined) safe = $.parseJSON.safe;
		if (safe && !/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test(v))
			return undefined;
		return eval('('+v+')');
	};
	
	$.parseJSON.safe = false;

})(jQuery);
