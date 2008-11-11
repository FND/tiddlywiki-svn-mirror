
/***
|''Name''|ccTiddlyPlugin|
|''Description''|The ccTiddlyPlugin macro contains all the macros necessary to run ccTiddly.|
|''Author''|Simon McManus|
|''Contributors''|Simon McManus, James Lelyveld|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccTiddlyPlugins.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccTiddlyPlugins.js|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Date:''|Nov 6, 2008|
|''Version:''|0.1|


!Usage
{{{
<<ccAbout>>
<<ccAdmin>>
<<ccCreateWorkspace>>
<<ccEditWorkspace>>
<<ccFile>>
<<ccLogin>>
<<ccLoginStatus>>
<<ccRegister>>
<<ccStats>>

}}}

***/
//{{{
	
// ccAdaptorCommandsPlugin //


//{{{
	
// Ensure that the plugin is only installed once.
if(!version.extensions.AdaptorCommandsPlugin) {
	version.extensions.AdaptorCommandsPlugin = {installed:true};

//# revisions command definition
config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	loading: "loading...",
	done: "Revision downloaded",
	revisionTooltip: "View this revision",
	popupNone: "No revisions",
	revisionTemplate: "%0 r:%1 m:%2",
	dateFormat:"YYYY mmm 0DD 0hh:0mm"	
});

config.commands.deleteTiddlerHosted = {};
merge(config.commands.deleteTiddlerHosted,{
	text: "delete",
	tooltip: "Delete this tiddler",
	warning: "Are you sure you want to delete '%0'?",
	hideReadOnly: true,
	done: "Deleted "
});


config.commands.saveTiddlerHosted1 = {};
merge(config.commands.saveTiddlerHosted1, config.commands.saveTiddler);

config.commands.saveTiddlerHosted1.handler = function(event,src,title)
{
	var tiddlerElem = story.getTiddler(title);
	var fields = {};
	story.gatherSaveFields(tiddlerElem,fields);
	var newTitle = fields.title || title;
	if(!store.tiddlerExists(newTitle))
		newTitle = newTitle.trim();
	if(newTitle==title){  // we are not renaming the tiddler 
		var newTitle = story.saveTiddler(title,event.shiftKey);
		if(newTitle)
			story.displayTiddler(null,newTitle);		 
	} else { // the tiddler is being renamed 
		var tiddler = store.fetchTiddler(title);
		if(store.tiddlerExists(newTitle) && newTitle != title) {
			if(!confirm(config.messages.overwriteWarning.format([newTitle.toString()])))
				return false;
		}
		var adaptor = new ccTiddlyAdaptor();
		var userParams = {minorUpdate:event.shiftKey};
		var context = {title:title, newTitle:newTitle, workspace:window.workspace};
		adaptor.rename(context, userParams, config.commands.saveTiddlerHosted1.callback);
	}
	return false;
};

// implementing closeTiddler without the clearMessage();
Story.prototype.closeTiddler = function(title,animate,unused)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		this.scrubTiddler(tiddlerElem);
		if(config.options.chkAnimate && animate && anim && typeof Slider == "function")
			anim.startAnimating(new Slider(tiddlerElem,false,null,"all"));
		else {
			removeNode(tiddlerElem);
			forceReflow();
		}
	}
};

config.commands.saveTiddlerHosted1.callback = function(context, userParams) {
	var tiddler = store.fetchTiddler(context.title);
	if(tiddler) { // if tiddler exists with the old title. (we are renaming)
		story.closeTiddler(context.title,false);
		store.deleteTiddler(tiddler.title);
		tiddler.title = context.newTitle;
		store.addTiddler(tiddler);
		story.displayTiddler(null,tiddler.title);
		story.refreshTiddler(tiddler.title,null,true);
		store.notify(tiddler.title,true);
		displayMessage("Tiddler Renamed");
	} else {   //tiddler does not exist so this is a new tiddler. 
		var newTitle = story.saveTiddler(context.title,userParams.minorUpdate);
		if(newTitle)
			story.displayTiddler(null,newTitle);
		story.closeTiddler(context.title,false);

	}
}

function getServerType(fields)
{
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType)
		serverType = config.defaultCustomFields['server.type'];
	if(!serverType && typeof RevisionAdaptor != 'undefined' && fields.uuid)
		serverType = RevisionAdaptor.serverType;
	return serverType;
}

function invokeAdaptor(fnName,param1,param2,context,userParams,callback,fields)
{
	var serverType = getServerType(fields);
	if(!serverType)
		return null;
	var adaptor = new config.adaptors[serverType];
	if(!adaptor)
		return false;
	if(!config.adaptors[serverType].prototype[fnName])
		return false;
	adaptor.openHost(fields['server.host']);
	adaptor.openWorkspace(fields['server.workspace']);
	var ret = false;
	if(param1)
		ret = param2 ? adaptor[fnName](param1,param2,context,userParams,callback) : adaptor[fnName](param1,context,userParams,callback);
	else
		ret = adaptor[fnName](context,userParams,callback);

	//adaptor.close();
	//delete adaptor;
	return ret;
}

//# Returns true if function fnName is available for the serverType specified in fields
//# Used by (eg): config.commands.download.isEnabled
function isAdaptorFunctionSupported(fnName,fields)
{
	var serverType = getServerType(fields);
	if(!serverType || !config.adaptors[serverType])
		return false;
	if(!config.adaptors[serverType].isLocal && !fields['server.host'])
		return false;
	var fn = config.adaptors[serverType].prototype[fnName];
	return fn ? true : false;
}

config.commands.revisions.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTiddlerRevisionList',tiddler.fields);
};

config.commands.revisions.handler = function(event,src,title)
{
	var tiddler = store.fetchTiddler(title);
	userParams = {};
	userParams.tiddler = tiddler;
	userParams.src = src;
	userParams.dateFormat = config.commands.revisions.dateFormat;
	var revisionLimit = 10;
	if(!invokeAdaptor('getTiddlerRevisionList',title,revisionLimit,null,userParams,config.commands.revisions.callback,tiddler.fields))
		return false;
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(context,userParams)
// The revisions are returned as tiddlers in the context.revisions array
{
	var revisions = context.revisions;
//#displayMessage("config.commands.revisions.callback:"+revisions.length);
	popup = Popup.create(userParams.src);
	Popup.show(popup,false);
	if(revisions.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.revisions.popupNone);
	} else {
		revisions.sort(function(a,b) {return a.modified < b.modified ? +1 : -1;});
		for(var i=0; i<revisions.length; i++) {
			var tiddler = revisions[i];
			var modified = tiddler.modified.formatString(context.dateFormat||config.commands.revisions.dateFormat);
			var revision = tiddler.fields['server.page.revision'];
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
					config.commands.revisions.revisionTemplate.format([modified,revision,tiddler.modifier]),
					tiddler.text||config.commands.revisions.revisionTooltip,
					function() {
						config.commands.revisions.getTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('tiddlerModified'),this.getAttribute('tiddlerRevision'),this);
						return false;
						},
					'tiddlyLinkExisting tiddlyLink');
			btn.setAttribute('tiddlerTitle',userParams.tiddler.title);
			btn.setAttribute('tiddlerRevision',revision);
			btn.setAttribute('tiddlerModified',tiddler.modified.convertToYYYYMMDDHHMM());
			if(userParams.tiddler.fields['server.page.revision'] == revision || (!userParams.tiddler.fields['server.page.revision'] && i==0))
				btn.className = 'revisionCurrent';
		}
	}
};

config.commands.revisions.getTiddlerRevision = function(title,modified,revision)
{
	var tiddler = store.fetchTiddler(title);
	var context = {modified:modified};
	return invokeAdaptor('getTiddlerRevision',title,revision,context,null,config.commands.revisions.getTiddlerRevisionCallback,tiddler.fields);
};

config.commands.revisions.getTiddlerRevisionCallback = function(context,userParams)
{
	if(context.status) {
		var tiddler = context.tiddler;
		store.addTiddler(tiddler);
		store.notify(tiddler.title, true);
		story.refreshTiddler(tiddler.title,1,true);
		displayMessage(config.commands.revisions.done);
	} else {
		displayMessage(context.statusText);
	}
};

config.commands.deleteTiddlerHosted.handler = function(event,src,title)
{
	var tiddler = store.fetchTiddler(title);
		if(!tiddler)
			return false;
		var deleteIt = true;
		if(config.options.chkConfirmDelete)
		        deleteIt = confirm(this.warning.format([title]));
		if(deleteIt) {
			var ret = invokeAdaptor('deleteTiddler',title,null,null,null,config.commands.deleteTiddlerHosted.callback,tiddler.fields);
			if(ret){
			store.removeTiddler(title);
			story.closeTiddler(title,true);
			autoSaveChanges();
			store.setDirty(false);
			}
		}
		return false;

};

config.commands.deleteTiddlerHosted.callback = function(context,userParams)
{
	if(context.status) {
		displayMessage(config.commands.deleteTiddlerHosted.done + context.title);
	} else {
		if (context.statusText.indexOf("Not Found") == -1)
			displayMessage(context.statusText);
	}
};

}//# end of 'install only once'
//}}}

//  ccAbout //
	
