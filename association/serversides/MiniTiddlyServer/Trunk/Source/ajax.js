var xmlHttp;

function openAjaxRequestParams(url, params, callback, usePost) {

    var datastr = "";

    for (var i in params) {
        if ( usePost )
            datastr += i + "=" + escape(params[i].replace(/\+/g,"&#43;")) + "&";
            
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


