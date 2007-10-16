/***
! server-side TW plugin
this is acting as a common script for server-side TW
***/
/***
!!!TW predefined variables for sever-side
***/
//{{{
config.options.chkHttpReadOnly = false;    //make it HTTP writable by default
config.options.chkSaveBackups = false;    //disable save backup
config.options.chkAutoSave = false;    //disable autosave
//}}}

/***
!!!TW server-side variables
***/
//{{{
/*var serverside={
	url: "http://127.0.0.1",		//server url, for use in local TW or TW hosted elsewhere
	handle:{		//path of file for handling request, can be used to put in GET variable
		rss: "msghandle.php?action=rss",
		uploadStoreArea: "msghandle.php?action=upload",		//for uploading the whole storearea
		saveTiddler: "msghandle.php?action=saveTiddler",
		removeTiddler: "msghandle.php?action=removeTiddler",
		revisionList: "msghandle.php?action=revisionList",
		revisionDisplay: "msghandle.php?action=revisionDisplay"
	},
	handle_msg:{		//message sent to server for action, used for posting message to server. null = not used
		rss: "action=rss",
		uploadStoreArea: "action=upload",
		saveTiddler: "action=saveTiddler",
		removeTiddler: "action=removeTiddler"
	},
	debug: 1,		//debug mode, display alert box for each action
	passwordTime: 0,		//defines how long password variable store in cookie. 0 = indefinite
	messageDuration: 5000,				//displayMessage autoclose duration (in milliseconds), 0=leave open
	lingo:{		//message for different language
		uploadStoreArea: "storeArea uploaded",
		rss: "rss uploaded",
		timeOut: "timeout",
		revision:{
			text: "revision",
			tooltip: "view revision of this tiddler",
			popupNone: "no revision available",
			notExist: "revision not exist"
		}
	},
	ajax:{
		disable:0,		//disable ajax and use traditional iframe
		timeoutDuration: 10000		//set timeout duration, and return 404 status
	},
	fn:{}		//server-side function
};*/
//}}}