config.macros.ccAbout={};
merge(config.macros.ccAbout,{
	buttonBackstageText:"about",
	buttonBackstageTooltip:"Find out more about ccTiddly ",
	stepAboutTitle:"About",
	stepAboutTextStart:"You are running ccTiddly ",
	stepAboutTextEnd:"More info about ccTiddly can be found  at <a  target=new href=http://www.tiddlywiki.org/wiki/CcTiddly>http://www.tiddlywiki.org/wiki/CcTiddly</a><br/><br/>  More information about TiddlyWiki can be found at <a target=new href=http://www.tiddlywiki.com>http://www.tiddlywiki.com</a><br/>"
});
config.backstageTasks.push(config.macros.ccAbout.buttonBackstageText);
merge(config.tasks,{about:{text: config.macros.ccAbout.buttonBackstageText,tooltip: config.macros.ccAbout.buttonBackstageTooltip,content: '<<ccAbout>>'}});
config.macros.ccAbout.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var w = new Wizard();
	var me = config.macros.ccAbout;
	w.createWizard(place,me.stepAboutTitle);
	w.addStep(null, me.stepAboutTextStart + window.ccTiddlyVersion + "<br /><br />" + me.stepAboutTextEnd);
};
//}}}


// ccAdaptor //

//{{{
	config.backstageTasks.remove("upgrade");
	config.backstageTasks.remove("save");
	config.backstageTasks.remove("sync");

	function isLoggedIn(){
		return (window.loggedIn == '1') 
	}

	function ccTiddlyAdaptor(){
	}

	merge(ccTiddlyAdaptor,{ 
		errorTitleNotSaved:"<h1>Your changes were NOT saved.</h1>", 
		errorTextSessionExpired:"Your Session has expired. <br /> You will need to log into the new window and then copy your changes from this window into the new window. ", 
		errorTextConfig:"There was a conflict when saving. <br /> Please open the page in a new window to see the changes.",
		errorTextUnknown:"An unknown error occured.",
		errorClose:"close",
		buttonOpenNewWindow:"Open a Window where I can save my changes	.... ",
		buttonHideThisMessage:"Hide this message", 
		msgErrorCode:"Error Code : "

	});

	ccTiddlyAdaptor.prototype = new AdaptorBase();

	ccTiddlyAdaptor.mimeType = 'application/json';
	ccTiddlyAdaptor.serverType = 'cctiddly'; // MUST BE LOWER CASE
	ccTiddlyAdaptor.serverParsingErrorMessage = "Error parsing result from server";
	ccTiddlyAdaptor.errorInFunctionMessage = "Error in function ccTiddlyAdaptor.%0";

	ccTiddlyAdaptor.minHostName = function(host){
		return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
	};

	// Convert a page title to the normalized form used in uris
	ccTiddlyAdaptor.normalizedTitle = function(title){
		return title;
	};

	// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
	ccTiddlyAdaptor.dateFromEditTime = function(editTime){
		var dt = editTime;
		return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
	};

	ccTiddlyAdaptor.prototype.login = function(context,userParams,callback){
		context = this.setContext(context,userParams,callback);
		var uriTemplate = '%0/handle/loginFile.php?cctuser=%1&cctpass=%2';
		var uri = uriTemplate.format([context.host,context.username,context.password]);
		var req = httpReq('GET',uri,ccTiddlyAdaptor.loginCallback,context);
		return typeof req == 'string' ? req : true;
	};

	ccTiddlyAdaptor.loginCallback = function(status,context,responseText,uri,xhr){
		if(xhr.status==401){
			context.status = false;
		}else{
			context.status = true;
			var c='sessionToken'+"="+responseText;
				c+="; expires=Fri, 1 Jan 2811 12:00:00 UTC; host=*";
				document.cookie=c;
		}
		if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.prototype.register = function(context,userParams,callback){
		context = this.setContext(context,userParams,callback);
		var uriTemplate = '%0/handle/register.php';
		var uri = uriTemplate.format([context.host,context.username,Crypto.hexSha1Str(context.password)]);
		var dataTemplate = 'username=&0&reg_mail=%1&password=%2&password2=%3';
		var data = dataTemplate.format([context.username,context.password1,context.password2]);
		var req = httpReq('POST', uri,ccTiddlyAdaptor.registerCallback,context,null,data);
		return typeof req == 'string' ? req : true;
	};

	ccTiddlyAdaptor.prototype.rename = function(context, userParams, callback){
		context = this.setContext(context,userParams,callback);
		var uri = window.url+"handle/renameTiddler.php?otitle="+context.title+"&ntitle="+context.newTitle+"&workspace="+window.workspace;
		httpReq('POST', uri,ccTiddlyAdaptor.renameCallback,context,null,null);
	};

	ccTiddlyAdaptor.renameCallback = function(status,context,responseText,uri,xhr){
		if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.registerCallback = function(status,context,responseText,uri,xhr){
		if(status){
			context.status = true;
		}else{
			context.status = false;
		}
		if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
	 	context = this.setContext(context,userParams,callback);
		var uriTemplate = '%0/handle/listWorkspaces.php';
		var uri = uriTemplate.format([context.host]);
		var req = httpReq('GET', uri,ccTiddlyAdaptor.getWorkspaceListCallback,context,{'accept':'application/json'});
		return typeof req == 'string' ? req : true;
	};

	ccTiddlyAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr){
		context.status = false;
		context.workspaces = [];
		context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
		if(status){
		try{
			eval('var workspaces=' + responseText);
		}catch (ex){
			context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
				return;
			}
			for (var i=0; i < workspaces.length; i++){
				context.workspaces.push({title:workspaces[i]})
			}
			context.status = true;
		}else{
				context.statusText = xhr.statusText;
		}
		if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.prototype.getTiddlerList = function(context,userParams,callback){
		context = this.setContext(context,userParams,callback);
		var uriTemplate = '%0/handle/listTiddlers.php?workspace=%1';
		var uri = uriTemplate.format([context.host,context.workspace]);
		var req = httpReq('GET', uri,ccTiddlyAdaptor.getTiddlerListCallback,context,{'accept':'application/json'});
		return typeof req == 'string' ? req : true;
	};

	ccTiddlyAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr){
		context.status = false;
		context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
		if(status){
			try{
				eval('var tiddlers=' + responseText);
			}catch (ex){
				context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
				if(context.callback)
					context.callback(context,context.userParams);
				return;
			}
			var list = [];
			for(var i=0; i < tiddlers.length; i++){
				var tiddler = new Tiddler(tiddlers[i]['title']);
				tiddler.fields['server.page.revision'] = tiddlers[i]['revision'];
				list.push(tiddler);
			}
			context.tiddlers = list;
			context.status = true;
		}else{
			context.statusText = xhr.statusText;
		}
		if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.prototype.generateTiddlerInfo = function(tiddler){
		var info ={};
		var host = this && this.host ? this.host : this.fullHostName(tiddler.fields['server.host']);
		var bag = tiddler.fields['server.bag']
		var workspace = tiddler.fields['server.workspace']
		var uriTemplate = '%0/%1/#%2';
		info.uri = uriTemplate.format([host,workspace,tiddler.title]);
		return info;
	};

	ccTiddlyAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback){
		context = this.setContext(context,userParams,callback);
		if(revision)
			context.revision = revision;
		return this.getTiddler(title,context,userParams,callback);
	};

	ccTiddlyAdaptor.prototype.getTiddler = function(title,context,userParams,callback){
		context = this.setContext(context,userParams,callback);
		if(title)
			context.title = title;
		   if(context.revision){
		         var uriTemplate = '%0/handle/revisionDisplay.php?title=%2&workspace=%1&revision=%3';
		  }else{
				var uriTemplate = '%0/handle/getTiddler.php?title=%2&workspace=%1';
		  }

		uri = uriTemplate.format([context.host,context.workspace,ccTiddlyAdaptor.normalizedTitle(title),context.revision]);
		context.tiddler = new Tiddler(title);
		context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
		context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(context.host);
		context.tiddler.fields['server.workspace'] = context.workspace;
		var req = httpReq('GET', uri,ccTiddlyAdaptor.getTiddlerCallback,context,{'accept':'application/json'});
		return typeof req == 'string' ? req : true;
	};

	ccTiddlyAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr){
	        context.status = false;
	        context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	        if(status){
	                var info=[]
	                try{
	                    eval('info=' + responseText);
	                }catch (ex){
	                        context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
	                        if(context.callback)
	                                context.callback(context,context.userParams);
	                        return;
	                }
	                context.tiddler.text = info['text'];
					context.tiddler.tags = info['tags'].split(" ");
	                context.tiddler.fields['server.page.revision'] = info['revision'];
				    context.tiddler.modifier = info['modifier'];
	                context.tiddler.modified = Date.convertFromYYYYMMDDHHMM(info['modified']);
	                context.tiddler.created = Date.convertFromYYYYMMDDHHMM(info['created']);
	                context.status = true;
	        }else{
	                context.statusText = xhr.statusText;
	                if(context.callback)
	                        context.callback(context,context.userParams);
	                return;
	        }
	        if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback){
		context = this.setContext(context,userParams,callback);
		context.title = title;
		context.revisions = [];
		var tiddler = store.fetchTiddler(title);
		var encodedTitle = encodeURIComponent(title);
		var uriTemplate = '%0/handle/revisionList.php?workspace=%1&title=%2';
		var host = this.fullHostName(this.host);
		var workspace = context.workspace ? context.workspace : tiddler.fields['server.workspace'];
		var uri = uriTemplate.format([host,workspace,encodedTitle]);
		var req = httpReq('GET', uri,ccTiddlyAdaptor.getTiddlerRevisionListCallback,context);
	};

	ccTiddlyAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr){
		if(responseText.indexOf('<!DOCTYPE html')==1)
			status = false;
		if(xhr.status=="204")
			status = false;
		context.status = false;
		if(status){
			var r =  responseText;
			if(r != '-' && r.trim() != 'revision not found'){
				var revs = r.split('\n');
				for(var i=0; i<revs.length; i++){
					var parts = revs[i].split(' ');
					if(parts.length>1){
						var tiddler = new Tiddler(context.title);
						tiddler.modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
						tiddler.fields['server.page.revision'] = String(parts[1]);
						tiddler.modifier = String(parts[2]);
						tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(context.host);
						tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
						context.revisions.push(tiddler);
					}
				}
			}
			context.revisions.sort(function(a,b){return a.modified<b.modified?+1:-1;});
			context.status = true;
		}else{
			context.statusText = xhr.statusText;
		}
		if(context.callback)
			context.callback(context,context.userParams);
	};

	ccTiddlyAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback){

		context = this.setContext(context,userParams,callback);
		context.title = tiddler.title;
		var recipeuriTemplate = '%0/handle/save.php';
		var host = context.host ? context.host : this.fullHostName(tiddler.fields['server.host']);
		var uri = recipeuriTemplate.format([host,context.workspace,tiddler.title]);
		var d = new Date();
		d.setTime(Date.parse(tiddler['modified']));
		d = d.convertToYYYYMMDDHHMM();
		var fieldString = "";
		for (var name in tiddler.fields){
			if (String(tiddler.fields[name]))
				fieldString += name +"='"+tiddler.fields[name]+"' ";
		}

		// Freds SEO Code 
		if(workspace)
		 	var breaker = "/";
		else
			var breaker = "";
		var el = createTiddlyElement(document.body, "div", "ccTiddlyTMP", null, null, { "style.display": "none" });
		var formatter = new Formatter(config.formatters);
		var wikifier = new Wikifier(tiddler.text,formatter,null,tiddler);
			wikifier.isStatic = true;
			wikifier.subWikify(el);
		delete formatter;
		var links = el.getElementsByTagName("a");
		for(var i = 0; i < links.length; i++) {
			var tiddlyLink = links[i].getAttribute("tiddlyLink");
		    if(tiddlyLink) {
		        if(hasClass(links[i], "tiddlyLinkNonExisting")) { // target tiddler does not exist
		            links[i].href = "#";
		        } else {
		            links[i].href = url+ workspace + breaker +tiddlyLink + ".html";
		        }
		    }
		}	
		// End Freds SEO Code 
		if(tiddler.fields['server.page.revision']==1)
			tiddler.fields['server.page.revision'] = 10000;
		else
			tiddler.fields['server.page.revision'] = parseInt(tiddler.fields['server.page.revision'],10)+1;
		var payload = "workspace="+window.workspace+"&otitle="+encodeURIComponent(context.otitle)+"&title="+encodeURIComponent(tiddler.title) + "&modified="+tiddler.modified.convertToYYYYMMDDHHMM()+"&modifier="+tiddler.modifier + "&tags="+tiddler.getTags()+"&revision="+encodeURIComponent(tiddler.fields['server.page.revision']) + "&fields="+encodeURIComponent(fieldString)+
	"&body="+encodeURIComponent(tiddler.text)+"&wikifiedBody="+encodeURIComponent(el.innerHTML)+"";
		var req = httpReq('POST', uri,ccTiddlyAdaptor.putTiddlerCallback,context,{'Content-type':'application/x-www-form-urlencoded', "Content-length": payload.length},payload,"application/x-www-form-urlencoded");
		removeNode(el);
		return typeof req == 'string' ? req : true;
	};


	ccTiddlyAdaptor.center  = function(el){
		var size = this.getsize(el);
		el.style.left = (Math.round(findWindowWidth()/2) - (size.width /2) + findScrollX())+'px';
		el.style.top = (Math.round(findWindowHeight()/2) - (size.height /2) + findScrollY())+'px';
	}

	ccTiddlyAdaptor.getsize = function (el){
		var x ={};
		x.width = el.offsetWidth || el.style.pixelWidth;
		x.height = el.offsetHeight || el.style.pixelHeight;
		return x;
	}

	ccTiddlyAdaptor.showCloak = function(){
		var cloak = document.getElementById('backstageCloak');
		if (config.browser.isIE){
			cloak.style.height = Math.max(document.documentElement.scrollHeight,document.documentElement.offsetHeight);
			cloak.style.width = document.documentElement.scrollWidth;
		}
		cloak.style.display = "block";
	}

	ccTiddlyAdaptor.hideError = function(){
		var box = document.getElementById('errorBox');
		box.parentNode.removeChild(box);
		document.getElementById('backstageCloak').style.display = "";
	}

	ccTiddlyAdaptor.handleError = function(error_code){
		setStylesheet(
		"#errorBox .button{padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak{height:100%;}"+
		"#errorBox{border:1px solid #ccc;background-color: #eee; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
		var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
		var error = ccTiddlyAdaptor.errorTitleNotSaved;
		switch(error_code){
			case 401:
				error += ccTiddlyAdaptor.errorTextSessionExpired;
				break;
			case 409:
				error += ccTiddlyAdaptor.errorTextConflict;
				break;
			default:
				error += ccTiddlyAdaptor.errorTextUnknown+"<br />"+ccTiddlyAdaptor.msgErrorCode+error_code;
		}
		box.innerHTML = " <a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><p>"+error+"</p><br/><br/>";
		createTiddlyButton(box,ccTiddlyAdaptor.buttonOpenNewWindow,null,function(e){ window.open (window.location,"mywindow");	 return false;});
		createTiddlyElement(box,"br");
		createTiddlyElement(box,"br");
		createTiddlyButton(box,ccTiddlyAdaptor.buttonHideThisMessage,null,function(){ccTiddlyAdaptor.hideError();});
		box.style.position = 'absolute';
		ccTiddlyAdaptor.center(box);
		ccTiddlyAdaptor.showCloak();
	}

	ccTiddlyAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr){
		context.status = false;
		if(status){
			context.status = true;
		}else{
			context.status = false;
			if(xhr.status == 401 || xhr.status==409){
				ccTiddlyAdaptor.handleError(xhr.status);
			}else{
				ccTiddlyAdaptor.handleError(xhr.status);
				context.statusText = xhr.statusText;
			}
		}
		if(context.callback){
			context.callback(context,context.userParams);
		}
	};

	ccTiddlyAdaptor.prototype.deleteTiddler = function(title,context,userParams,callback){	
		context = this.setContext(context,userParams,callback);
		context.title = title;
		title = encodeURIComponent(title);
		var host = this && this.host ? this.host : this.fullHostName(tiddler.fields['server.host']);
		var uriTemplate = '%0/handle/delete.php?workspace=%1&title=%2';
		var uri = uriTemplate.format([host,context.workspace,title]);
		var req = httpReq('POST', uri,ccTiddlyAdaptor.deleteTiddlerCallback,context);
		return typeof req == 'string' ? req : true;
	};

	ccTiddlyAdaptor.deleteTiddlerCallback = function(status,context,responseText,uri,xhr){
		if(status){
			context.status = true;
		}else{
			context.status = false;
			context.statusText = xhr.statusText;
		}
		if(context.callback)
			context.callback(context,context.userParams);
	};

	config.adaptors[ccTiddlyAdaptor.serverType] = ccTiddlyAdaptor;
