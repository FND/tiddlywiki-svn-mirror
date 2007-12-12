config.macros.sharedRecordsUpload={
	lingo : {
		label: "upload to SR",
		tooltip: "upload this file to Shared Records",
		error: "Error uploading to Shared Records",
		saving: "Uploading to Shared Records...",
		saved: "Uploaded to Shared Records",
		dateFormat: "0DD/0MM/YYYY 0hh:0mm:0ss",
		xssurl: "http://api.lewcid.org/sharedrecords/xss.cgi",
		SRServerPath: "http://sra.sharedrecords.org:8080/SRCDataStore/RESTServlet/"
	},
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		createTiddlyButton(place,this.lingo.label,this.lingo.tooltip,this.onclick);
	},
	
	onclick : function(e){
		clearMessage();
		displayMessage(config.macros.sharedRecordsUpload.lingo.saving);
		var protocol = document.location.protocol;
		if (protocol == 'http:' || protocol == 'https:'){
			var url = config.macros.sharedRecordsUpload.lingo.xssurl;
			var params= {
				'url' : document.location.toString(),
				callback : 'config.macros.sharedRecordsUpload.callbackXss',
				mode: 'json'
			};
			xssRequest(url,params);
		}
		else{
			var originalPath = document.location.toString();
			var localPath = getLocalPath(originalPath);
			var original = loadFile(localPath);
			var revised = original;
			//var posDiv = locateStoreArea(original);
			//var revised = updateOriginal(original,posDiv);
			var hash = Crypto.hexSha1Str(unescape( encodeURIComponent(revised) ));
			var path = config.macros.sharedRecordsUpload.lingo.SRServerPath + hash;
			doHttp("PUT",path,revised,"text/html",null,null,config.macros.sharedRecordsUpload.callbackLocal,null,{'Content-Length':revised.length});
		}
		return false;
	},
	
	callbackXss : function(status,statusText,code,body,url){
			clearMessage();
			if(status){
				config.macros.sharedRecordsUpload.onUploaded(url);
			}
			else{
				displayMessage(config.macros.sharedRecordsUpload.lingo.error+"\nstatus:"+code+"\nresponseText:"+responseText+"\nstatusText:"+statusText+"\nurl:"+url);
			}
		},
		
	callbackLocal : function(status,params,responseText,url,xhr){
			clearMessage();
			if(status){
				config.macros.sharedRecordsUpload.onUploaded(url);
			}
			else{
				displayMessage(config.macros.sharedRecordsUpload.lingo.error+"\nstatus:"+xhr.status+"\nstatusText:"+xhr.statusText+"\nresponseText:"+responseText+"\nurl:"+url);
			}
		},
		
	onUploaded : function(url){
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		displayMessage (config.macros.sharedRecordsUpload.lingo.saved,url);
		if(! readOnly){
			var tiddler = config.macros.sharedRecordsUpload.getLogTiddler();
			oldText = tiddler.text;
			store.setValue(tiddler,'text',oldText+"\n*[["+(new Date).formatString(config.macros.sharedRecordsUpload.lingo.dateFormat)+"|"+url+"]]");
			autoSaveChanges();
		}	
	},
	
	getLogTiddler : function(){
		var tiddler = store.getTiddler("SharedRecordsUploadLog");
		if (!tiddler) {
			tiddler = new Tiddler();
			tiddler.title = "SharedRecordsUploadLog";
			tiddler.text = "!History of uploads to Shared Records\n";
			tiddler.created = new Date();
			tiddler.modifier = config.options.txtUserName;
			tiddler.modified = new Date();
			store.addTiddler(tiddler);
		}
		return tiddler;
	}
	
};

function xssRequest(url,params){
	url = url + "?";
	for (var n in params){
		url += n+"="+params[n]+"&";
	}
	url+= "nocache=" + new Date().getTime();
	scriptObj = document.createElement("script");
    
	scriptObj.setAttribute("type", "text/javascript");
	scriptObj.setAttribute("src", url);
	document.getElementsByTagName("head")[0].appendChild(scriptObj);
	//document.getElementsByTagName("head")[0].removeChild(scriptObj);
}