/***
!!!url check and merge with handle
***/
//{{{
if( serverside.url != null )		//if url not null, add to front of handle
{
	if( serverside.url != null && serverside.url[serverside.url.length-1] != '/' ) {		//add '/' to end of url
		serverside.url = serverside.url+'/';
	}
	for( var i in serverside.handle ) {
		serverside.handle[i] = serverside.url + serverside.handle[i];
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
function isTW21(){
	if( version.major==2 && version.minor==1 )
		return true;
	return false;
}
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
ajax.send=function(u,f,m,a){var x=ajax.x();x.open(m,u,true);x.onreadystatechange=function(){if(x.readyState==4)f(x)};if(m=='POST')x.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=UTF-8');x.send(a)};
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
//{{{
//template
config.shadowTiddlers.ViewTemplate = 
	 "<!--{{{-->\n"
	+"<div class='toolbar' macro='toolbar -closeTiddler closeOthers +editTiddler permalink references revisions jump'></div>\n"
	+"<div class='title' macro='view title'></div>\n"
	+"<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date [[DD MMM YYYY]]'></span> (created <span macro='view created date [[DD MMM YYYY]]'></span>)</div>\n"
	+"<div class='tagging' macro='tagging'></div>\n"
	+"<div class='tagged' macro='tags'></div>\n"
	+"<div class='viewer' macro='view text wikified'></div>\n"
	+"<div class='tagClear'></div>\n"
	+"<!--}}}-->";
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
    var popup = Popup.create(src);
    Popup.show(popup,false);
	
	var callback = function(r) {
		if(popup) {
			if(r.status == 200) {
				var revs = r.responseText.split('\n');
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
				}
			}
		}
	}
	
	//get revision from server
	var url = serverside.handle.revisionList;
	if( url.indexOf("?") == -1 )
		url += '?' + ajax.escape("title",title.htmlDecode());
	else
		url += '&' + ajax.escape("title",title.htmlDecode());
	url += '&' + serverside.fn.no_cache();
	ajax.get(url,callback);
	
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
	var displayTiddler = function(result) {
		if( result.status==200 )
		{
			if(result.responseText.indexOf('\n') > -1) {
			var parts = result.responseText.split('\n');
			if( parts[parts.length-1] == "ERROR" ) {
				serverside.fn.displayMessage(result);
				return false;
			}
			var tiddler = new Tiddler();
			var oldtiddler = store.fetchTiddler(title);
			var oldtitle = parts[0];
			/*setValue not available in TW 2.0.11*/
			if( isTW21() ) {
				if(oldtiddler && oldtiddler.modified != parts[4]) {
					var tmpstr = " (Historical revision " + parts[7];
					if(title != oldtitle) {
						tmpstr += " renamed from " + oldtitle;
					}
					tmpstr += ")";
					store.setValue(tiddler, "revisioninfo", tmpstr);
				}
			}
			tiddler.set(title, Tiddler.unescapeLineBreaks(parts[2].htmlDecode()), parts[3], 
			Date.convertFromYYYYMMDDHHMM(parts[4]), parts[6], 
			Date.convertFromYYYYMMDDHHMM(parts[5]));
			//store.setValue(tiddler, 'revisionkey', parts[7]);
			store.addTiddler(tiddler);
			//if(tiddler.tags.contains('deleted')) store.deleteTiddler(title);
			//config.commands.revisions.text = serverside.lingo.revision.text+"("+parts[7]+")";
			story.refreshTiddler(title, DEFAULT_VIEW_TEMPLATE, true);
			if(parts[9] == 'update timeline')
				store.notify('TabTimeline', true)
			}else{		//if only 1 line, treat as error
				serverside.fn.displayMessage(result);
			}
		}
	}
	
	//get revision from server
	//supply parameter: title, revision
	var url = serverside.handle.revisionDisplay;
	if( url.indexOf("?") == -1 )
		url += '?';
	else
		url += '&';
	url += ajax.escape("title",title.htmlDecode());
	url += '&' + ajax.escape("revision",revision);
	result = ajax.get(url,displayTiddler);		//return http_handle
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
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields)
{
	//get previous title and
	var tiddler = this.fetchTiddler(title);
	
	//if minorupdate is used, it is possible that a tiddler is accidentally overwrite by another due to collision detection is done via modified date
	if( modified == undefined )
	{
		if(tiddler)
		{
			modified = tiddler.modified;
		}else{
			modified =  new Date();
		}
	}
	var omodified = modified;
	if(tiddler){
		omodified = tiddler.modified; // get original modified date
	}
	//alert(fields);
	//save in local TW
	var tiddler = "";
	if( isTW21() )		//ver 2.1.x
	{
		tiddler =  store.ss_saveTiddler(title,newTitle,newBody,modifier,modified,tags, fields);//save to local copy
	}else{		//ver 2.0.x
		tiddler = store.ss_saveTiddler(title,newTitle,newBody,modifier,modified,tags);//save to local copy
	}
	
	var postStr = ajax.escape("tiddler",tiddler.saveToDiv());
	postStr += '&' + ajax.escape("omodified",omodified.convertToYYYYMMDDHHMM());
	postStr += '&' + ajax.escape("otitle",title.htmlDecode());
	if( serverside.handle_msg.saveTiddler != null )
		postStr += '&' + serverside.handle_msg.saveTiddler;
	ajax.post(serverside.handle.saveTiddler,serverside.fn.displayMessage,postStr);
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
	var postStr = ajax.escape("title",title);
	if( serverside.handle_msg.removeTiddler != null )
		postStr += '&' + serverside.handle_msg.removeTiddler;
	ajax.post(serverside.handle.removeTiddler,serverside.fn.displayMessage,postStr);
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
	var postStr = ajax.escape("upload",allTiddlersAsHtml());
	if( serverside.handle_msg.uploadStoreArea != null )
		postStr += '&' + serverside.handle_msg.uploadStoreArea;
	ajax.post(serverside.handle.uploadStoreArea,serverside.fn.displayMessage,postStr);
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
config.macros.option.ss_handler = config.macros.option.handler;
config.macros.option.handler = function(place,macroName,params)
{
	var opt = params[0];
	if(config.options[opt] == undefined)
		return;
	var c;
	switch(opt.substr(0,3))
	{
		case "pas":
			c = document.createElement("input");
			c.setAttribute("type","password");
			c.onkeyup = this.onChangeOption;
			c.setAttribute("option",opt);
			c.size = 15;
			place.appendChild(c);
			//c.value = config.options[opt];
			c.value = "";		//this is such that the hash wont appear in the password box
			break;
		case "txt":
		case "chk":
			return config.macros.option.ss_handler(place,macroName,params);
			break;
	}
};
//////////////////////////////////////////////////onChangeOption
config.macros.option.onChangeOption = function(e)
{
	var opt = this.getAttribute("option");
	var elementType,valueField;
	if(opt)
	{
		switch(opt.substr(0,3))
		{
			case "pas":
				elementType = "input";
				valueField = "value";
				config.options[opt] = Crypto.hexSha1Str(this[valueField]).toLowerCase();	//hash password
				break;
			case "txt":
				elementType = "input";
				valueField = "value";
				config.options[opt] = this[valueField];
				break;
			case "chk":
				elementType = "input";
				valueField = "checked";
				config.options[opt] = this[valueField];
				break;
		}
		
		/*if( opt.substr(0,3) == "pas" )
		{
			//config.options[opt] = hex_md5(this[valueField]);
			config.options[opt] = Crypto.hexSha1Str(this[valueField]);
		}else{
			config.options[opt] = this[valueField];
		}*/
		//check if save cookie in local computer
		saveOptionCookie(opt);
		var nodes = document.getElementsByTagName(elementType);
		for(var t=0; t<nodes.length; t++)
		{
			var optNode = nodes[t].getAttribute("option");
			if(opt == optNode)
				nodes[t][valueField] = this[valueField];
		}
	}
	return(true);
};

//////////////////////////////////////////////////loadOptionsCookie
window.loadOptionsCookie = function()
{
	if(safeMode)
		return;
	var cookies = document.cookie.split(";");
	for(var c=0; c<cookies.length; c++)
	{
		var p = cookies[c].indexOf("=");
		if(p != -1)
		{
			var name = cookies[c].substr(0,p).trim();
			var value = cookies[c].substr(p+1).trim();
			switch(name.substr(0,3))
			{
				case "txt":
					config.options[name] = DecodeCookie(value);//convert from UTF-8 to unicode
					break;
				case "chk":
					config.options[name] = value == "true";
					break;
				case "pas":
					config.options[name] = DecodeCookie(value);//does not require decode because it is a hash, use DecodeCookie anyway :)
					break;
			}
		}
	}
};

//////////////////////////////////////////////////saveOptionCookie
window.ss_saveOptionCookie = window.saveOptionCookie;
window.saveOptionCookie = function(name)
{
	if(safeMode)
		return;
	if( name.substr(0,3)=="pas" )
	{
		var c = name + "=" + EncodeCookie(config.options[name].toString());
		var t = "; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/";
		if( serverside.passwordTime!=0 ) //if not using default time, calculate new time
		{
			var date = new Date();
			date.setTime(date.getTime()+serverside.passwordTime);
			t = "; expires="+date.toGMTString()+"; path=/";
		}
		document.cookie = c+t;
	}else{		//hijack txt to use encodeURIComponent
		if( name.substr(0,3)=="txt" )
		{
			var c = name + "=" + EncodeCookie(config.options[name].toString());
			c += "; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/";
			document.cookie = c;
		}else{
			window.ss_saveOptionCookie(name);
		}
	}
};

/////////////////////////////////////////////////////////encode and decode cookies///////////////////////////////////////////////////
//functions provided by BramChen
//add encodeURI because of PHP setcookide would automatically urlencode the cookies
//user encodeURIComponent instead of escape because of better support in non-english character and symbol such as "+"
function EncodeCookie(s)
{
	//return escape(manualConvertUnicodeToUTF8(s));
	return encodeURI(encodeURIComponent(manualConvertUnicodeToUTF8(s)));
}

function DecodeCookie(s)
{
	//s=unescape(s);
	s=decodeURIComponent(decodeURI(s));
	var re = /&#[0-9]{1,5};/g;
	return s.replace(re, function($0) {return(String.fromCharCode(eval($0.replace(/[&#;]/g,""))));});
}
//////////////////////////////////////////////////////////////TW code for TW compatibility///////////////////////////////////////////////////
//obtained from TW 2.0.11 for language compatibility
window.merge = function (dst,src)
{
	for (p in src)
		dst[p] = src[p];
	return dst;
}

//obtained from TW 2.1 for encryption compatibility
//to encrypt using SHA1, use Crypto.hexSha1Str(string)
// ---------------------------------------------------------------------------------
// Crypto functions and associated conversion routines
// ---------------------------------------------------------------------------------

// Crypto "namespace"
function Crypto() {}

// Convert a string to an array of big-endian 32-bit words
Crypto.strToBe32s = function(str)
{
	var be = Array();
	var len = Math.floor(str.length/4);
	var i, j;
	for(i=0, j=0; i<len; i++, j+=4)
		{
		be[i] = ((str.charCodeAt(j)&0xff) << 24)|((str.charCodeAt(j+1)&0xff) << 16)|((str.charCodeAt(j+2)&0xff) << 8)|(str.charCodeAt(j+3)&0xff);
		}
	while (j<str.length)
		{
		be[j>>2] |= (str.charCodeAt(j)&0xff)<<(24-(j*8)%32);
		j++;
		}
	return be;
}

// Convert an array of big-endian 32-bit words to a string
Crypto.be32sToStr = function(be)
{
	var str = "";
	for(var i=0;i<be.length*32;i+=8)
		str += String.fromCharCode((be[i>>5]>>>(24-i%32)) & 0xff);
	return str;
}

// Convert an array of big-endian 32-bit words to a hex string
Crypto.be32sToHex = function(be)
{
	var hex = "0123456789ABCDEF";
	var str = "";
	for(var i=0;i<be.length*4;i++)
		str += hex.charAt((be[i>>2]>>((3-i%4)*8+4))&0xF) + hex.charAt((be[i>>2]>>((3-i%4)*8))&0xF);
	return str;
}

// Return, in hex, the SHA-1 hash of a string
Crypto.hexSha1Str = function(str)
{
	return Crypto.be32sToHex(Crypto.sha1Str(str));
}

// Return the SHA-1 hash of a string
Crypto.sha1Str = function(str)
{
	return Crypto.sha1(Crypto.strToBe32s(str),str.length);
}

// Calculate the SHA-1 hash of an array of blen bytes of big-endian 32-bit words
Crypto.sha1 = function(x,blen)
{
	// Add 32-bit integers, wrapping at 32 bits
	//# Uses 16-bit operations internally to work around bugs in some JavaScript interpreters.
	add32 = function(a,b)
	{
		var lsw = (a&0xFFFF)+(b&0xFFFF);
		var msw = (a>>16)+(b>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	};
	// Add five 32-bit integers, wrapping at 32 bits
	//# Uses 16-bit operations internally to work around bugs in some JavaScript interpreters.
	add32x5 = function(a,b,c,d,e)
	{
		var lsw = (a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF)+(e&0xFFFF);
		var msw = (a>>16)+(b>>16)+(c>>16)+(d>>16)+(e>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	};
	// Bitwise rotate left a 32-bit integer by 1 bit
	rol32 = function(n)
	{
		return (n>>>31)|(n<<1);
	};

	var len = blen*8;
	// Append padding so length in bits is 448 mod 512
	x[len>>5] |= 0x80 << (24-len%32);
	// Append length
	x[((len+64>>9)<<4)+15] = len;
	var w = Array(80);

	var k1 = 0x5A827999;
	var k2 = 0x6ED9EBA1;
	var k3 = 0x8F1BBCDC;
	var k4 = 0xCA62C1D6;

	var h0 = 0x67452301;
	var h1 = 0xEFCDAB89;
	var h2 = 0x98BADCFE;
	var h3 = 0x10325476;
	var h4 = 0xC3D2E1F0;

	for(var i=0;i<x.length;i+=16)
		{
		var j,t;
		var a = h0;
		var b = h1;
		var c = h2;
		var d = h3;
		var e = h4;
		for(j = 0;j<16;j++)
			{
			w[j] = x[i+j];
			t = add32x5(e,(a>>>27)|(a<<5),d^(b&(c^d)),w[j],k1);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=16;j<20;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),d^(b&(c^d)),w[j],k1);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=20;j<40;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),b^c^d,w[j],k2);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=40;j<60;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),(b&c)|(d&(b|c)),w[j],k3);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=60;j<80;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),b^c^d,w[j],k4);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}

		h0 = add32(h0,a);
		h1 = add32(h1,b);
		h2 = add32(h2,c);
		h3 = add32(h3,d);
		h4 = add32(h4,e);
		}
	return Array(h0,h1,h2,h3,h4);
}
