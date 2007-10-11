//{{{
// Freebase writer macro
// v0.1
// 16th August 2007
// 
// Author: Jonathan Lister, jon [at] osmosoft [dot] com
//
// Usage: <<Freebase function username password >>
// Where function can be any of:
// login, read, write, visual
// NB: CURRENTLY, ONLY LOGIN AND VISUAL HAVE SENSIBLE BEHVAVIOUR
// First two params are the username and password for the freebase login
// and the other params are explained below next to each function

config.macros.Freebase = {};

// Login function: must be called first
config.macros.Freebase.loginFunction = function(place,params,nextAction) {
	 
   	var url = "http://sandbox.freebase.com/api/account/login";
   	var username = params[1];
   	var password = params[2];
   	var data = "username=" + encodeURI("jayfresh") + "&" +
			"password=" + encodeURI("temp123");
	var loginCallback = function(status,params,responseText,url,xhr) {

		if (status) {
			createTiddlyText(place,"Logged in as " + username);
       		var cookies = xhr.getResponseHeader("set-cookie").split("\n");
       		cookies[0] = cookies[0].split(";")[0];
       		cookies[1] = cookies[1].split(";")[0];
       		credentials = cookies[0] + ";" + cookies[1];
       		// Call whichever function is now desired
			if (nextAction) {
				nextAction(place);
			}
		}
	};

   	var ret = doHttp("POST", url,data,null,null,null,loginCallback,params,null);
   	if(typeof ret == "string") {
   		createTiddlyError(place,"Failed HTTP request","Error: " + ret);
   	} else {
   		createTiddlyText(place,"Logging in...");
   		createTiddlyElement(place,"br");
   	}
};

// Read function
config.macros.Freebase.readFunction = function(place,query) {
	
	// var envelope = '{ "qname": { "query": ' + query + '}}';
	var envelope = query;
	var querytext = encodeURIComponent(envelope);
			
	var url = "http://sandbox.freebase.com/api/service/mqlread";
	url += "?queries=" + querytext;
		
	var readCallback = function(status,params,responseText,url,xhr) {
		if (status) {
			var response = eval('(' + responseText + ')');
			var result = response.qname.result;
   			var resultText = "";
   			for (var n in result) {
   				resultText = (n + " : " + result[n]);
   				createTiddlyText(place,resultText);
   				createTiddlyElement(place,"br");
   			}
   		} else {
   			// error
   		}
	};
		
	var ret = doHttp("GET",url,null,null,null,null,readCallback,null,null);
	if(typeof ret == "string") {
		createTiddlyError(place,"Failed HTTP request","Error: " + ret);
	} else {
		createTiddlyText(place,"Hmm... seemed to read");
		createTiddlyElement(place,"br");
	}
	
};

// Write function
config.macros.Freebase.writeFunction = function(place,query) {

	// var envelope = '{ "qname": { "query": ' + query + '}}';
	var envelope = query;
        
	var data = "queries=" + encodeURIComponent(envelope);

	var headers = {"Cookie": credentials, "X-Metaweb-Request": "True"};
    var url = "http://sandbox.freebase.com/api/service/mqlwrite";
    var createCallback = function(status,params,responseText,url,xhr){
    	var response = eval('(' + responseText + ')');
    	var result = response.qname.result;
    	var resultText = "";
    	for (var n in result) {
    		resultText = (n + " : " + result[n]);
    		createTiddlyText(place,resultText);
    		createTiddlyElement(place,"br");
    	}
};

        var ret = doHttp("POST",url,data,null,null,null,createCallback,null,headers);
        if(typeof ret == "string") {
       		createTiddlyError(place,"Failed HTTP request","Error: " + ret);
    	} else {
       		createTiddlyText(place,"Write request seemed to work...");
       		createTiddlyElement(place,"br");
      	}
	};

