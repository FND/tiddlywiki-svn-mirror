var ROOT = "..";
$(function() {

  $.ajax({
    url: ROOT + "/bags/comments/tiddlers.json?fat=1&sort=-modified",
    success: function(json) {
      var comments = $.parseJSON(json);
      renderComments(comments);
    },
    error: function(xhr) {
      if (xhr.status!=404) return;
      $("#commentsReport").html("There are no comments");
    }
  });

});

function renderComments(comments) {
  var commentsByPage = {};
  $.each(comments, function() {
    $("#commentsReport")
      .append($("<div class='comment'></div>")
        .append("<a href='index.html?pageURL='"+encodeURIComponent(this.fields.root)+"'>"+this.fields.root+"</a>")
        .append("<span> " + rel($.tiddly.convertFromYYYYMMDDHHMM(this.modified).getTime()) + "</span>")
        .append($("<div> " + this.text + "</div>"))
      );
  });
  /*
  $.each(comments, function() {
    var page = this.fields.root;
    var comments = commentsByPage[page];
    if (!comments) comments = commentsByPage[page] = [];
    comments.push(this);
  });
  for (var page in commentsByPage) {
    $("#commentsReport").append("<a class='page' href='"+page+"'>"+page+"</a>");
    $.each(commentsByPage[page], function() {
      // $("#commentsReport").append("<p>" + this.modifier + ": " + this.text + " [" + $.tiddly.renderDate(this.modified) + "]</p>");
      console.log(this);
      console.log("render", $.tiddly.renderTiddler(this));
      $("#commentsReport").append($.tiddly.renderTiddler(this));
    });
  }
  */
}

function sortNumber(a,b) { return a-b; }
function sortTiddler(a,b) { return a.modified-b.modified; }

function log() {
  if (console) console.log.apply(console, arguments);
}
