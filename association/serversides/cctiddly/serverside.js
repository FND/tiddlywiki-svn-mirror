//This file contains all ccTiddly's plugins that would not exist in standalone version
//The plugins were moved from inside the code to an extra js file is because:
//	1/ allow for caching 
//	2/ ease in reading the code and updating
//	3/ load quicker?
//	4/ avoid overwriting functions that are also used by other plugins (such as saveTiddler)

/////////////////////////////////////////////////////////remove isDirty popup dialog/////////////////////////////////////////////////

window.checkUnsavedChanges = function()	{};//ccT save on the fly

window.confirmExit = function()
{
	hadConfirmExit = true;		//assume confirm exit since ccT save "on the fly"
}

/////////////////////////////////////////////////////////change title/////////////////////////////////////////////////
window.cct_main = window.main
window.main = function()
{
	window.cct_main();
	window.cct_tweak();
	refreshPageTemplate('PageTemplate');
	story.forEachTiddler(function(title){story.refreshTiddler(title,DEFAULT_VIEW_TEMPLATE,true);});
	//document.title=(wikifyPlain("SiteTitle") + " - " + wikifyPlain("SiteSubtitle")).htmlEncode();
	document.title=(wikifyPlain("SiteTitle") + " - " + wikifyPlain("SiteSubtitle"));
}

/////////////////////////////////////////////////////////saveChanegs/////////////////////////////////////////////////
window.saveChanges = function ()
{
	clearMessage();
	//var cct_msg = "";
	
	//set delay in saveChanges to allow auto generating RSS/upload store area
	//otherwise it skips generating RSS, possibly because iframe is not ready
	//serverside.fn.uploadRSS();		//RSS is now generated on the fly
	// Save Rss
	/*if(config.options.chkGenerateAnRssFeed)
	{
		//setTimeout("window.cct_genRss ()",cctPlugin.timeDelay);
		serverside.fn.uploadRSS();
		//cct_msg = cct_msg+config.cctPlugin.lingo.generateRSS+"\n";
	}

	//if( config.options.chkGenerateAnRssFeed===false && config.options.chkUploadStoreArea===false )
	if( config.options.chkGenerateAnRssFeed===false )
	{
		displayMessage(cctPlugin.lingo.checkOption);
	}*/
}

//////////////////////////////////////////////////Reload config file
/***
!!!Reload config file
uncomment it to enable
require variables defined by this time
***/
//window.loadOptionsCookie();

///////////////////////////////////////////////////////////////////above is cctplugins.js stuff/////////////////////////////////////////
/***
! server-side TW plugin
this is acting as a common script for server-side TW
***/
/***
!!!TW predefined variables for sever-side
***/
//{{{
config.options.chkHttpReadOnly = false;		//make it HTTP writable by default
config.options.chkSaveBackups = false;		//disable save backup
config.options.chkAutoSave = false;			//disable autosave
config.options.chkUsePreForStorage = false; 
//}}}

/***
!!!url check and merge with handle
***/
//{{{
if( serverside.url != null )		//if url not null, add to front of handle
{
	/*if( serverside.url != null && serverside.url[serverside.url.length-1] != '/' ) {		//add '/' to end of url
		serverside.url = serverside.url+'/';
	}*/
	for( var i in serverside.handle ) {
		serverside.handle[i] = serverside.url + '/' + serverside.handle[i] + '&workspace=' + serverside.workspace;
	}
}
//}}}

/***
!!!auto close displayMessage if in debug mode
***/
//{{{
if( serverside.debug == 1 )
{
	serverside.messageDuration = 0;
}
//}}}


/***
''read privilege''
***/
//{{{
/*try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
} catch (e) {
	alert("Permission UniversalBrowserRead denied.");
}*/
//}}}

/***
''TW2.1 check''
***/
//{{{
/*function isTW21(){
	if( version.major==2 && version.minor==1 )
		return true;
	return false;
}*/
//}}}