//}}}


// ccAdmin //


//{{{

config.macros.ccAdmin = {}
merge(config.macros.ccAdmin,{
	stepAddTitle:"Add a new Workspace Administrator",
	WizardTitleText:"Workspace Administration.",
	buttonDeleteText:"Delete Users",
	buttonDeleteTooltip:"Click to delete users.",
	buttonAddText:"Add User",
	buttonAddTooltip:"Click to add user.",
	buttonCancelText:"Cancel",
	buttonCalcelTooltip:"Calcel adding user.",
	buttonCreateText:"Make User Admin",
	buttonCreateTooltip:"Click to make user admin.",
	labelWorkspace:"Workspace: ",
	labelUsername:"Username  : ",
	stepErrorTitle:"You need to be an administrator of this workspace.",
	stepErrorText:"Permission Denied to edit workspace : ",
	stepNoAdminTitle:"There are no admins of this workspace.",
	stepManageWorkspaceTitle:"",
	listAdminTemplate: {
	columns: [	
		{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
		{name: 'Name', field: 'name', title: "Username", type: 'String'},	
		{name: 'Last Visit', field: 'lastVisit', title: "Last Login", type: 'String'}
	],
	rowClasses: [
		{className: 'lowlight', field: 'lowlight'}
	]}
	
});

config.macros.ccAdmin.handler = function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	var w = new Wizard();
	w.createWizard(place,config.macros.ccAdmin.WizardTitleText);
	config.macros.ccAdmin.refresh(w);
};

config.macros.ccAdmin.refresh= function(w){
	params = {};
	params.w = w;
	params.e = this;
	me = config.macros.ccAdmin;
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTALL&workspace='+workspace,null,null,null,config.macros.ccAdmin.listAllCallback,params);
	w.setButtons([
		{caption: me.buttonDeleteText, tooltip: me.buttonDeleteTooltip, onClick: function(w){ 
			config.macros.ccAdmin.delAdminSubmit(null, params);
		 	return false;
		}}, 
		{caption: me.buttonAddText, tooltip: me.buttonAddTooltip, onClick: function(w){
			config.macros.ccAdmin.addAdminDisplay(null, params); return false } }]);
};

