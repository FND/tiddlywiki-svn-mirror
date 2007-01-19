var xmlHttp;

function openAjaxRequestParams(url, params, callback, usePost) {

    var datastr = "";

    for (var i in params) {
        if ( usePost) 
            datastr += i + "=" + escape(replaceSubstring(params[i],"+","&#43;")) + "&";
            
        else
            datastr += i + "=" + params[i] + "&";
    }
    
    //~ alert("DATASTR: " + datastr);
    if ( usePost ) 
        openAjaxRequest(url, callback, true, datastr);
    
    else
        openAjaxRequest(url + "?" + datastr, callback);
    
}

function openAjaxRequest(url, callback, usePost, postData)
{
    var xmlHttp = GetXmlHttpObject();
    
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    
    var protocol;
    
    if (usePost) {
        protocol = "POST";
    }
    
    else            
        protocol = "GET";
    
    xmlHttp.onreadystatechange = function ()
    {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete")
            callback(xmlHttp.responseText);
    }
    
    xmlHttp.open(protocol,url,true);
    
    if ( usePost ) 
        xmlHttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        
    xmlHttp.send(postData);
    
}


/*

 var objHTTP, strResult;
  objHTTP = new ActiveXObject('Microsoft.XMLHTTP');
  objHTTP.Open('POST',"OtherPage.asp",false);
  objHTTP.setRequestHeader('Content-Type',
'application/x-www-form-urlencoded');

  objHTTP.send("id=1&user="+txtUser.value+"&password="+txtPassword.value);

  strResult=objHTTP.responseText;

*/

function GetXmlHttpObject()
{ 
    var objXMLHttp=null
    
    if (window.XMLHttpRequest)
        objXMLHttp=new XMLHttpRequest();

    else if (window.ActiveXObject)
        objXMLHttp=new ActiveXObject("Microsoft.XMLHTTP");

    return objXMLHttp
} 



function replaceSubstring(inputString, fromString, toString) {
      var temp = inputString;
   if (fromString == "") {
      return inputString;
   }
   if (toString.indexOf(fromString) == -1) { 
      while (temp.indexOf(fromString) != -1) {
         var toTheLeft = temp.substring(0, temp.indexOf(fromString));
         var toTheRight = temp.substring(temp.indexOf(fromString)+fromString.length, temp.length);
         temp = toTheLeft + toString + toTheRight;
      }
   } else { 
      var midStrings = new Array("~", "`", "_", "^", "#");
      var midStringLen = 1;
      var midString = "";

      while (midString == "") {
         for (var i=0; i < midStrings.length; i++) {
            var tempMidString = "";
            for (var j=0; j < midStringLen; j++) { tempMidString += midStrings[i]; }
            if (fromString.indexOf(tempMidString) == -1) {
               midString = tempMidString;
               i = midStrings.length + 1;
            }
         }
      }
      while (temp.indexOf(fromString) != -1) {
         var toTheLeft = temp.substring(0, temp.indexOf(fromString));
         var toTheRight = temp.substring(temp.indexOf(fromString)+fromString.length, temp.length);
         temp = toTheLeft + midString + toTheRight;
      }
      while (temp.indexOf(midString) != -1) {
         var toTheLeft = temp.substring(0, temp.indexOf(midString));
         var toTheRight = temp.substring(temp.indexOf(midString)+midString.length, temp.length);
         temp = toTheLeft + toString + toTheRight;
      }
   } 
   return temp; 
} 