/***
''no cache''
***/
//{{{
serverside.fn.no_cache = function() {return "time"+new String((new Date()).getTime())};
//}}}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***
!!!ajax functions
|''Name:''|mini/ajax.js|
|''Description:''|Ajax handler|
|''Author:''|TimMorgan (editted by CoolCold)|
|''Original source:''|http://timmorgan.org/mini|
***/
//{{{
var ajax={};
ajax.x=function(){try{return new ActiveXObject('Msxml2.XMLHTTP')}catch(e){try{return new ActiveXObject('Microsoft.XMLHTTP')}catch(e){try{return new XMLHttpRequest()}catch(e){return false}}}};
ajax.send=function(u,f,m,a){var x=ajax.x();x.open(m,u,true);
x.onreadystatechange=function(){if(x.readyState==4)f(x)};
if(m=='POST')x.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=UTF-8');x.send(a)};
//ajax.sends=function(u,m,a){ajax.send(url,function(s){return s.responseText},m,a)};
ajax.check=function(){if(ajax.x()===false)return false; return true;};		//check if ajax available
ajax.escape=function(f,s){return f+'='+encodeURIComponent(s)};

ajax.get=function(u,f){ajax.send(u,f,'GET')};
ajax.gets=function(u){ajax.send(u,function(s){return s.responseText},'GET')};
//ajax.gets=function(url){var x=ajax.x();x.open('GET',url,false);x.send(null);return x.responseText};
ajax.post=function(u,f,a){ajax.send(u,f,'POST',a)};
ajax.posts=function(u,a){ajax.send(u,function(s){return s.responseText},'POST',a)};
//ajax.posts=function(url,args){var x=ajax.x();x.open('POST',url,false);x.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=UTF-8');x.send(args);return x.responseText};
//}}}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***
!!!Generic callback function
*display status as result
*can click on status in displayMessage for further info
*called when readystatus=4
*status=true if status=0,200,201,204,207
***/
//				callback(true,params,x.responseText,url,x);
//				callback(false,params,null,url,x);
serverside.fn.genericCallback = function(status,params,responseText,uri,xhr) {
	
	if(xhr.status == 401)
	{
		story.displayTiddler(null,'Login', 1);
	}			
	
	result = xhr.responseText.split("\n");
	if( result.count>1 )
		result = ', ' + result[result.length-1];	//display last line of result as info

	if( status )
	{
		displayMessage(serverside.status[xhr.status] + result
			,"javascript:document.open(\"text/html\");document.write(\"<html><head><title>"+serverside.lingo.returnedTextTitle+"</title></head><body>"+xhr.responseText+"</body></html>\");document.close()"
		);
	}else{
		displayMessage(result + ' ' + serverside.lingo.error + ' ' + serverside.lingo.click4Details
			,"javascript:document.open(\"text/html\");document.write(\"<html><head><title>"+serverside.lingo.returnedTextTitle+"</title></head><body>"+xhr.responseText+"</body></html>\");document.close()"
		);
		//alert(xhr.status + ' ' + serverside.lingo.error);
	}
	//if( serverside.messageDuration != 0 )
	//	setTimeout("clearMessage()",serverside.messageDuration);
}
/***
!!!message function
*using displayMessage in TW, but add autoclose timer (defined by serverside.messageDuration)
*it will display the SECOND LAST line of returned message (except in debug mode)
**this is to skip the DONE/ERROR line
*alert popup when debug enabled, displaying the whole responseText
*@param h http_request handler
***/
//{{{
serverside.fn.displayMessage = function(h)
{
	var s = h.responseText;

	if (h.status == 200)
	{
		result = s.split("\n");
		if( serverside.debug==1 )
		{
			//displayMessage(result[result.length-1],"displaymsg.php?"+ajax.escape("msg",s));
			displayMessage(result[result.length-1],"javascript:document.open(\"text/html\");document.write(\"<html><head><title>"+result[result.length-1]+"</title></head><body>"+s+"</body></html>\");document.close()");
		}else{
			displayMessage(result[result.length-1]);
		}
	} else {
		displayMessage(serverside.lingo.timeOut);
		alert(serverside.lingo.timeOut);
	}
	if( serverside.messageDuration != 0 )
		setTimeout("clearMessage()",serverside.messageDuration);
};
//}}}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***
!!!login
code obtained from ZiddlyWiki
***/
config.macros.login = {
	label: serverside.lingo.login.login,
	prompt: serverside.lingo.login.loginPrompt,
	handler: function(place) {return true;}
}
/*config.macros.login = {
	label: serverside.lingo.login.login,
	prompt: serverside.lingo.login.loginPrompt,
	sizeTextbox: 15,
	handler: function(place) {
		if(serverside.loggedIn) {
			this.label = serverside.lingo.login.logout;
			this.prompt = serverside.lingo.login.logoutPrompt;
			createTiddlyButton(place,this.label+' ('+config.options.txtUserName+')',this.prompt,this.doLogin);
			
			//createTiddlyLink(place,config.options.txtUsername,serverside.lingo.welcome + ' ' +config.options.txtUsername,this.doLogin);
			/*var link = createTiddlyLink(place, txtUsername, true);
			link.innerHTML = serverside.lingo.welcome + ' ' +txtUsername;*/
		/*} else {
			// FIXME Only make login form if cookie-based login are enabled.
			/*var form = document.createElement("form");
			form.action = "login.php?action=login";
			var u = createTiddlyElement(form, "input", "txtUserName");
			u.value = serverside.lingo.anonymous;
			u.onclick = this.clearInput;
			u.size = this.sizeTextbox;
			u.onkeypress = this.enterSubmit;
			u.name = "cctuser";
			var p = createTiddlyElement(form, "input", "cctpass");
			p.value = "password";
			p.size = this.sizeTextbox;
			p.onclick = this.clearInput;
			p.onkeypress = this.enterSubmit;
			p.name = "cctpass";
			place.appendChild(form);
			createTiddlyButton(place,this.label,this.prompt,this.doLogin);*/
			/*this.label = serverside.lingo.login.login;
			this.prompt = serverside.lingo.login.loginPrompt;
			createTiddlyButton(place,this.label,this.prompt,this.doLogin);
		}
	},
	doLogin: function(e) {
		displayMessage('Logging in...');
		var postStr = ajax.escape("username",config.options.txtUserName);
		var postStr = ajax.escape("password",config.options.pasSecretCode);
		if( serverside.handle_msg.login != null )
			postStr += '&' + serverside.handle_msg.login;
		ajax.post(serverside.handle.login,config.macros.login.doneLogin,postStr);

		/*var u = document.getElementById("zw_username");
		var p = document.getElementById("zw_password");
		ajax.post(zw.get_url().replace("http://","http://"+u.value+":"+p.value+"@")
		,config.macros.login.doneLogin,
		"action=login&__ac_name="+u.value+"&__ac_password="+p.value);*/
	/*},
	clearInput: function(e) {
		var u = document.getElementById("txtUserName");
		var p = document.getElementById("cctpass");
		if((e.target == u || e.target == p) && p.type != "password") { 
			u.value = ''; 
			p.value=''; 
			p.type = "password";
		}
	},
	enterSubmit: function(e) {
		if(e.keyCode == 13 || e.keyCode == 10) config.macros.login.doLogin(e);
	},
	doneLogin: function(x) {
		if(x.status==401){
			displayMessage(serverside.lingo.login.loginFailed);
			return false;
		}
		
		/*if(status == 200) window.eval(str);   // We may get either a 401 Unauthorized
		readOnly = !zw.loggedIn;              // or status.js which indicates we are 
		if(!zw.loggedIn) {                    // still not logged in.
			alert("Authentication failed.  Did you type your username and password correctly?");
			clearMessage();
			return false;
		}
		refreshDisplay("SideBarOptions");
		story.refreshAllTiddlers();
		clearMessage();
		// Check for new tiddlers
		var numtofetch = 0;
		for(var t in zw.tiddlerList) if(!store.fetchTiddler(t)) numtofetch++;
		var fetched = 0;
		var updateTimeline = "";
		this.fetchlist = [];
		for(var t in zw.tiddlerList) {
			if(!store.fetchTiddler(t)) {
				this.fetchlist.push(t);
				if(++fetched == numtofetch) 
				updateTimeline = "updatetimeline=1&";
				ajax.get('?action=get&id=' + encodeURIComponent(t.htmlDecode())
				+ "&" + updateTimeline + zw.no_cache(), 
				config.macros.login.addTiddler)
				// This seems to be perceptibly slower...
				//setTimeout(" ajax.get('?action=get&id=" + encodeURIComponent(t.htmlDecode()).replace("'","\\'")
				//    + "&" + updateTimeline + zw.no_cache() + "', config.macros.login.addTiddler)",
				//    timeout);
				//timeout += 10;
			}
		}
		return true;*/
	/*},
	addTiddler: function(str,status) {
		if(status != 200) {
			alert("config.macros.login.addTiddler error (HTTP status"+status+"): "+str); // error message
			zw.dirty = true;
		} else if(str.indexOf('\n') > -1) {
			var parts = str.split('\n');
			var tiddler = new Tiddler();
			var title = parts[0];
			var oldtitle = parts[1];
			var oldtiddler = store.fetchTiddler(title);
			tiddler.assign(title, Tiddler.unescapeLineBreaks(parts[2].htmlDecode()), parts[3], 
			Date.convertFromYYYYMMDDHHMM(parts[4]), parts[6], 
			Date.convertFromYYYYMMDDHHMM(parts[5]));
			store.setValue(tiddler, 'revisionkey', parts[8]);
			store.addTiddler(tiddler);
			//        story.refreshTiddler(title, DEFAULT_VIEW_TEMPLATE, true);
			if(parts[7] == 'update timeline') {
				displayMessage("Processing new tiddlers...");
				for(var t=0;t<this.fetchlist.length;t++)
					store.fetchTiddler(this.fetchlist[t].htmlDecode()).changed();
				store.notify('TabTimeline', true)
				refreshAll();  // Just redraw everything.
				clearMessage();
			}
		}
	}
};*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***
!!!revision functions
code obtained from ZiddlyWiki
***/

//}}}
/***
''revision command (marco)''
*obtain revision info from server and display as a list
*Each tiddler detail is separated by a linebreak "\n"
*format of returned data (space separated):
**date version_number modifier
**DONE/ERROR should be at the last line

***/
//{{{
config.commands.revisions = {
	text: serverside.lingo.revision.text,
	tooltip: serverside.lingo.revision.tooltip,
	popupNone: serverside.lingo.revision.popupNone,
	hideShadow: true,
	handler: function(event,src,title) {
		//create popup for holding revision list
		var popup = Popup.create(src);
		Popup.show(popup,false);

		//call back function for revision list
		//var callback = function(r) {
		var callback = function(status,params,responseText,uri,xhr) {
			if(!popup) return;		//end if popup not exist
			if( !status ) {			//if error
				if( xhr.status==204 ) {		//empty/no content
					createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),serverside.lingo.revision.popupNone);
				}else{
					createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),serverside.lingo.revision.error);
				}
			}else{					//if ok, get list
				var revisionList = responseText.split('\n');
				
				for(var i=0; i<revisionList.length; i++) {
					var parts = revisionList[i].split(' ');
					if( parts.length==3 ) {
						var modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
						var key = parts[1];
						var modifier = parts[2];
						var button = createTiddlyButton(createTiddlyElement(popup,"li")
							, "(" + key + ")" + " - " + modified.toLocaleString() +" "+ modifier
							, serverside.lingo.revision.tooltip
							, function(){
								displayTiddlerRevision(this.getAttribute('tiddlerTitle'), 
									this.getAttribute('revisionkey'), this); 
								return false;
							}
							, 'tiddlyLinkExisting tiddlyLink');
						button.setAttribute('tiddlerTitle', title);
						button.setAttribute('revisionkey', key);
						var t = store.fetchTiddler(title);
						if(!t) alert(title+serverside.lingo.revision.notExist);
						//if(t && (store.getValue(t, 'revisionkey') == key))
						if( t && t.modified == modified )
							button.className = 'revisionCurrent';
					}
				}
				/*var revs = r.responseText.split('\n');
				if( revs.length<2 ){		//no revision available, current version is also counted as 1 so min is 1
					createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),serverside.lingo.revision.popupNone);
				}else{
					for(var i=0; i<revs.length; i++) {
						var parts = revs[i].split(' ');
						if(parts.length>1) {
							var modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
							var key = parts[1];
							var modifier = parts[2];
							var button = createTiddlyButton(createTiddlyElement(popup,"li"), 
								"(" + key + ")" + " - " + modified.toLocaleString() +" "+ modifier, 
								serverside.lingo.revision.tooltip, 
								function(){
									displayTiddlerRevision(this.getAttribute('tiddlerTitle'), 
									this.getAttribute('revisionkey'), this); 
									return false;
								}, 'tiddlyLinkExisting tiddlyLink');
							button.setAttribute('tiddlerTitle', title);
							button.setAttribute('revisionkey', key);
							var t = store.fetchTiddler(title);
							if(!t) alert(title+serverside.lingo.revision.notExist);
							//if(t && (store.getValue(t, 'revisionkey') == key))
							if( t && t.modified == modified )
								button.className = 'revisionCurrent';
							}
					}
				}*/
			}
		}
		
		//send to server
		doHttp('POST'
			,serverside.url + '/handle/revisionlist.php?' + serverside.queryString
				+ '&workspace=' + serverside.workspace
				+ '&title=' + encodeURIComponent(title.htmlDecode())
				+ '&' + serverside.fn.no_cache()
			, null, null, null, null
			,callback
		);
		
		//get revision from server
		/*var url = serverside.handle.revisionList;
		if( url.indexOf("?") == -1 )
			url += '?' + ajax.escape("title",title.htmlDecode());
		else
			url += '&' + ajax.escape("title",title.htmlDecode());
		url += '&' + serverside.fn.no_cache();
		ajax.get(url,callback);
		*/
		
		event.cancelBubble = true;
		if (event.stopPropagation) event.stopPropagation();
		return true;
	}
}
//}}}
/***
''display tiddler revision''
*when user click on revision list, the tiddler would be changed to display the body, tag and title of the tiddler
*Format returned from web (separate by linebreak "\n")
##title (current)
##oldtitle
##body
##modifier
##modified
##created
##tags
##version
##fields (currently not used)
##updateTimeline
***/
//{{{
function displayTiddlerRevision(title, revision, src, updateTimeline) {
	//display tiddler function
	var callback = function(status,params,responseText,uri,xhr) {
		if( !status ) {		//if not found or authorized, do nothing
			serverside.fn.genericCallback(status,params,responseText,uri,xhr);
			return false;
		}

		//break result apart
		var parts = xhr.responseText.split('\n');
		//if( parts[parts.length-1] == "ERROR" ) {
		if( parts.length<3 ) {	//if only 1-2 lines, should be error (3 because there could be an empty line followed by the message
			serverside.fn.genericCallback(status,params,responseText,uri,xhr);
			return false;
		}
		
		//get old tiddler
		var tiddler = new Tiddler();
		var oldtiddler = store.fetchTiddler(title);
		var oldtitle = parts[0];
		
		//set revision info ext var in tiddler. is this still in use????????????????????????
		if(oldtiddler && oldtiddler.modified != parts[4]) {
			var tmpstr = " (Historical revision " + parts[7];
			if(title != oldtitle) {
				tmpstr += " renamed from " + oldtitle;
			}
			tmpstr += ")";
			store.setValue(tiddler, "revisioninfo", tmpstr);
		}

		//change current to old content
		tiddler.set(title, Tiddler.unescapeLineBreaks(parts[2].htmlDecode()), parts[3], 
		Date.convertFromYYYYMMDDHHMM(parts[4]), parts[6], 
		Date.convertFromYYYYMMDDHHMM(parts[5]));
		store.setValue(tiddler, 'changecount', parts[7]);
		store.addTiddler(tiddler);
		//if(tiddler.tags.contains('deleted')) store.deleteTiddler(title);
		//config.commands.revisions.text = serverside.lingo.revision.text+"("+parts[7]+")";
		story.refreshTiddler(title, DEFAULT_VIEW_TEMPLATE, true);
		if(parts.length>9 && parts[9] == 'update timeline') {
			store.notify('TabTimeline', true)
		}
	}
	
	//send to server
	doHttp('POST'
		,serverside.url + '/handle/revisiondisplay.php?' + serverside.queryString
			+ '&workspace=' + serverside.workspace
			+ '&title=' + encodeURIComponent(title.htmlDecode())
			+ '&revision=' + encodeURIComponent(revision)
			+ '&' + serverside.fn.no_cache()
		, null, null, null, null
		,callback
	);
	
	//get revision from server
	//supply parameter: title, revision
	/*var url = serverside.handle.revisionDisplay;
	if( url.indexOf("?") == -1 )
		url += '?';
	else
		url += '&';
	url += ajax.escape("title",title.htmlDecode());
	url += '&' + ajax.escape("revision",revision);
	result = ajax.get(url,displayTiddler);		//return http_handle
	*/
};
//}}}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***
!!!saveTiddler
Hijack saveTiddler for saving tiddler to server
*method: POST
*param:
##tiddler - a tiddler div of the new tidler data
##omodified - previous (current?) modified date
##otitle - previous (current) title
***/
//{{{

