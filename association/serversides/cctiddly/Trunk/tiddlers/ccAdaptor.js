



config.backstageTasks.remove("upgrade");
config.backstageTasks.remove("save");
config.backstageTasks.remove("sync");



function isLoggedIn(){
	if(window.loggedIn == '1'){
		return true;
	}else{
		return false;
	}
}

function ccTiddlyAdaptor()
{
}

merge(ccTiddlyAdaptor, { 
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

ccTiddlyAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
        return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ccTiddlyAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
        return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

ccTiddlyAdaptor.doHttpPUT = function(uri,callback,params,headers,data,contentType,username,password)
{
        return doHttp('PUT',uri,data,contentType,username,password,callback,params,headers);
};

ccTiddlyAdaptor.minHostName = function(host)
{
        return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
ccTiddlyAdaptor.normalizedTitle = function(title)
{
        return title;
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
ccTiddlyAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

ccTiddlyAdaptor.prototype.login = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/handle/loginFile.php?cctuser=%1&cctpass=%2';
	var uri = uriTemplate.format([context.host,context.username,context.password]);
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.loginCallback,context);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.loginCallback = function(status,context,responseText,uri,xhr)
{
	if(xhr.status==401) {
		context.status = false;
	} else {
		context.status = true;
		var c='sessionToken'+"="+responseText;
			c+="; expires=Fri, 1 Jan 2811 12:00:00 UTC; host=*";
			document.cookie=c;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.register = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/handle/register.php';
	var uri = uriTemplate.format([context.host,context.username,Crypto.hexSha1Str(context.password)]);
	var dataTemplate = 'username=&0&reg_mail=%1&password=%2&password2=%3';
	var data = dataTemplate.format([context.username,context.password1,context.password2]);
	var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.registerCallback,context,null,data);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.registerCallback = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
 	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/handle/listWorkspaces.php';
	var uri = uriTemplate.format([context.host]);
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getWorkspaceListCallback,context, {'accept':'application/json'});
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.workspaces = [];
	context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
	try {
		eval('var workspaces=' + responseText);
	} catch (ex) {
		context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
		if(context.callback)
			context.callback(context,context.userParams);
			return;
		}
		for (var i=0; i < workspaces.length; i++) {
			context.workspaces.push({title:workspaces[i]})
		}
		context.status = true;
	} else {
			context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	//	displayMessage("get Tiddler list");
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/handle/listTiddlers.php?workspace=%1';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerListCallback,context, {'accept':'application/json'});
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			eval('var tiddlers=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var list = [];
		for(var i=0; i < tiddlers.length; i++) {
			var tiddler = new Tiddler(tiddlers[i]['title']);
			tiddler.fields['server.page.revision'] = tiddlers[i]['revision'];
			list.push(tiddler);
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : this.fullHostName(tiddler.fields['server.host']);
	var bag = tiddler.fields['server.bag']
	var workspace = tiddler.fields['server.workspace']
	var uriTemplate = '%0/%1/#%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ccTiddlyAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

ccTiddlyAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	   if(context.revision) {
	         var uriTemplate = '%0/handle/revisionDisplay.php?title=%2&workspace=%1&revision=%3';
	  } else {
			var uriTemplate = '%0/handle/getTiddler.php?title=%2&workspace=%1';
	  }
	
	uri = uriTemplate.format([context.host,context.workspace,ccTiddlyAdaptor.normalizedTitle(title),context.revision]);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback,context, {'accept':'application/json'});
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
        context.status = false;
        context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
        if(status) {
                var info=[]
                try {
                    eval('info=' + responseText);
                } catch (ex) {
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
        } else {
                context.statusText = xhr.statusText;
                if(context.callback)
                        context.callback(context,context.userParams);
                return;
        }
        if(context.callback)
                context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.revisions = [];
	var tiddler = store.fetchTiddler(title);
	var encodedTitle = encodeURIComponent(title);
	var uriTemplate = '%0/handle/revisionList.php?workspace=%1&title=%2';
	var host = this.fullHostName(this.host);
	var workspace = context.workspace ? context.workspace : tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,workspace,encodedTitle]);
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerRevisionListCallback,context);
};

ccTiddlyAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
	if(responseText.indexOf('<!DOCTYPE html')==1)
		status = false;
	if(xhr.status=="204")
		status = false;
	context.status = false;
	if(status) {
		var r =  responseText;
		if(r != '-' && r.trim() != 'revision not found') {
			var revs = r.split('\n');
			for(var i=0; i<revs.length; i++) {
				var parts = revs[i].split(' ');
				if(parts.length>1) {
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
		//var s = 'server.page.revision';
		//list.sort(function(a,b) {return a.fields[s] < b.fields[s] ? +1 : (a.fields[s] == b.fields[s] ? 0 : -1);});
		context.revisions.sort(function(a,b) {return a.modified<b.modified?+1:-1;});
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	var recipeuriTemplate = '%0/handle/save.php';
	var host = context.host ? context.host : this.fullHostName(tiddler.fields['server.host']);
	var uri = recipeuriTemplate.format([host,context.workspace,tiddler.title]);
	var d = new Date();
	d.setTime(Date.parse(tiddler['modified']));
	d = d.convertToYYYYMMDDHHMM();
	var fieldString = ""; 
	for (var name in tiddler.fields) { 
		if (String(tiddler.fields[name])) 
			fieldString += name +"='"+tiddler.fields[name]+"' "; 
	}
	
	if(tiddler.fields['server.page.revision']==1)
		tiddler.fields['server.page.revision'] = 10000;
	else
		tiddler.fields['server.page.revision'] = parseInt(tiddler.fields['server.page.revision'],10)+1;
	
	var payload = "workspace="+tiddler.fields['server.workspace']+"&otitle="+encodeURIComponent(tiddler.title)+"&title="+encodeURIComponent(tiddler.title) + "&modified="+tiddler.modified.convertToYYYYMMDDHHMM()+"&modifier="+tiddler.modifier + "&tags="+tiddler.getTags()+"&revision="+encodeURIComponent(tiddler.fields['server.page.revision']) + "&fields="+encodeURIComponent(fieldString)+
"&body="+encodeURIComponent(tiddler.text)+"&wikifiedBody="+encodeURIComponent(wikifyStatic(tiddler.text))+"";
	var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.putTiddlerCallback,context,{'Content-type':'application/x-www-form-urlencoded', "Content-length": payload.length},payload,"application/x-www-form-urlencoded");
	return typeof req == 'string' ? req : true;
};


ccTiddlyAdaptor.center  = function(el)
{
	var size = this.getsize(el);
	el.style.left = (Math.round(findWindowWidth()/2) - (size.width /2) + findScrollX())+'px';
	el.style.top = (Math.round(findWindowHeight()/2) - (size.height /2) + findScrollY())+'px';
}
	
ccTiddlyAdaptor.getsize = function (el)
{
	var x = {};
	x.width = el.offsetWidth || el.style.pixelWidth;
	x.height = el.offsetHeight || el.style.pixelHeight;
	return x;
}
	
ccTiddlyAdaptor.showCloak = function()
{
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

ccTiddlyAdaptor.handleError = function(error_code)
{
	setStylesheet(
	"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
	"html > body > #backstageCloak {height:100%;}"+
	"#errorBox {border:1px solid #ccc;background-color: #eee; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
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

ccTiddlyAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	if(status) {
		context.status = true;
	} else {
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

ccTiddlyAdaptor.prototype.deleteTiddler = function(title,context,userParams,callback)
{	
	context = this.setContext(context,userParams,callback);
	context.title = title;
	title = encodeURIComponent(title);
	var host = this && this.host ? this.host : this.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0/handle/delete.php?workspace=%1&title=%2';
	var uri = uriTemplate.format([host,context.workspace,title]);
	var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.deleteTiddlerCallback,title);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.deleteTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

config.adaptors[ccTiddlyAdaptor.serverType] = ccTiddlyAdaptor;

