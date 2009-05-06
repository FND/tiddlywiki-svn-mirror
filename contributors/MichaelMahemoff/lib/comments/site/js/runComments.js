$(function() {
  console.log("query", parseGetVars("pageURL"));
  var pageURL = parseGetVars().pageURL;
  if (!pageURL||!pageURL.length) pageURL="http://google.com";
  $("#commentsContainer").comments({pageURL: pageURL});
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