TiddlyWiki.prototype.ss_saveTiddler = TiddlyWiki.prototype.saveTiddler;		//hijack
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created)
{
	
	//get previous title and
	var tiddler = this.fetchTiddler(title);
	//variables for making sure no tiddlers are overwritted
	var omodified=null;
	var ochangecount=null;

	//if minorupdate is used, it is possible that a tiddler is accidentally overwrite by another due to collision detection is done via modified date
	if( modified == undefined )
	{
		if(tiddler)				//get modified date and change count from previous tiddler
		{
			modified = tiddler.modified;
			
		}else{					//if new tiddler
			modified =  new Date();
		}
	}
	
	//if old tiddler exist, get data for collision detection
	if(tiddler){
		omodified = tiddler.modified; // get original modified date
		//if(t && (store.getValue(t, 'revisionkey') == key))
		//ochangecount = tiddler.changecount;
		ochangecount = store.getValue(tiddler, 'changecount');
	}

	//save in local TW
	//var tiddler = "";
	tiddler =  store.ss_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created);//save to local copy
	//send to server
	doHttp('POST'
		,serverside.url + '/handle/save.php?' + serverside.queryString + '&workspace=' + serverside.workspace
		,'tiddler=' + encodeURIComponent(store.getSaver().externalizeTiddler(store,tiddler))
			+ '&otitle=' + encodeURIComponent(title.htmlDecode())
			+ ((omodified!==null)?'&omodified=' + encodeURIComponent(omodified.convertToYYYYMMDDHHMM()):"")
			+ ((ochangecount!==null)?'&ochangecount=' + encodeURIComponent(ochangecount):"")
		,null, null, null
		,serverside.fn.genericCallback
	);
	/*var params = {}; 
	params.url = url+'/'+this.ccWorkspaceName.value;
	var loginResp = doHttp('POST', 
		url+'/'+this.ccWorkspaceName.value, 
		&quot;ccCreateWorkspace=&quot; + encodeURIComponent(this.ccWorkspaceName.value)+&quot;&amp;ccAnonPerm=&quot;+encodeURIComponent(anon)
		,null,null,null, config.macros.ccCreateWorkspace.createWorkspaceCallback,params);

	function doHttp(type,url,data,contentType,username,password,callback,params,headers)
	
	var postStr = ajax.escape("tiddler",tiddler.saveToDiv());
	postStr += '&' + ajax.escape("omodified",omodified.convertToYYYYMMDDHHMM());
	postStr += '&' + ajax.escape("otitle",title.htmlDecode());
	if( serverside.handle_msg.saveTiddler != null )
		postStr += '&' + serverside.handle_msg.saveTiddler;
	ajax.post(serverside.handle.saveTiddler,serverside.fn.displayMessage,postStr);
	*/
	//ajax.post=function(u,f,a){ajax.send(u,f,'POST',a)};
	
	//var loginResp = doHttp('POST', url+'/'+this.ccWorkspaceName.value, &quot;ccCreateWorkspace=&quot; + encodeURIComponent(this.ccWorkspaceName.value)+&quot;&amp;ccAnonPerm=&quot;+encodeURIComponent(anon),null,null,null, config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	//serverside.fn.displayMessage(result);
	return tiddler;
}
//}}}

