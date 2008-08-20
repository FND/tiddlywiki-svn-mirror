

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

ccTiddlyAdaptor.prototype = new AdaptorBase();

// !!TODO set the variables below
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
//#console.log('login:'+context.username);
       context = this.setContext(context,userParams,callback);
       var uriTemplate = '%0/handle/loginFile.php?cctuser=%1&cctpass=%2';
       var uri = uriTemplate.format([context.host,context.username,context.password]);
//#console.log('uri:'+uri);
displayMessage("uri : "+uri);
       var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.loginCallback,context);
       return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.loginCallback = function(status,context,responseText,uri,xhr)
{
	displayMessage(responseText);
//#console.log('loginCallback:'+status);
       if(xhr.status==401) {
               context.status = false;
       } else {
               context.status = true;
       }
       if(context.callback)
               context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.register = function(context,userParams,callback)
{
//#console.log('register:'+context.username);
       context = this.setContext(context,userParams,callback);
       var uriTemplate = '%0/handle/register.php';
       var uri = uriTemplate.format([context.host,context.username,Crypto.hexSha1Str(context.password)]);
//#console.log('uri:'+uri);
       var dataTemplate = 'username=&0&reg_mail=%1&password=%2&password2=%3';
       var data = dataTemplate.format([context.username,context.password1,context.password2]);
       var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.registerCallback,context,null,data);
       return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.registerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('registerCallback:'+status);
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
	         var uriTemplate = '%0handle/revisionDisplay.php?title=%2&workspace=%1&revision=%3';
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
//console.log(responseText);
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
// get a list of the revisions for a page
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
//console.log('uri: '+uri);
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerRevisionListCallback,context);
//#console.log("req:"+req);
};

ccTiddlyAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
	if(responseText.indexOf('<!DOCTYPE html')==1)
		status = false;
	if(xhr.status=="204")
		status = false;
//#fnLog('xhr:'+xhr);
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
	var payload = "workspace="+tiddler.fields['server.workspace']+"&otitle="+encodeURIComponent(tiddler.title)+"&title="+encodeURIComponent(tiddler.title) + "&modified="+tiddler.modified.convertToYYYYMMDDHHMM()+"&modifier="+tiddler.modifier + "&tags="+tiddler.getTags()+"&revision="+encodeURIComponent(tiddler.fields['server.page.revision']) + "&fields="+encodeURIComponent(fieldString)+"&body="+encodeURIComponent(tiddler.text)+"";
		var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.putTiddlerCallback,context,{'Content-type':'application/x-www-form-urlencoded', "Content-length": payload.length},payload,"application/x-www-form-urlencoded");
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	
//console.log('px:'+xhr.status)	
    context.status = false;
       if(status) {
			context.status = true;
       } else {
	   		context.status = false;
			if(xhr.status == 401)
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
				
			}else if(xhr.status==403)
			{
				displayMessage("Page Required Reloading.");
			}else{
				displayMessage(responseText);
               displayMessage('  xhr status is' + xhr.status);
               displayMessage('putTiddler xhr status text is' + xhr.statusText);
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
//#console.log('deleteTiddler:'+title);
	var host = this && this.host ? this.host : this.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0/handle/delete.php?workspace=%1&title=%2';
	var uri = uriTemplate.format([host,context.workspace,title]);
//#console.log('uri: '+uri);

	var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.deleteTiddlerCallback,title);
//#fnLog("req:"+req);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.deleteTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('deleteTiddlerCallback:'+status);
//#console.log('rt:'+responseText.substr(0,50));
//#fnLog('xhr:'+xhr);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.close = function()
{
        return true;
};

config.adaptors[ccTiddlyAdaptor.serverType] = ccTiddlyAdaptor;

