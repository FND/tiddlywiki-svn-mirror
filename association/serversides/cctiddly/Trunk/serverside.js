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

	if (status != true)
	{
		window.loggedIn = false; // we should check for other cases - revisions have changed. 
		var a = document.getElementById('backstageCloak');
		a.style.display = "block";	
		//a.style.opacity = "0.7"; 
		a.style.height= "100%";
		var b = document.getElementById('backstage');
		b.style.position="absolute";	
		b.style.padding='40px 0px 0px 0px';
		//b.innerHTML = wikifyStatic("<<ccLogin>>");
	//	window.open(window.location,'login window')
		frm=createTiddlyElement(b,"form",null,"wizard");
		var body=createTiddlyElement(frm,"div",null,"wizardBody");
		var step=createTiddlyElement(body,"div",null,"wizardStep");
		createTiddlyElement(step,"h1",null,null,"Your changes were *NOT* saved");
		createTiddlyElement(step,"br");
		createTiddlyElement(step,"br");		
		createTiddlyText(step,"Please click the button below which will open a new window.");
		createTiddlyElement(step,"br");
		createTiddlyElement(step,"br");
		createTiddlyText(step,"You will need to log into the new window and then copy your changes from this window into the new window. ");
		createTiddlyElement(step,"br");
		createTiddlyElement(step,"br");
	createTiddlyButton(step,"Open a Window where I can log in and save my changes	.... ",null,function(e){ window.open (window.location,"mywindow");	 return false;});
		createTiddlyElement(step,"br");
		createTiddlyElement(step,"br");
		createTiddlyButton(step,"Hide this message",null,function(e){a.style.display = "none"; b.style.display = "none";	 return false;});
		createTiddlyElement(step,"br");
		createTiddlyElement(step,"br");
		createTiddlyText(step,"Sorry for any inconvenience. ");
//	return false;

	}
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