/***
!!!removeTiddler
Hijack removeTiddler for deleting tiddler on server
*method: POST
*param:
##title - title of tiddler to delete
***/
//{{{
TiddlyWiki.prototype.ss_removeTiddler = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title)
{
	store.ss_removeTiddler(title);
	
	//send to server
	doHttp('POST'
		,serverside.url + '/handle/delete.php?' + serverside.queryString + '&workspace=' + serverside.workspace
		,'title=' + encodeURIComponent(title.htmlDecode())		//need htmlDecode?
		,null, null, null
		,serverside.fn.genericCallback
	);
	
	/*var postStr = ajax.escape("title",title);
	if( serverside.handle_msg.removeTiddler != null )
		postStr += '&' + serverside.handle_msg.removeTiddler;
	ajax.post(serverside.handle.removeTiddler,serverside.fn.displayMessage,postStr);*/
}
//}}}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***
!!!uploadStoreArea
used to upload all tiddlers to the server
*method: POST
*param:
##upload - contain all tiddlers in div format, identical to storeArea's div

***/
//{{{
serverside.fn.uploadStoreArea = function ()
{
	//send to server
	doHttp('POST'
		,serverside.url + '/handle/uploadstorearea.php?' + serverside.queryString + '&workspace=' + serverside.workspace
		,'upload=' + encodeURIComponent(allTiddlersAsHtml())		//need htmlDecode?
		,null, null, null
		,serverside.fn.genericCallback
	);
	//alert("2");
	/*var postStr = ajax.escape("upload",allTiddlersAsHtml());
	if( serverside.handle_msg.uploadStoreArea != null )
		postStr += '&' + serverside.handle_msg.uploadStoreArea;
	ajax.post(serverside.handle.uploadStoreArea,serverside.fn.displayMessage,postStr);*/
}
//upload storeArea marco, will create a text button
config.macros.ssUploadStoreArea = {
	label: serverside.lingo.uploadStoreArea,
	prompt: serverside.lingo.uploadStoreArea,
	handler: function(place,macroName) {createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,null);},
	onClick:function(e) { serverside.fn.uploadStoreArea();}
}
//}}}