config.macros.ccAdmin.delAdminSubmit = function(e, params){
	var listView = params.w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	var delUsers = "";
	for(var e=0; e < rowNames.length; e++) 
		delUsers += rowNames[e]+",";
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=DELETEADMIN&username='+delUsers+'&workspace='+workspace,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
	return false; 
};

config.macros.ccAdmin.addAdminDisplay = function(e, params){
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTWORKSPACES',null,null,null,config.macros.ccAdmin.listWorkspaces,params);
};

config.macros.ccAdmin.listWorkspaces = function(status,params,responseText,uri,xhr){
	var frm = createTiddlyElement(null,'form',null,null);
	var me = config.macros.ccAdmin;
	frm.onsubmit = config.macros.ccAdmin.addAdminSubmit;	
	params.w.addStep(me.stepAddTitle,"<input type='hidden' name='admin_placeholder'/>"+me.labelUsername+"<input name=adminUsername><br />"+me.labelWorkspace+"<select name=workspaceName />");
	var workspaces = eval('[ '+responseText+' ]');
	for(var t=0; t<workspaces.length; t++) {
		var o = createTiddlyElement(params.w.formElem.workspaceName, "option", null, null, workspaces[t]);
		o.value=workspaces[t];
		if(workspaces[t] == workspace)
			o.selected = true;
	}
	params.w.formElem.admin_placeholder.parentNode.appendChild(frm);
	params.w.setButtons([
		{caption: me.buttonCancelText, tooltip: me.buttonCancelTooltip, onClick: function(w){ config.macros.ccAdmin.refresh(params.w) } },
		{caption: me.buttonCreateText, tooltip: me.buttonCreateTooltip, onClick: function(){config.macros.ccAdmin.addAdminSubmit(null, params);  } }
	]);
};

config.macros.ccAdmin.addAdminSubmit = function(e, params){
	doHttp('POST',url+'/handle/workspaceAdmin.php','&add_username='+params.w.formElem.adminUsername.value+'&action=addNew&workspace='+params.w.formElem.workspaceName[params.w.formElem.workspaceName.selectedIndex].value,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
	return false; 
};

config.macros.ccAdmin.listAllCallback = function(status,params,responseText,uri,xhr) {
	var me = config.macros.ccAdmin;
	var out = "";
	var adminUsers = [];
	if(xhr.status == 403){
		var html ='';
		params.w.addStep(me.stepErrorText+workspace, me.stepErrorTitle);
		params.w.setButtons([]);
		return false;
	}
	try{
		var a = eval(responseText);
		for(var e=0; e < a.length; e++){
			out += a[e].username;
			adminUsers.push({
			name: a[e].username,
			lastVisit:a[e].lastVisit});
		}
	}catch(ex){
			params.w.addStep(" "+workspace, me.stepNoAdminTitle);
			params.w.setButtons([
				{caption: me.buttonCreateText, tooltip: me.buttonCreateTooltip, onClick: function(){ config.macros.ccAdmin.addAdminDisplay(null, params)}}]);
			return false;
	}
	var html ='<input type="hidden" name="markList"></input>';
	params.w.addStep(me.stepManageWorkspaceTitle+workspace, html);
	var markList = params.w.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,adminUsers,config.macros.ccAdmin.listAdminTemplate);
	params.w.setValue("listView",listView);
};

config.macros.ccAdmin.addAdminCallback = function(status,params,responseText,uri,xhr) {
	config.macros.ccAdmin.refresh(params.w);
};

//}}}


//  ccAutoSave //


//{{{
	
//# Ensure that the plugin is only installed once.
if(!version.extensions.ccTiddlyAutoSavePlugin) {
	version.extensions.ccTiddlyAutoSavePlugin = {installed:true};

function ccTiddlyAutoSave(){
	return this;
}

merge(ccTiddlyAutoSave,{
	msgSaved:"Saved ",
	msgError:"There was an error saving "
});

ccTiddlyAutoSave.putCallback = function(context, userParams){
	tiddler = context.tiddler;
	if (context.status){
		if (context.otitle != tiddler.title){
			var ret = invokeAdaptor('deleteTiddler',context.otitle,null,null,null,config.commands.deleteTiddlerHosted.callback,tiddler.fields);
		}
		displayMessage(ccTiddlyAutoSave.msgSaved + tiddler.title);
		tiddler.clearChangeCount();
	}else{
		displayMessage(ccTiddlyAutoSave.msgError + tiddler.title + ' ' + context.statusText);
		tiddler.incChangeCount();
	}
};

TiddlyWiki.prototype.orig_saveTiddler = TiddlyWiki.prototype.saveTiddler;	//hijack
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created){
	var tiddler = this.fetchTiddler(title);
	tiddler = this.orig_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,false,created);
	var adaptor = new config.adaptors['cctiddly'];
	// put the tiddler and deal with callback
	tiddler.fields['server.host'] = window.url;
	tiddler.fields['server.type'] = config.defaultCustomFields['server.type'];
	tiddler.fields['server.workspace'] = window.workspace;
	tiddler.clearChangeCount();
	context = {};
	context.tiddler = tiddler;
	context.otitle = title;
	context.workspace = window.workspace;
	context.host = window.url;
	req = adaptor.putTiddler(tiddler, context, {}, ccTiddlyAutoSave.putCallback);
	if(req)
		store.setDirty(false);
	return req ? tiddler : false;
};
} //# end of 'install only once'
//}}}

// ccCreateWorkspace //


//{{{

config.macros.ccCreateWorkspace = {}
merge(config.macros.ccCreateWorkspace, {
	wizardTitle:"Create Workspace",
	buttonCreateText:"create",
	buttonCreateWorkspaceText:"Create Workspace",
	buttonCreateTooltip:'Create new workspace',
	errorPermissions:"You do not have permissions to create a workspace.  You may need to log in.",
	msgPleaseWait:"Please wait, your workspace is being created.",
	msgWorkspaceAvailable:"Workspace name is available.",
	errorWorkspaceNameInUse:"Workspace name is already in use.",
	stepTitle:"Please enter workspace name",
	stepCreateHtml:"<input class='input' id='workspace_name' name='workspace_name' value='"+workspace+"' tabindex='1' /><span></span><input type='hidden' name='workspace_error'></input><h2></h2><input type='hidden' name='workspace_url'></input>"
});
	

if(isLoggedIn()){
	config.backstageTasks.push(config.macros.ccCreateWorkspace.buttonCreateText);
	merge(config.tasks,{create: {text: config.macros.ccCreateWorkspace.buttonCreateText, tooltip: config.macros.ccCreateWorkspace.buttonCreateTooltip, content:'<<ccCreateWorkspace>>'}});
}

config.macros.ccCreateWorkspace.setStatus=function(w,element,text){
	var label_var = w.getElement(element);
	removeChildren(label_var.previousSibling);
	var label = document.createTextNode(text);
	label_var.previousSibling.insertBefore(label,null);
}

config.macros.ccCreateWorkspace.workspaceNameKeyPress=function(w){
	params={};
	params.w = w;
	doHttp('POST',url+'/handle/lookupWorkspaceName.php',"ccWorkspaceLookup="+w.formElem["workspace_name"].value+"&free=1",null,null,null,config.macros.ccCreateWorkspace.workspaceNameCallback,params);	
	return false;
};
 	
config.macros.ccCreateWorkspace.workspaceNameCallback=function(status,params,responseText,uri,xhr){
	var me = config.macros.ccCreateWorkspace;
	if(responseText > 0){{
			config.macros.register.setStatus(params.w, "workspace_error", me.errorWorkspaceNameInUse);
			config.macros.register.setStatus(params.w, "workspace_url", "");
	}}else{
		config.macros.register.setStatus(params.w, "workspace_error", me.msgWorkspaceAvailable);
		if (window.useModRewrite == 1)
			config.macros.register.setStatus(params.w, "workspace_url", url+''+params.w.formElem["workspace_name"].value);			 
		else
			config.macros.register.setStatus(params.w, "workspace_url", url+'?workspace='+params.w.formElem["workspace_name"].value);
	}
};

config.macros.ccCreateWorkspace.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	if (window.workspacePermission.canCreateWorkspace!=1) {
		createTiddlyElement(place,'div', null, "annotation",  config.macros.ccCreateWorkspace.errorPermissions);
		return null;
	}
	var me = config.macros.ccCreateWorkspace;
	var w = new Wizard();
	w.createWizard(place,me.wizardTitle);
	w.addStep(me.stepTitle, me.stepCreateHtml);
	w.formElem["workspace_name"].onkeyup=function() {me.workspaceNameKeyPress(w);};
	w.setButtons([
		{caption: me.buttonCreateWorkspaceText, tooltip: me.buttonCreateWorkspaceTooltip, onClick:function(){config.macros.ccCreateWorkspace.createWorkspaceOnSubmit(w);}
	}]);
};