// Visual query builder function
config.macros.Freebase.queryEditor = function(place) {
	/* Begin code for Metaweb query editor */
	
	// Some code to insert the appropriate styles into StyleSheet tiddler
	var newbody = "div.metaweb #q, div.metaweb #r { width: 400px; height: 300px; border-width:0px;padding:5px;} \n" +
		"div.metaweb th {background-color:black; color:white; font:bold 12pt sans-serif;} \n" +
		"div.metaweb td.border,div.metaweb th {border:solid black 3px;} \n" +
		"div.metaweb input { margin: 5px; font-weight: bold; } \n" +
		"div.metaweb table { border-collapse: collapse;}";
	store.saveTiddler("StyleSheet","StyleSheet",newbody);
	
	// Placeholder text to guide the user
	// Test read query: "type" : "/music/artist", "name" : "The Police", "album" : []
	// Test write query: "create":"unless_exists", "id":null, "type":"/common/topic", "name":"my test object"
	var exampleQuery = '{ \n\t"qname": { \n\t\t"query": { \n\t\t\tenter query here \n\t\t} \n\t} \n}';
	
	// Set out the visual editor
	var metaweb = createTiddlyElement(place,"div",null,"metaweb");
	var queryForm = createTiddlyElement(metaweb,"form","queryform");
	queryForm.setAttribute("target","r");
	queryForm.setAttribute("action","http://sandbox.freebase.com/api/service/mqlread");
	queryForm.setAttribute("method","get");
	var hiddenInput = createTiddlyElement(queryForm,"input");
	hiddenInput.setAttribute("type","hidden");
	hiddenInput.setAttribute("name","callback");
	hiddenInput.setAttribute("value"," ");
	var queryTable = createTiddlyElement(createTiddlyElement(queryForm,"table"),"tbody");
	var queryTableHead = createTiddlyElement(queryTable,"tr");
	createTiddlyText(createTiddlyElement(queryTableHead,"th"),"Query");
	createTiddlyElement(queryTableHead,"td");
	createTiddlyText(createTiddlyElement(queryTableHead,"th"),"Result");
	var queryTableBody = createTiddlyElement(queryTable,"tr");
	var queryArea = createTiddlyElement(queryTableBody,"td",null,"border");
	createTiddlyElement(queryArea,"textarea","q",null,exampleQuery).setAttribute("name","queries");
	var queryButtons = createTiddlyElement(queryTableBody, "td");
	queryButtons.setAttribute("valign","top");
	var queryButtonsRead = createTiddlyElement(queryButtons,"input");
	queryButtonsRead.setAttribute("type","button");
	queryButtonsRead.setAttribute("value","Query");
	queryButtonsRead.setAttribute("onclick","var iFrame=document.getElementById('r').contentDocument.childNodes[1].childNodes[1];config.macros.Freebase.clearFrame(iFrame);var query = document.getElementById('q').value;config.macros.Freebase.readFunction(iFrame,query);");
	createTiddlyElement(queryButtons,"br");
	var queryButtonsWrite = createTiddlyElement(queryButtons,"input");
	queryButtonsWrite.setAttribute("type","button");
	queryButtonsWrite.setAttribute("value","Write");
	queryButtonsWrite.setAttribute("onclick","var iFrame=document.getElementById('r').contentDocument.childNodes[1].childNodes[1];config.macros.Freebase.clearFrame(iFrame);var query = document.getElementById('q').value;config.macros.Freebase.writeFunction(iFrame,query);");
	var queryButtonsReset = createTiddlyElement(queryButtons,"input");
	queryButtonsReset.setAttribute("type","reset");
	var queryIframe = createTiddlyElement(queryTableBody,"td",null,"border");
	var iFrameRef = document.createElement("iframe");
	iFrameRef.setAttribute("name","r");
	iFrameRef.setAttribute("id","r");
	queryIframe.appendChild(iFrameRef);

	/* END code for Metaweb query editor */

};

// Utility function to clear the iframe
config.macros.Freebase.clearFrame = function(frame) {
	if (frame.hasChildNodes()) {
		var count=frame.childNodes.length;
		for (var i=0;i<count;i++) {
			frame.removeChild(frame.childNodes[0]);
		}
	}
};

config.macros.Freebase.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	// Credentials is used by multiple functions
	var credentials = "";

	// Call the login function passing in the value of whichever is the desired function
	// Pass in null if you are only logging in
	var funcMap = {
		"create":this.writeFunction,
		"read":this.readFunction,
		"visual":this.queryEditor
		};
	((params[0] != "login") && funcMap[params[0]] ? this.loginFunction(place,params,funcMap[params[0]]) : loginFunction(null));

};

//}}}
