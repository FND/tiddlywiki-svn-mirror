WebDav = {
	orig_saveChanges: saveChanges,
	defaultFilename: 'index.html',
	session:{date:new Date().toGMTString(),Q:[]},
	startSaveMessage: "saving to server...",
	
	runQ : function(){
		if(WebDav.session.Q.length){
			(WebDav.session.Q.shift())();
		}
	},
	
	reset: function(){
		WebDav.session = {date:WebDav.session.lastSave,Q:[]};
	},
	
	saveChanges : function(onlyIfDirty,tiddlers){
		if(onlyIfDirty && !store.isDirty())
			return;
		clearMessage();
		displayMessage(this.startSaveMessage);
		var Q = this.session.Q =[];
		Q.push(this.davEnabled.init);
		Q.push(this.getOriginal.init);
		Q.push(this.checkRace.init);
		if (config.options.chkSaveBackups){
			if (config.options.txtBackupFolder!='')
				Q.push(this.makeBackupDir.init);
			Q.push(this.saveBackup.init);
		}
		Q.push(this.saveMain.init);
		if (config.options.chkGenerateAnRssFeed)
			Q.push(this.saveRss.init);
		if (config.options.chkSaveEmptyTemplate)
			Q.push(this.saveEmpty.init);
		Q.push(this.reset);
		this.runQ();
	},
	
	getOriginal:{
		init: function(){		
			DAV.get(WebDav.session.originalPath,WebDav.getOriginal.params);
		},	
		params: {
			callback : function(status,params,original,url,xhr) {
				var p = WebDav.session.posDiv = locateStoreArea(original);
				if(!p || (p[0] == -1) || (p[1] == -1)) {
					alert(config.messages.invalidFileError.format([url]));
					return;
				}
				WebDav.session.original = original;
				WebDav.runQ();
			},
			methodError: "Could not load original file"	
		}
	},
	
	checkRace:{
		init: function(){			
			DAV.getProp(WebDav.session.originalPath,WebDav.checkRace.params,"getlastmodified",0);	
		},
		params: {
			callback: function(status,params,responseText,url,xhr){
				//console.log(params['propvalue']);
				//console.log(WebDav.session.date);
				if(Date.parse(params['propvalue']) > Date.parse(WebDav.session.date)){
					status = confirm(WebDav.checkRace.params.confirmMessage);
					if(!status){
						alert(WebDav.checkRace.params.error);
						return;
					}	
				}
				WebDav.runQ();
			},
			confirmMessage: "The remote file has changed since you last loaded or saved it.\nDo you wish to overwrite it?",
			methodError: "Could not get last modified date",
			error: "Save failed because the remote file is newer than the one you are trying to save"
		}
	},
	
	davEnabled:{
		init: function(){
			DAV.isEnabled(WebDav.session.originalPath,WebDav.davEnabled.params);
		},
		params:{
			callback: function(status){
				WebDav.runQ();
			},
			methodError: "This server does not support WebDav"
		}
	},
	
	saveRss: {
		init: function(){
			var url = WebDav.session.originalPath;
			var rssPath = url.substr(0,url.lastIndexOf(".")) + ".xml";
			DAV.putAndMove(rssPath,WebDav.saveRss.params,convertUnicodeToUTF8(generateRss()));
		},
		params:{
			callback: function(status,params,responseText,url,xhr){
				displayMessage(config.messages.rssSaved,url);
				WebDav.runQ();
			},
			methodError: "Could not save RSS feed to server"
		}	
	},
	
	saveEmpty: {
		init: function(){
			var w = WebDav.session;
			var url = w.originalPath;
			var emptyPath,p;
			if((p = url.lastIndexOf("/")) != -1)
				emptyPath = url.substr(0,p) + "/empty.html";
			else
				emptyPath = url + ".empty.html";
			var empty = w.original.substr(0,w.posDiv[0] + startSaveArea.length) + w.original.substr(w.posDiv[1]);
			DAV.putAndMove(emptyPath,WebDav.saveEmpty.params,empty);
		},
		params:{
			callback: function(status,params,responseText,url,xhr){
				displayMessage(config.messages.emptySaved,url);
				WebDav.runQ();
			},
			methodError: "Could not save empty template to server"
		}
	},
	
	saveMain: {
		init: function(){
			var w = WebDav.session;	
			var revised = updateOriginal(w.original,w.posDiv);
			DAV.putAndMove(w.originalPath,WebDav.saveMain.params,revised);
		},
		params:{
			callback: function(status,params,responseText,url,xhr){
				WebDav.session.lastSave = xhr.getResponseHeader('Date');
				displayMessage(config.messages.mainSaved,url);
				store.setDirty(false);
				WebDav.runQ();		
			},
			methodError: "Could not save main TiddlyWiki file to server"
		}
	},
	
	saveBackup :{
		init: function(){
			var backupPath = getBackupPath(WebDav.session.originalPath);
		//	DAV.putAndMove(backupPath,WebDav.saveBackup.params,WebDav.session.original);
			var params = WebDav.saveBackup.params;
			params.destination = backupPath;
			DAV.copy(WebDav.session.originalPath,params,backupPath);
		},
		params:{
			callback: function(status,params,responseText,url,xhr){
				displayMessage(config.messages.backupSaved,params.destination);
				WebDav.runQ();
			},
			methodError: "Could not save backup file"
		}
	},
	
	makeBackupDir:{
		init: function(){
			var url = getBackupPath(WebDav.session.originalPath);
			var backupDirPath = url.substr(0,url.lastIndexOf("/"));
			DAV.makeDir(backupDirPath,WebDav.makeBackupDir.params); 
		},
		params:{
			callback: function(status,params,responseText,url,xhr){
				WebDav.runQ();
			},
			methodError: "Could not create backup directory"
		}
	}		
};