config.macros.ccCreateWorkspace.createWorkspaceOnSubmit = function(w){
	var params = {}; 
	if(window.useModRewrite == 1)
		params.url = url+w.formElem["workspace_name"].value; 
	else
		params.url = url+'?workspace='+w.formElem["workspace_name"].value;
	var loginResp = doHttp('POST',url+'?&workspace='+w.formElem["workspace_name"].value+"/",'&ccCreateWorkspace=' + encodeURIComponent(w.formElem["workspace_name"].value)+'&amp;ccAnonPerm='+encodeURIComponent("AADD"),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	return false; 
};

config.macros.ccCreateWorkspace.createWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	if(xhr.status==201){
		window.location = params.url;
	}else if(xhr.status == 200){
		displayMessage(config.macros.ccCreateWorkspace.errorWorkspaceNameInUse);
	}else if(xhr.status == 403){
		displayMessage(config.macros.ccCreateWorkspace.errorPermissions);	
	}else{
		displayMessage(responseText);	
	}
};
//}}}

// ccEditWorkspace //


//{{{
	
config.macros.ccEditWorkspace={};	
merge(config.macros.ccEditWorkspace,{
	WizardTitleText:"Edit Workspace Permissions",
	stepEditTitle:null,
	stepLabelCreate:'Create',
	stepLabelRead:'Read',
	stepLabelUpdate:'Edit',
	stepLabelDelete:'Delete',
	stepLabelPermission:'',
	stepLabelAnon:'  Anonymous   ',
	stepLabelUser:' Authenticated   ',
	stepLabelAdmin:' Admin  ',
	buttonSubmitCaption:"Update Workspace Permissions",
	buttonSubmitToolTip:"Update workspace permissions",
	button1SubmitCaption:"ok",
	button1SubmitToolTip:"review permissions",
	step2Error:"Error", 
	errorTextPermissionDenied:"You do not have permissions to edit this workspace permissions.  You may need to log in.",
	errorUpdateFailed:"Permissions Not changed"
});
	
