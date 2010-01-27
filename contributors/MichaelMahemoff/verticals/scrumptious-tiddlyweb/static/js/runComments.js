$(function() {
  var embedded = (top.location!=window.location);
  var params = parseGetVars();
  var pageURL = params.pageURL;
  if (!pageURL) {
      $("body").append("Error: The URL &quot;<tt>" + window.location + "</tt>&quot; has no pageURL to comment on");
   }
  // if (!pageURL||!pageURL.length) pageURL="http://google.com";
  $("#commentsContainer").addClass(embedded ? "embeddedCommentsContainer" : "standaloneCommentsContainer")
                         .comments({pageURL: pageURL});
});

// http://www.codingforums.com/showthread.php?s=&threadid=2217
function parseGetVars() {
  var getVars = location.search.substring(1).split("&");
  var returnVars = new Array();
  
  for(i=0; i < getVars.length; i++) {
    var newVar = getVars[i].split("=");
    returnVars[unescape(newVar[0])] = unescape(newVar[1]);
  }
  
  return returnVars;
}    
