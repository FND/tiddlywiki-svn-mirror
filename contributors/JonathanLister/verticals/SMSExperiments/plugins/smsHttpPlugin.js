config.macros.smsHttpPlugin = {
	_serialize: function(pairs,urlEncode) {
		var data = "";
		for(var i in pairs) {
			if(urlEncode) {
				data += "&"+encodeURIComponent(i)+"="+encodeURIComponent(pairs[i]);
			} else {
				data += "&"+i+"="+pairs[i];
			}
		}
		data = data.substring(1);
		return data;
	},
	makePost: function(url,keyValuePairs,callback) {
		if(!url) {
			displayMessage('please provide a url as the first argument to makePost');
			return false;
		}
		var data = this._serialize(keyValuePairs,true);
		callback = callback || function(status,params,responseText,url,xhr) { console.log(xhr); };
		var x = httpReq("POST",url,callback,null,null,data,null,null,null,true);
		return x;
	},
	makePostFromTiddler: function(title,callback) {
		var slices = store.calcAllSlices(title);
		if(!slices) {
			displayMessage('no slices found for tiddler named '+title);
			return false;
		}
		var url = "";
		var keyValuePairs = {};
		for(var s in slices) {
			if(s==="url") {
				url = slices[s];
			} else {
				keyValuePairs[s] = slices[s];
			}
		}
		this.makePost(url,keyValuePairs,callback);
	}
};

config.macros.smsHttpPlugin.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
};