config.macros.ccEditWorkspace.handler = function(place, macroName, params, wikifier, paramString, tiddler){
	var me = config.macros.ccEditWorkspace;
	if(workspacePermission.owner !=1){
		createTiddlyElement(place,'div', null, "annotation",  me.errorTextPermissionDenied);
		return null;
	}
	var w = new Wizard();
	w.createWizard(place, this.WizardTitleText);
	var booAdmin = false;
	var booUser = false;
	var booAnon = false;
	// Check which colums to display
	for(i = 0; i <= params.length - 1; i++){
		switch (params[i].toLowerCase()) {
			case 'admin':
				booAdmin = true;
				break;
			case 'user':
				booUser = true;
				break;
			case 'anon':
				booAnon = true;
				break;
		}
	}
	// if nothing passed show all
	if(!booAdmin && !booUser && !booAnon){
		booAdmin = true;
		booUser = true;
		booAnon = true;
	}
	var tableBodyBuffer = new Array();
	tableBodyBuffer.push('<table border=0px class="listView twtable">');
	tableBodyBuffer.push('<tr">');
	tableBodyBuffer.push('<th>' + this.stepLabelPermission + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<th>' + this.stepLabelAnon + '</th>');
	}
	if(booUser){
		tableBodyBuffer.push('<th>' + this.stepLabelUser + '</th>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<th>' + this.stepLabelAdmin + '</th>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>')
	tableBodyBuffer.push('<th align="right">'+this.stepLabelRead+'</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anR" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonR == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usR" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userR == 1 ? 'checked' : '');
		tableBodyBuffer.push('></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adR" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>');
	tableBodyBuffer.push('<th  align="right">' + this.stepLabelCreate + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anC" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonC == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usC" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userC == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adC" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>');
	tableBodyBuffer.push('<th  align="right">' + this.stepLabelUpdate + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anU" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonU == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usU" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userU == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adU" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>');
	tableBodyBuffer.push('<th  align="right">' + this.stepLabelDelete + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anD" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonD == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usD" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userD == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adD" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('</table>');
	var stepHTML = tableBodyBuffer.join('');
	w.addStep(this.stepEditTitle,stepHTML);
	w.setButtons([
		{caption: this.buttonSubmitCaption, tooltip: this.buttonSubmitToolTip, onClick: function() {me.ewSubmit(place, macroName, params, wikifier, paramString, tiddler,w,booAnon,booUser);}
	}]);

};

config.macros.ccEditWorkspace.ewSubmit = function(place, macroName, params2, wikifier, paramString, tiddler,w, booAnon, booUser){
	var trueStr = "A";
	var falseStr = "U";
	var anon = '';
	var user = '';
	if(booAnon){
		var anonBuffer = new Array();
		anonBuffer.push(w.formElem['anR'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anC'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anU'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anD'].checked ? trueStr : falseStr);
		anon = anonBuffer.join('');
	}
	if(booUser){
		var userBuffer = new Array();
		userBuffer.push(w.formElem['usR'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usC'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usU'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usD'].checked ? trueStr : falseStr);
		user = userBuffer.join('');
	}
	var params = new Array();
	params.w = w;
	params.u = user;
	params.a = anon;
	params.p = place;
	params.m =  macroName;
	params.pr = params2;
	params.wi = wikifier;
	params.ps = paramString;
	params.t = tiddler;
	doHttp('POST', url + '/handle/updateWorkspace.php', 'ccCreateWorkspace=' + encodeURIComponent(workspace) + '&ccAnonPerm=' + encodeURIComponent(anon) + '&ccUserPerm=' + encodeURIComponent(user), null, null, null, config.macros.ccEditWorkspace.editWorkspaceCallback, params);
	return false;
}
config.macros.ccEditWorkspace.editWorkspaceCallback = function(status,params,responseText,uri,xhr){
	var w = params.w;
	var me = config.macros.ccEditWorkspace;
	if(xhr.status == 200){
		// use the incoming parameters to set the workspace permission variables.
		if (params.a != ''){
			workspacePermission.anonR = (params.a.substr(0,1)=='A'?1:0);
			workspacePermission.anonC = (params.a.substr(1,1)=='A'?1:0);
			workspacePermission.anonU = (params.a.substr(2,1)=='A'?1:0);
			workspacePermission.anonD = (params.a.substr(3,1)=='A'?1:0);
		}
		if (params.u != ''){
			workspacePermission.userR = (params.u.substr(0,1)=='A'?1:0);
			workspacePermission.userC = (params.u.substr(1,1)=='A'?1:0);
			workspacePermission.userU = (params.u.substr(2,1)=='A'?1:0);
			workspacePermission.userD = (params.u.substr(3,1)=='A'?1:0);
		}
		w.addStep('',responseText);
		// want to set a back button here
		w.setButtons([
			{caption: me.button1SubmitCaption, tooltip: me.button1SubmitToolTip, onClick: function() {config.macros.ccEditWorkspace.refresh(params.p,	params.m,	params.pr,	params.wi,	params.ps,	params.t);}}
		]);
	}else{
		w.addStep(me.step2Error+': ' + xhr.status,config.macros.ccEditWorkspace.errorUpdateFailed);
	}
	return false;
};
config.macros.ccEditWorkspace.refresh = function(place, macroName, params, wikifier, paramString, tiddler){
	removeChildren(place);
	config.macros.ccEditWorkspace.handler(place, macroName, params, wikifier, paramString, tiddler);
}
//}}}

// ccFile //


//{{{
	
config.macros.ccFile = {};

merge(config.macros.ccFile,{
	wizardTitleText:"Manage Files",
	wizardStepText:"Manage files in workspace ",
	buttonDeleteText:"Delete Files",
	buttonDeleteTooltip:"Click to Delete files.",
	buttonUploadText:"Upload File",
	buttonUploadTooltip:"Click to Upload files.",
	buttonCancelText:"Cancel",
	buttonCancelTooltip:"Click to cancel.",
	labelFiles:"Existing Files ",
	errorPermissionDeniedTitle:"Permission Denied",
	errorPermissionDeniedUpload:"You do not have permissions to create a file on this server. ",
	errorPermissionDeniedView:"You do not have permissions to view files in this workspace. ",
	listAdminTemplate: {
	columns: [	
	{name: 'wiki text', field: 'wikiText', title: "", type: 'WikiText'},
	{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
	{name: 'Name', field: 'name', title: "File", type: 'WikiText'},
	{name: 'Size', field: 'fileSize', title: "size", type: 'String'}
	],
	rowClasses: [
	{className: 'lowlight', field: 'lowlight'}
	]}
});

var iFrameLoad=function(w){
	var uploadIframe = document.getElementById('uploadIframe');
	var a = createTiddlyElement(null, "div");
	a.innerHTML = uploadIframe.contentDocument.body.innerHTML;
	removeChildren(w.formElem.placeholder);
	w.formElem.placeholder.parentNode.appendChild(a);
	var statusArea = w.formElem.placeholder;
	document.getElementById("ccfile").value=""; 
};

config.macros.ccFile.handler=function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	var w = new Wizard();
	w.createWizard(place,config.macros.ccFile.wizardTitleText);
	config.macros.ccFile.refresh(w);
};

config.macros.ccFile.refresh=function(w){
	params = {};
	params.w = w;
	params.e = this;
	var me = config.macros.ccFile;
	doHttp('GET',url+'/handle/listFiles.php?workspace='+workspace,'',null,null,null,config.macros.ccFile.listAllCallback,params);
	w.setButtons([
		{caption: me.buttonDeleteText, tooltip: me.buttonDeleteTooltip, onClick: function(w){ 
			config.macros.ccFile.delFileSubmit(null, params);
			 return false;
		}}, 
		{caption: me.buttonUploadText, tooltip: me.buttonUploadTooltip, onClick: function(e){ 
			config.macros.ccFile.addFileDisplay(null, params); return false 
			} }
	]);
};

config.macros.ccFile.delFileSubmit=function(e, params) {
	var listView = params.w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	for(var e=0; e < rowNames.length; e++) 
	doHttp('POST',url+'/handle/listFiles.php','action=DELETEFILE&file='+rowNames[e]+'&workspace='+workspace,null,null,null,config.macros.ccFile.delFileCallback,params);
	return false; 
};

config.macros.ccFile.delFileCallback=function(status,params,responseText,uri,xhr){
	config.macros.ccFile.refresh(params.w);
};

config.macros.ccFile.addFileDisplay = function(e, params){
	var frm = params.w.formElem;
	if(navigator.appName=="Microsoft Internet Explorer"){
		encType = frm.getAttributeNode("enctype");
	    encType.value = "multipart/form-data";
	}
	frm.setAttribute("enctype","multipart/form-data");
	frm.setAttribute("method","POST");
	frm.action=window.url+"/handle/upload.php"; 
	frm.id="ccUpload";
	frm.target="uploadIframe";
	frm.name = "uploadForm";
	frm.parentNode.appendChild(frm);
	params.w.addStep("ss", "<input id='ccfile' class='input' type='file' name='userFile'/>"+"<input type='hidden' name='placeholder'/>");
	var workspaceName=createTiddlyElement(null,'input','workspaceName','workspaceName');				
	workspaceName .setAttribute('name','workspace');
	workspaceName.type="HIDDEN";
	workspaceName.value=workspace;
	frm.appendChild(workspaceName);
	createTiddlyElement(frm,'br');
	var saveTo=createTiddlyElement(null,"input","saveTo","saveTo");	
	var iframe=document.createElement("iframe");
	iframe.style.display="none";
	iframe.id='uploadIframe';
	iframe.name='uploadIframe';
	iframe.onload = function() {
		iFrameLoad(params.w);
	}	
	frm.appendChild(iframe);
	createTiddlyElement(frm,"div",'uploadStatus');
	params.w.setButtons([
	{caption: config.macros.ccFile.buttonCancelText, tooltip: config.macros.ccFile.buttonCancelTooltip, onClick: function(){config.macros.ccFile.refresh(params.w);}
	},
	{caption: config.macros.ccFile.buttonUploadText, tooltip: config.macros.ccFile.buttonUploadTooltip, onClick: function(){params.w.formElem.submit();}
	}]);
};

function addOption(selectbox,text,value ){
	var optn = document.createElement("OPTION");
	optn.text = text;
	optn.value = value;
	selectbox.options.add(optn);
}

config.macros.ccFileImageBox = function(image){
	var full = image.src;
	setStylesheet(
	"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
	"html > body > #backstageCloak {height:"+window.innerHeight*2+"px;}"+
	"#errorBox {border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
	var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
	box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+image.src+"</h3><br />";
	box.style.position = 'absolute';
	box.style.width= "800px";
	var img = createTiddlyElement(box, "img");
	img.src = full;
	ccTiddlyAdaptor.center(box);
	ccTiddlyAdaptor.showCloak();
}

config.macros.ccFile.listAllCallback = function(status,params,responseText,uri,xhr){
	var me = config.macros.ccFile;
	var out = "";
	var adminUsers = [];
	if(xhr.status!=200){
		params.w.addStep(me.errorPermissionDeniedTitle, me.errorPermissionDeniedView);
		return true;
	}
	try{
		var a = eval(responseText);
		for(var e=0; e < a.length; e++){ 		
		out += a[e].username;	
			adminUsers.push({
				htmlName: "<html><a href='"+a[e].url+"' target='new'>"+a[e].filename+"</a></html>",
				name: a[e].filename,
				wikiText:'<html><img onclick="config.macros.ccFileImageBox(this)"; src="'+a[e].url+'" style="width: 70px; "/></html>',
				lastVisit:a[e].lastVisit,
				fileSize:a[e].fileSize
			});
		}
	}catch (ex){
		params.w.setButtons([
			{caption: me.buttonUploadText, tooltip: me.buttonUploadTooltip, onClick: function(w){				
				config.macros.ccFile.addFileDisplay(e, params);
			} }]);
	}
	params.w.addStep(me.wizardStepText+workspace, "<input type='hidden' name='markList'></input>");
	var markList = params.w.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,adminUsers,config.macros.ccFile.listAdminTemplate);
	//params.w.setValue("listAdminView",listAdminView);
	params.w.setValue("listView",listView);
};

config.macros.ccFile.addFileCallback = function(status,params,responseText,uri,xhr){	
	displayMessage("got to here ");
	config.macros.ccFile.refresh(params.w);
};
//}}}

// ccLogin //

//{{{

config.macros.ccLogin={sha1:true};

merge(config.macros.ccLogin,{
	WizardTitleText:null,
	usernameRequest:"Username",
	passwordRequest:"Password",
	stepLoginTitle:null,
	stepLoginIntroTextHtml:"<label>username</label><input name=username id=username tabindex='1'><br /><label>password</label><input type='password' tabindex='2' class='txtPassword'><input   name='password'>",
	stepDoLoginTitle:"Logging you in",
	stepDoLoginIntroText:"we are currently trying to log you in.... ",
	stepForgotPasswordTitle:"Password Request",
	stepForgotPasswordIntroText:"Please contact your system administrator or register for a new account.  <br /><input id='forgottenPassword' type='hidden' name='forgottenPassword'/>",
	stepLogoutTitle:"Logout",
	stepLogoutText:"You are currently logged in as ",
	buttonLogout:"logout",
	buttonLogoutToolTip:"Click here to logout.",
	buttonLogin:"Login",
	buttonlogin:"login",
	buttonLoginToolTip:"Click to Login.",	
	buttonCancel:"Cancel",
	buttonCancelToolTip:"Cancel transaction ",
	buttonForgottenPassword:"Forgotten Password",	
	buttonSendForgottenPassword:"Mail me a New Password",
	buttonSendForgottenPasswordToolTip:"Click here if you have forgotten your password",
	buttonForgottenPasswordToolTip:"Click to be reminded of your password",
	msgNoUsername:"Please enter a username", 
	msgNoPassword:"Please enter a password",
	msgLoginFailed:"Login Failed, please try again. ", 
	configURL:url+"/handle/login.php", 
	configUsernameInputName:"cctuser",
	configPasswordInputName:"cctpass",
	configPasswordCookieName:"cctPass"
});

config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	if(isLoggedIn()){
		createTiddlyButton(place, config.macros.ccLogin.buttonLogout, config.macros.ccLogin.buttonLogoutToolTip, function(){
				if (window.fullUrl.indexOf("?") >0)
					window.location = window.fullUrl+"&logout=1";
				else
					window.location = window.fullUrl+"?logout=1";
			return false;
		},null,null,this.accessKey);
	}else{
		createTiddlyButton(place,config.macros.ccLogin.buttonlogin, config.macros.ccLogin.buttonLoginToolTip, function() {
			story.displayTiddler(null, "Login");
		},null,null,this.accessKey);
	}
};
	
if (isLoggedIn()){
	config.backstageTasks.push("logout");
	merge(config.tasks,{logout:{text: "logout",tooltip: config.macros.ccLogin.buttonLogoutToolTip,content: '<<ccLogin>>'}});
}else{
	config.backstageTasks.push("login");
	merge(config.tasks,{login:{text: "login",tooltip: config.macros.ccLogin.buttonLoginToolTip,content: '\r\n\r\n<<tiddler Login>>'}});	
}

var loginState=null;
var registerState=null;

config.macros.ccLogin.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.ccLogin.refresh(place);
};
 
config.macros.ccLogin.refresh=function(place, error){
	removeChildren(place);
	var w = new Wizard();
	if (isLoggedIn()){
		w.createWizard(place,this.stepLogoutTitle);
		w.addStep(null, this.stepLogoutText+decodeURIComponent(cookieString(document.cookie).txtUserName)+"<br /><br />");
		w.setButtons([
			{caption: this.buttonLogout, tooltip: this.buttonLogoutToolTip, onClick: function() {window.location=fullUrl+"?&logout=1"}
		}]);
		return true;
	}
	w.createWizard(place,this.WizardTitleText);
	var me=config.macros.ccLogin;
	var oldForm = w.formElem.innerHTML;
	var form = w.formElem;
	if (error!==undefined)
		this.stepLoginTitle=error;	
	w.addStep(this.stepLoginTitle,me.stepLoginIntroTextHtml);
	txtPassword = findRelated(w.formElem.password,"txtPassword","className","previousSibling");
	w.formElem.password.style.display="none";
	txtPassword.onkeyup = function() {
		if(me.sha1 == true)
			w.formElem.password.value = Crypto.hexSha1Str(txtPassword.value);
		else 
			w.formElem.password.value = txtPassword.value;
	};
	txtPassword.onchange = txtPassword.onkeyup;
	w.formElem.method ="POST";
	w.formElem.onsubmit = function() {config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place); return false;};
	var submit = createTiddlyElement(null, "input");
	submit.type="submit";
	submit.style.display="none";
	w.formElem.appendChild(submit);
	var cookieValues=findToken(document.cookie);
	if (cookieValues.txtUserName!==undefined){
		w.formElem["username"].value=decodeURIComponent(cookieValues.txtUserName) ;
	}
	var footer = findRelated(form,"wizardFooter","className");
	createTiddlyButton(w.footer,this.buttonLogin,this.buttonLoginToolTip,function() {
		if (w.formElem["username"].value==""){
			displayMessage(me.msgNoUsername);
			return false;
		}
		if (w.formElem["password"].value==""){
			displayMessage(me.msgNoPassword);
			return false;
		}
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	});
	
	
	
		var li_register = createTiddlyElement(w.footElem, "label");
	createTiddlyButton(w.footElem,this.buttonLogin,this.buttonLoginToolTip,function() {
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	},null, null, null,  {tabindex:'3'});
	
	if(config.macros.register!==undefined){		
		var li_register = createTiddlyElement(w.footElem, "li");
		createTiddlyButton(li_register,config.macros.register.buttonRegister,config.macros.register.buttonRegisterToolTip,function() {
				config.macros.register.displayRegister(place, w, this);
		},"nobox", null, null,  {tabindex:4});
	}
	var li_forgotten = createTiddlyElement(w.footElem, "li");
	createTiddlyButton(li_forgotten,this.buttonForgottenPassword,this.buttonForgottenPasswordToolTip,function() {
		config.macros.ccLogin.displayForgottenPassword(this, place);
	},"nobox", null, null,  {tabindex:5});

};

config.macros.ccLogin.doLogin=function(username, password, item, place){
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	var userParams = {};
	userParams.place = place;
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.host = window.url;
	context.username = username;
	context.password = password;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback)
	var html = me.stepDoLoginIntroText; 
	w.addStep(me.stepDoLoginTitle,html);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.ccLogin.loginCallback=function(context,userParams){
	if(context.status){
		window.location.reload();
	}else{
		config.macros.ccLogin.refresh(userParams.place, config.macros.ccLogin.msgLoginFailed);
	} 
};

config.macros.ccLogin.displayForgottenPassword=function(item, place){	
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	w.addStep(me.stepForgotPasswordTitle,me.stepForgotPasswordIntroText);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {me.refresh(place);}}
	]);
};

//config.macros.ccLogin.sendForgottenPassword=function(item, place){	
//	var w = new Wizard(item);
//	var me = config.macros.ccLogin;
//}

config.macros.toolbar.isCommandEnabled=function(command,tiddler){	
	var title=tiddler.title;
	if (workspace_delete=="D"){
		// REMOVE OPTION TO DELETE TIDDLERS 
		if (command.text=='delete')
			return false;
	}
	if (workspace_udate=="D"){
		// REMOVE EDIT LINK FROM TIDDLERS 
		if (command.text=='edit')
			return false;
	}
	var ro=tiddler.isReadOnly();
	var shadow=store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};

// Returns output var with output.txtUsername and output.sessionToken
function findToken(cookieStash){
	var output={};
	if (!cookieStash)
		return false;	
	//  THIS IS VERY HACKY AND SHOULD BE REFACTORED WHEN TESTS ARE IN PLACE
	var cookies=cookieStash.split('path=/');
	for(var c=0; c < cookies.length ; c++){
		var cl =cookies[c].split(";");
		for(var e=0; e < cl.length; e++){ 
			var p=cl[e].indexOf("=");
			if(p!=-1){
				var name=cl[e].substr(0,p).trim();
				var value=cl[e].substr(p+1).trim();       
				if (name=='txtUserName'){
					output.txtUserName=value;
				}
				if (name=='sessionToken'){
					output.sessionToken=value;
				}
			}
		}
	}	
	return output;
};

function cookieString(str){	
	var cookies = str.split(";");
	var output = {};
	for(var c=0; c < cookies.length; c++){
		var p = cookies[c].indexOf("=");
		if(p != -1) {
			var name = cookies[c].substr(0,p).trim();
			var value = cookies[c].substr(p+1).trim();
			if (name=='txtUserName'){
				output.txtUserName=value;
			}
			if (name=='sessionToken'){
				output.sessionToken=value;
			}
		}
	}
	return output;
}

Story.prototype.displayDefaultTiddlers = function(){
 	var tiddlers="";
	if(isLoggedIn()){        
		var url = window.location;        
		url = url.toString();        
		var bits = url.split('#');        
		if(bits.length == 1){            
			tiddlers = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));            
			story.displayTiddlers(null, tiddlers);
		}
	}else{         
		tiddlers=store.filterTiddlers(store.getTiddlerText("AnonDefaultTiddlers"));        
		story.displayTiddlers(null, tiddlers);   
	}    
};

window.restart = function(){
	story.displayDefaultTiddlers();
	invokeParamifier(params,"onstart");
	window.scrollTo(0,0); 
};
//}}}

// ccLoginStatus //

//{{{

config.macros.ccLoginStatus={};

merge(config.macros.ccLoginStatus,{
	textDefaultWorkspaceLoggedIn:"Viewing default workspace",
	textViewingWorkspace:"Viewing Workspace : ",
	textLoggedInAs:"Logged in as ",
	textNotLoggedIn:"You are not logged in.",
	textAdmin:"You are an Administrator."
});

config.macros.ccLoginStatus.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var loginDiv=createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(loginDiv);
};
	