/***
!!!RSS
used to upload rss to the server (generate by TW)
*method: POST
*param:
##rss - contain formatted rss

***/
//{{{
serverside.fn.uploadRSS = function ()
{
	var postStr = ajax.escape("rss",generateRss());
	if( serverside.handle_msg.rss != null )
		postStr += '&' + serverside.handle_msg.rss;
	ajax.post(serverside.handle.rss,serverside.fn.displayMessage,postStr);
}
version.extensions.ssUploadRSS = {major: 1, minor: 0, revision: 0, date: new Date(2006,9,21)};
config.macros.ssUploadRSS = {
	label: serverside.lingo.rss,
	prompt: serverside.lingo.rss,
	handler: function(place,macroName) {createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,null);},
	onClick:function(e) { serverside.fn.uploadRSS();}
}
//}}}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//password variable
config.options.pasSecretCode = "";

//////////////////////////////////////////////////option handler

merge(config.optionHandlers, {
	'pas': {
 		get: function(name) {return encodeCookie(Crypto.hexSha1Str(config.options[name].toString()).toLowerCase());},
		set: function(name,value) {config.options[name] = decodeCookie(value);}
	}
});

merge(config.macros.option.types, {
	'pas': {
		elementType: "input",
		valueField: "value",
		eventName: "onkeyup",
		className: "pasOptionInput",
		typeValue: 'password',
		create: config.macros.option.genericCreate,
		onChange: config.macros.option.genericOnChange
	}
});

