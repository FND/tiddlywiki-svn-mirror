/***
|''Name:''|HttpGetMacro|
|''Description:''|Submit an HttpGet and display the response|
|''Version:''|2.0.0|
|''Date:''|Mar 18, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#HttpGetMacro|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0|
***/
//{{{
config.macros.HttpGet = {
	cache: [], 	// url => responseText
	messages: {
		401: "%0 unauthorized (HTTP status:401).",
		403: "%0 forbidden (HTTP status:403).",
		404: "%0 not found (HTTP status:404).",
		405: "Method not allowed to access %0 (HTTP status: 405)."
	},
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var url = params[0];
		var format = params[1];
		wikify("^^<<HttpGetUpdate "+url+" [[" + tiddler.title + "]]>>^^\n",place);
		var div = createTiddlyElement(place, "div", "HttpGet");
		if (this.cache[url]) {
			this.display(this.cache[url], format, div);
					}
		else {
			this.get(url, format, div);
		}
	},
	
	get: function(url, format, place) {
		var params = {
				format: format,
				place:	place
				};
		var r = loadRemoteFile(url,config.macros.HttpGet.display,params);
		if (typeof r == "string")
			displayMessage(r);
		return r;
	},
	
	display: function(status,params,responseText,url,xhr) {
		if (status) {
	 		if (params['format'] == 'html') {
				wikify("<html>"+responseText+"</html>", params['place']);
			}
			else { //text
				wikify(responseText, params['place']);			
			}
		} else {
			if (config.macros.HttpGet.messages[xhr.status])
				displayMessage(config.macros.HttpGet.messages[xhr.status].format([url]));
			else
				displayMessage("HTTP Error " + xhr.status + " in accessing " + url);
		}
		
	}

};

config.macros.HttpGetUpdate = {
	label: "Update",
	prompt: "Clear the cache and redisplay this tiddler",
	handler: function(place,macroName,params) {
		var url = params[0];
		var tiddlerTitle = params[1];
		createTiddlyButton(place, this.label, this.prompt, 
			function () {
				if (config.macros.HttpGet.cache[url]) {
					config.macros.rssReader.cache[url] = null; 
			}
			story.refreshTiddler(tiddlerTitle,null, true);
		return false;});
	}
};
//}}}