window.saveChanges = function(onlyIfDirty,tiddlers)
{	
	var p = document.location.toString();
	p = convertUriToUTF8(p,config.options.txtFileSystemCharSet);
	var argPos = p.indexOf("?");
	if(argPos != -1)
		p = p.substr(0,argPos);
	var hashPos = p.indexOf("#");
	if(hashPos != -1)
		p = p.substr(0,hashPos);		
	if (p.charAt(p.length-1) == "/")
		p = p + WebDAV.defaultFilename;
	WebDav.session.originalPath = p;
	if (p.substr(0,5) == "http:")
		return WebDav.saveChanges(onlyIfDirty,tiddlers);
	else
		return WebDav.orig_saveChanges(onlyIfDirty,tiddlers);
};


DAV = {
	run : function(type,url,data,params,headers){
		var callback = function(status,params,responseText,url,xhr) {
			if (!status) {
				alert("failed");
console.log(xhr);
console.log("response is " +responseText);
console.log("url is "+url);
console.log("status is "+status);
				return;
			}
			switch(params['type']){
				case "GET":
					status = (xhr.status == 200);
					break;
				case "PROPFIND":
					status = (xhr.status == 207);
					var rp = new RegExp('<(\\w*?):'+params['prop']+'>(.*?)<\\/\\1:'+params['prop']+'>')
					params['propvalue'] = rp.exec(responseText)[2];
					break;
				case "MKCOL":
					status = (xhr.status == 200 || xhr.status == 201);
					break;
				case "PUT":
				case "COPY":
					status = (xhr.status == 201 || xhr.status == 204);
					break;
				case "MOVE":
					status = (xhr.status == 201 || xhr.status == 204);
					url = url.replace("-davsavingtemp","");
					break;
				case "OPTIONS":
					status = !! xhr.getResponseHeader("DAV");
					break;
				default:
					status = true;
					break;
			}
			//if(!status && params.methodError){
		//		alert(params.methodError);
		//		return;
		//	}
			url = url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1);
			if(params.callback)
				params.callback.apply(this,[status,params,responseText,url,xhr]);
		};	
			
		params['type'] = type;
		doHttp.apply(this,[type,url,data,null,null,null,callback,params,headers]);
	},
	
	getProp : function(url,params,prop,depth){
		var xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
			'<D:propfind xmlns:D="DAV:">' +
			'<D:prop>'+
			'<D:'+prop+'/>'+
			'</D:prop>'+
			'</D:propfind>';
		params['prop'] = prop;
		DAV.run("PROPFIND",url,xml,params,{"Content-type":"text/xml","Depth":depth?depth:0});
	},
	
	makeDir : function(url,params){
		DAV.run("MKCOL",url,null,params,null);
	},

	isEnabled : function(url,params){
		DAV.run("OPTIONS",url,null,params,null);
	},

	get : function(url,params){
		DAV.run("GET",url,null,params,null);
	},

	put : function(url,params,data) {
		DAV.run("PUT",url,data,params,null);
	},

	move : function(url,params,destination) {
		DAV.run("MOVE",url,null,params,{"Destination":destination,"Overwrite":"T"});
	}, 

	copy : function(url,params,destination) {
		DAV.run("COPY",url,null,params,{"Destination":destination,"Overwrite":"T","Depth":0});
	},

	putAndMove : function(url,params,data){
		params.nextcallback = params.callback;
		params.callback = function(status,params,responseText,url,xhr){
			params.callback = params.nextcallback;
			params.nextcallback = null;
			DAV.move(url,params,url.replace("-davsavingtemp",""));
		};
		
		DAV.put(url+"-davsavingtemp",params,data);
	}
};


// get date from server on start up? too?
// not entirely happy with reset function. Is it foolproof in situations where the save failed? handling of lastSave date
// // should reset function run somehow on failure?
// write as a constructor?

//race timer

//ability to force save despite race conflict


//merge conflict feature, import tiddlers from server version, compare dates and merge... synch!
//locking options?
//innerHTML instead of GET?
//upload file feature
//list view based DavClient
//clean up backup files option?