//////////////////////////////////////////////////saveOptionCookie
window.ss_saveOptionCookie = window.saveOptionCookie;
window.saveOptionCookie = function(name)
{
	if(safeMode)
		return;
	var c = name + "=";
	var optType = name.substr(0,3);
	if(config.optionHandlers[optType] && config.optionHandlers[optType].get)
		c += config.optionHandlers[optType].get(name);
	if (optType == 'pas' &&  serverside.passwordTime!=0 )
	{
		var date = new Date();
		date.setTime(date.getTime()+serverside.passwordTime);
		c += "; expires="+date.toGMTString()+"; path=/";
	}
	else {
		c += "; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/";
	}
	document.cookie = c;
}

function loadRemoteFile(url,callback,params)
{
	if(window.Components && window.netscape && window.netscape.security && isCrossSite(url)){
		try {netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");}
		catch (e) {displayMessage(e.description?e.description:e.toString());}
	}
	return doHttp("GET",url,null,null,null,null,callback,params,null);
}

function isCrossSite(url){
	var result = false;
	var curLoc = document.location;
	if (url.indexOf(":") != -1 && curLoc.protocol.indexOf("http") != -1)
	{
		var re=/(\w+):\/\/([^/:]+)(:\d*)?([^# ]*)/;
		var rsURL=url.match(re);
		for (var i=0; i<rsURL.length; i++){
			rsURL[i]=(typeof rsURL[i] == "undefined")?"":rsURL[i];
		}
		result = (curLoc.protocol == rsURL[1] && curLoc.host == rsURL[2] && curLoc.port == rsURL[3]);
	}
	return (!result);

}; 