config.macros.ccLoginStatus.refresh=function(place,errorMsg){
       var me = config.macros.ccLoginStatus;
       var loginDivRef=document.getElementById ("LoginDiv");
       removeChildren(loginDivRef);
       var wrapper=createTiddlyElement(place,"div");
       var str = (workspace == "" ? me.textDefaultWorkspaceLoggedIn :(me.textViewingWorkspace+workspace))+"\r\n\r\n";
       if (isLoggedIn()){
			name = cookieString(document.cookie).txtUserName;
			str += me.textLoggedInAs+decodeURIComponent(name)+".\r\n\r\n";
			if (workspacePermission.owner==1){
				str += me.textAdmin;
			}
       }else{
               str += me.textNotLoggedIn;
       }
       wikify(str,wrapper);
};
//}}}

// ccOptions //

//{{{
	
config.macros.ccOptions={};	

merge(config.macros.ccOptions, {
	linkManageUsers:"users",
	linkPermissions:"permissions",
	linkFiles:"files",
	linkCreate:"create",
	linkOffline:"offline",
	linkStats:"statistics"
	
});
config.macros.ccOptions.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var me = config.macros.ccOptions;
	if(workspacePermission.owner==1)
		wikify("[["+me.linkManageUsers+"|Manage Users]]<br />[["+me.linkPermissions+"|Permissions]]<br />[["+me.linkStats+"|Statistics]]<br />", place);
	if (isLoggedIn())
		wikify("[["+me.linkFiles+"|files]]<br />", place);
		if (isLoggedIn()){
			if (workspacePermission.canCreateWorkspace==1)
				wikify("[["+me.linkCreate+"|CreateWorkspace]]<br />", place);
			// append url function required 
			wikify("[[password|Password]]<br />", place);
			if (window.fullUrl.indexOf("?") >0)
				wikify("[["+me.linkOffline+"|"+fullUrl+"&standalone=1]]<br />", place);
			else 
				wikify("[["+me.linkOffline+"|"+fullUrl+"?standalone=1]]<br />", place);	
		}
};

//}}}

// ccRegister //

//{{{
	
config.macros.register={};	
merge(config.macros.register,{
	usernameRequest:"username",
	passwordRequest:"password",
	passwordConfirmationRequest:"confirm password",
	emailRequest:"email",
	stepRegisterTitle:"Register for an account.",
	stepRegisterIntroText:"Hi, please register below.... ",
	stepRegisterHtml:"<label> username</label><input class='input' id='reg_username' name='reg_username' tabindex='1'/><span></span><input type='hidden'  name='username_error'></input><br /><label>email</label><input class='input' name=reg_mail id='reg_mail' tabindex='2'/><span> </span><input type='hidden' name='mail_error'></input><br/><label>password</label><input type='password' class='input' id='password1' name='reg_password1' tabindex='3'/><span> </span><input type='hidden'  name='pass1_error'></input><br/><label>confirm password</label><input type='password' class='input' id='password2' name='reg_password2' tabindex='4'/><span> </span><input type='hidden'  name='pass2_error'></input>",
	buttonCancel:"Cancel",
	buttonCancelToolTip:"Cancel transaction ",
	buttonRegister:"Register",	
	buttonRegisterToolTip:"click to register",
	msgCreatingAccount:"Attempting to create the account for you.", 
	msgNoUsername:"No username entered", 
	msgEmailOk:"Email address is OK.",
	msgNoPassword:"no password entered.",
	msgDifferentPasswords:"Your Passwords do not match.",
	msgUsernameTaken:"The username requested has been taken.",
	msgUsernameAvailable:"The username is available.",
	step2Title:"",
	step2Html:"Please wait while we create you an account...",
	errorRegisterTitle:"Error",
	errorRegister:"User not created, please try again with a different username."
});

config.macros.register.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	//config.macros.login.refresh(place);
};

config.macros.register.displayRegister=function(place, w, item){
	var me = config.macros.register;
	var w = new Wizard(item);
	w.addStep(me.stepRegisterTitle, me.stepRegisterHtml);
	w.formElem["reg_username"].onkeyup=function() {me.isUsernameAvailable(w);};
	console.log(w.footElem);
	w.setButtons([
		{caption: me.buttonRegister, tooltip: me.buttonRegisterToolTip, onClick:function() { me.doRegister(place, w)}},
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() { config.macros.ccLogin.refresh(place)}}
	]);
	var h1 = createTiddlyElement(null, "h1", null, null, "hahahaha");