/***
!JSON Code, used to serialize the data
***/
/*
Copyright (c) 2005 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
    The global object JSON contains two methods.

    JSON.stringify(value) takes a JavaScript value and produces a JSON text.
    The value must not be cyclical.

    JSON.parse(text) takes a JSON text and produces a JavaScript value. It will
    throw a 'JSONError' exception if there is an error.
*/
var JSON = {
    copyright: '(c)2005 JSON.org',
    license: 'http://www.crockford.com/JSON/license.html',
/*
    Stringify a JavaScript value, producing a JSON text.
*/
    stringify: function (v) {
        var a = [];

/*
    Emit a string.
*/
        function e(s) {
            a[a.length] = s;
        }

/*
    Convert a value.
*/
        function g(x) {
            var c, i, l, v;

            switch (typeof x) {
            case 'object':
                if (x) {
                    if (x instanceof Array) {
                        e('[');
                        l = a.length;
                        for (i = 0; i < x.length; i += 1) {
                            v = x[i];
                            if (typeof v != 'undefined' &&
                                    typeof v != 'function') {
                                if (l < a.length) {
                                    e(',');
                                }
                                g(v);
                            }
                        }
                        e(']');
                        return;
                    } else if (typeof x.toString != 'undefined') {
                        e('{');
                        l = a.length;
                        for (i in x) {
                            v = x[i];
                            if (x.hasOwnProperty(i) &&
                                    typeof v != 'undefined' &&
                                    typeof v != 'function') {
                                if (l < a.length) {
                                    e(',');
                                }
                                g(i);
                                e(':');
                                g(v);
                            }
                        }
                        return e('}');
                    }
                }
                e('null');
                return;
            case 'number':
                e(isFinite(x) ? +x : 'null');
                return;
            case 'string':
                l = x.length;
                e('"');
                for (i = 0; i < l; i += 1) {
                    c = x.charAt(i);
                    if (c >= ' ') {
                        if (c == '\\' || c == '"') {
                            e('\\');
                        }
                        e(c);
                    } else {
                        switch (c) {
                            case '\b':
                                e('\\b');
                                break;
                            case '\f':
                                e('\\f');
                                break;
                            case '\n':
                                e('\\n');
                                break;
                            case '\r':
                                e('\\r');
                                break;
                            case '\t':
                                e('\\t');
                                break;
                            default:
                                c = c.charCodeAt();
                                e('\\u00' + Math.floor(c / 16).toString(16) +
                                    (c % 16).toString(16));
                        }
                    }
                }
                e('"');
                return;
            case 'boolean':
                e(String(x));
                return;
            default:
                e('null');
                return;
            }
        }
        g(v);
        return a.join('');
    },
/*
    Parse a JSON text, producing a JavaScript value.
*/
    parse: function (text) {
        var p = /^\s*(([,:{}\[\]])|"(\\.|[^\x00-\x1f"\\])*"|-?\d+(\.\d*)?([eE][+-]?\d+)?|true|false|null)\s*/,
            token,
            operator;

        function error(m, t) {
            throw {
                name: 'JSONError',
                message: m,
                text: t || operator || token
            };
        }

        function next(b) {
            if (b && b != operator) {
                error("Expected '" + b + "'");
            }
            if (text) {
                var t = p.exec(text);
                if (t) {
                    if (t[2]) {
                        token = null;
                        operator = t[2];
                    } else {
                        operator = null;
                        try {
                            token = eval(t[1]);
                        } catch (e) {
                            error("Bad token", t[1]);
                        }
                    }
                    text = text.substring(t[0].length);
                } else {
                    error("Unrecognized token", text);
                }
            } else {
                token = operator = undefined;
            }
        }


        function val() {
            var k, o;
            switch (operator) {
            case '{':
                next('{');
                o = {};
                if (operator != '}') {
                    for (;;) {
                        if (operator || typeof token != 'string') {
                            error("Missing key");
                        }
                        k = token;
                        next();
                        next(':');
                        o[k] = val();
                        if (operator != ',') {
                            break;
                        }
                        next(',');
                    }
                }
                next('}');
                return o;
            case '[':
                next('[');
                o = [];
                if (operator != ']') {
                    for (;;) {
                        o.push(val());
                        if (operator != ',') {
                            break;
                        }
                        next(',');
                    }
                }
                next(']');
                return o;
            default:
                if (operator !== null) {
                    error("Missing value");
                }
                k = token;
                next();
                return k;
            }
        }
        next();
        return val();
    }
};