//	w.footElem.appendChild(h1, w.footElem);


	w.footElem.firstChild.parentNode.appendChild(h1, w.footElem);

	//w.footElem.firstChild.insertBefore(h1, w.footElem);
	

}

config.macros.register.setStatus=function(w, element, text){
	var label_var = w.getElement(element);
	removeChildren(label_var.previousSibling);
	var label = document.createTextNode(text);
	label_var.previousSibling.insertBefore(label,null);
}

config.macros.register.doRegister=function(place, w){
	var me = config.macros.register;
	if(w.formElem["reg_username"].value==''){
		me.setStatus(w, "username_error", me.msgNoUsername);
	}else {
		me.setStatus(w, "username_error", "");
	}
	if(me.emailValid(w.formElem["reg_mail"].value)){
		me.setStatus(w, "mail_error", me.msgEmailOk);
	}else{
		me.setStatus(w, "mail_error", "invalid email address");
		return false;
	}
	if(w.formElem["reg_password1"].value==''){
		me.setStatus(w, "pass1_error", me.msgNoPassword);
		return false;
	}else{
		me.setStatus(w, "pass1_error", "");
	}
	if(w.formElem["reg_password2"].value==''){
		me.setStatus(w, "pass2_error", me.msgNoPassword);
		return false;
	}
	if(w.formElem["reg_password1"].value != w.formElem["reg_password2"].value ){
		me.setStatus(w, "pass1_error", me.msgDifferentPasswords);
		me.setStatus(w, "pass2_error", me.msgDifferentPasswords);
		return false;
	}
 	var params ={};
	params.p = Crypto.hexSha1Str(w.formElem['reg_password1'].value);
	params.u = w.formElem['reg_username'].value;
	params.place = place;
	params.w = w;
	var loginResp=doHttp('POST',url+'/handle/register.php',"username="+w.formElem['reg_username'].value+"&reg_mail="+w.formElem['reg_mail'].value+"&password="+Crypto.hexSha1Str(w.formElem['reg_password1'].value)+"&password2="+Crypto.hexSha1Str(w.formElem['reg_password2'].value),null,null,null,config.macros.register.registerCallback,params);
	w.addStep(me.step2Title, me.msgCreatingAccount);
	w.setButtons([
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.register.emailValid=function(str){
	if((str.indexOf(".") > 0) && (str.indexOf("@") > 0))
		return true;
	else
		return false;
};

config.macros.register.usernameValid=function(str){
	if((str.indexOf("_") > 0) && (str.indexOf("@") > 0))
		return false;
	else
		return true;
};

config.macros.register.registerCallback=function(status,params,responseText,uri,xhr){
	var userParams = {};
	userParams.place = params.place;
	if (xhr.status==304){
		params.w.addStep(config.macros.register.errorRegisterTitle, config.macros.register.errorRegister);
		return false;
	}	
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.host = window.url;
	context.username = params.u;
	context.password = params.p;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback);
	return true;
}

config.macros.register.isUsernameAvailable=function(w){
	var params = {};
	params.w = w;
	doHttp('POST',url+'/handle/register.php',"username="+w.formElem["reg_username"].value+"&free=1",null,null,null,config.macros.register.isUsernameAvailabeCallback,params);
	return false;
};

config.macros.register.isUsernameAvailabeCallback=function(status,params,responseText,uri,xhr){
	var me = config.macros.register;
	var resp = (responseText > 0) ? me.msgUsernameTaken : me.msgUsernameAvailable;
	config.macros.register.setStatus(params.w, "username_error", resp);
};
//}}}

// ccStats //


//{{{
	
config.macros.ccStats={};
merge(config.macros.ccStats,{
	graph24HourTitle:"Last 24 hours",
	graph24HourDesc:"The number of views of this workspace in the past 24 hours",
	graph20MinsTitle:"Last 20 Minutes",
	graph20MinsDesc:"The number of views of this workspace in the last 20 minutes",
	graph7DaysTitle:"Last 7 days",
	graph7DaysDesc:"The number of views of this workspace in the last 7 days.",
	graph5MonthsTitle:"Last 5 months",
	graph5MonthsDesc:"The number of views of this workspace in the past 30 days.",
	errorPermissionDenied:"Permissions Denied to data for %0 You need to be an administrator on the %1 workspace.",
	stepTitle:"Workspace Statistics"
});

config.macros.ccStats.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	var params;
	params.place = place;
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTWORKSPACES',null,null,null,config.macros.ccStats.listWorkspaces,params);
}

config.macros.ccStats.simpleEncode = function(valueArray,maxValue){
	var simpleEncoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var chartData = ['s:'];
	  for (var i = 0; i < valueArray.length; i++){
	    var currentValue = valueArray[i];
	    if (!isNaN(currentValue) && currentValue >= 0){
	    	chartData.push(simpleEncoding.charAt(Math.round((simpleEncoding.length-1) * currentValue / maxValue)));
	    }else{
	      chartData.push('_');
	    }
	  }
	return chartData.join('');
}

config.macros.ccStats.max = function(array){
	return Math.max.apply(Math, array);
}

config.macros.ccStats.dataCallback = function(status,params,responseText,uri,xhr){
	me = config.macros.ccStats;
	if(xhr.status==401){
		createTiddlyElement(params.container, "h4", null, null, me.errorPermissionDenied.format([params.title], [workspace]));
		return false;
	}
	var res = eval("[" + responseText + "]");
	var d=[];
	var l="";
	for(var c=0; c<res.length; c++){
		d[c]= res[c].hits;
		l+=res[c].date+"|";
	}
	var maxValue = config.macros.ccStats.max(d);
 	params.gData = config.macros.ccStats.simpleEncode(d,maxValue);
	params.XLabel = l.substring(0, l.length -1);
	params.YLabel = "0|"+maxValue+"|";
	var image = 'http://chart.apis.google.com/chart?cht=lc&chs=100x75&chd='+params.gData+'&chxt=x,y&chxl=0:||1:|';
	var div = createTiddlyElement(params.container, "div", null, "div_button");
	setStylesheet(".div_button:hover{opacity:0.7; cursor: pointer} .div_button{ width:100%; padding:5px;color:#555;background-color:white;} ", "DivButton");
	div.onclick = function(){
		var full = "http://chart.apis.google.com/chart?cht=lc&chs=800x375&chd="+params.gData+"&chxt=x,y&chxl=1:|"+params.YLabel+"0:|"+params.XLabel+"&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";
		setStylesheet(
		"#errorBox .button{padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak{height:"+window.innerHeight*2+"px;}"+
		"#errorBox{border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
		var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
		box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+params.title+"</h3><br />";
		box.style.position = 'absolute';
		box.style.height= "460px";
		box.style.width= "800px";
		var img = createTiddlyElement(box, "img");
		img.src = full;
		ccTiddlyAdaptor.center(box);
		ccTiddlyAdaptor.showCloak();
	}
	var img = createTiddlyElement(div, "h2", null, null, params.title);
	var img = createTiddlyElement(div, "img");
	img.src = image;
	
	var span = createTiddlyElement(div, "div", null, "graph_label", params.desc);
	setStylesheet(".graph_label{  position:relative; width:300px; top:-80px; left:130px;}");
}

config.macros.ccStats.switchWorkspace = function(params){
	removeChildren(params.container);
	config.macros.ccStats.refresh(params);	
}

config.macros.ccStats.refresh = function(params){
	var me = config.macros.ccStats;
	var select = params.w.formElem.workspaces;
	if(select[select.selectedIndex].value!="")
		workspace = select[select.selectedIndex].value;
	params ={ container: params.container, url: window.url+"/handle/stats.php?graph=minute&workspace="+workspace,title:me.graph20MinsTitle, desc:me.graph20MinsDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);
	params ={ container:params.container, url:  window.url+"/handle/stats.php?graph=hour&workspace="+workspace,title:me.graph24HourTitle, desc:me.graph24HourDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);
	params ={ container: params.container, url:  window.url+"/handle/stats.php?graph=day&workspace="+workspace,title:me.graph7DaysTitle, desc:me.graph7DaysDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);
	params ={ container: params.container, url:  window.url+"/handle/stats.php?graph=month&workspace="+workspace,title:me.graph5MonthsTitle, desc:me.graph5MonthsDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);	
}

config.macros.ccStats.listWorkspaces = function(status,params,responseText,uri,xhr){
	params.container=createTiddlyElement(null, "div", "container");
	var me = config.macros.ccStats;
	var w = new Wizard();
	w.createWizard(params.place,me.stepTitle);
	w.addStep(null, "<select name='workspaces'></select><input name='stats_hol' type='hidden'></input>");
	var s = w.formElem.workspaces;	
	s.onchange = function(){config.macros.ccStats.switchWorkspace(params) ;};
	var workspaces = eval('[ '+responseText+' ]');
	for(var d=0; d < workspaces.length; d++){
		var i = createTiddlyElement(s,"option",null,null,workspaces[d]);
		i.value = workspaces[d];
		if (workspace == workspaces[d]){
			i.selected = true;
		}
	}
	params.w = w; 
	w.formElem.stats_hol.parentNode.appendChild(params.container);
	config.macros.ccStats.refresh(params);
}
//}}}