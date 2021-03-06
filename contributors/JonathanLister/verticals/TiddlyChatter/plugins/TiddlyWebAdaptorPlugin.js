/***
|''Name:''|TiddlyWebAdaptorPlugin|
|''Description:''|TiddlyWeb Adaptor based on Example Adaptor|
|''Author:''|Chris Dent (cdent (at) peermore (dot) com)|
|''Source:''|n/a|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/ChrisDent/....|
|''Version:''|0.0.1|
|''Status:''|Under Development|
|''Date:''|Mar 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''||
|''~CoreVersion:''||
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TiddlyWebAdaptorPlugin) {
version.extensions.TiddlyWebAdaptorPlugin = {installed:true};

function TiddlyWebAdaptor()
{
        this.host = null;
        this.workspace = null;
        return this;
}

// !!TODO set the variables below
TiddlyWebAdaptor.mimeType = 'application/json';
TiddlyWebAdaptor.serverType = 'tiddlyweb'; // MUST BE LOWER CASE
TiddlyWebAdaptor.serverParsingErrorMessage = "Error parsing result from server";
TiddlyWebAdaptor.errorInFunctionMessage = "Error in function TiddlyWebAdaptor.%0";

TiddlyWebAdaptor.prototype.setContext = function(context,userParams,callback)
{
        if(!context) context = {};
        context.userParams = userParams;
        if(callback) context.callback = callback;
        context.adaptor = this;
        if(!context.host)
                context.host = this.host;
        context.host = TiddlyWebAdaptor.fullHostName(context.host);
        if(!context.workspace)
                context.workspace = this.workspace;
        return context;
};

TiddlyWebAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
        return doHttp('GET',uri,data,contentType,username,password,callback,params,headers,1);
};

TiddlyWebAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
        return doHttp('POST',uri,data,contentType,username,password,callback,params,headers,1);
};

TiddlyWebAdaptor.doHttpPUT = function(uri,callback,params,headers,data,contentType,username,password)
{
        return doHttp('PUT',uri,data,contentType,username,password,callback,params,headers,1);
};

TiddlyWebAdaptor.fullHostName = function(host)
{
        if(!host)
                return '';
        if(!host.match(/:\/\//))
                host = 'http://' + host;
        if(host.substr(host.length-1) != '/')
                host = host + '/';
        return host;
};

TiddlyWebAdaptor.minHostName = function(host)
{
        return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
TiddlyWebAdaptor.normalizedTitle = function(title)
{
        return title;
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
TiddlyWebAdaptor.dateFromEditTime = function(editTime)
{
        var dt = editTime;
        return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

TiddlyWebAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
        displayMessage("openHost: " + host)
        this.host = TiddlyWebAdaptor.fullHostName(host);
        context = this.setContext(context,userParams,callback);
        if(context.callback) {
                context.status = true;
                window.setTimeout(function() {callback(context,userParams);},0);
        }
        return true;
};

TiddlyWebAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
        displayMessage("openWorkspace: " + workspace)
        this.workspace = workspace;
        context = this.setContext(context,userParams,callback);
        if(context.callback) {
                context.status = true;
                window.setTimeout(function() {callback(context,userParams);},0);
        }
        return true;
};

TiddlyWebAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
        displayMessage("getWorkspaceList")
        context = this.setContext(context,userParams,callback);
        var uriTemplate = '%0recipes';
        var uri = uriTemplate.format([context.host]);
        var req = TiddlyWebAdaptor.doHttpGET(uri,TiddlyWebAdaptor.getWorkspaceListCallback,context, {'accept':'application/json'});
        return typeof req == 'string' ? req : true;
};

TiddlyWebAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
        context.status = false;
        context.statusText = TiddlyWebAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
        if(status) {
                try {
                    eval('var workspaces=' + responseText);
                } catch (ex) {
                        context.statusText = exceptionText(ex,TiddlyWebAdaptor.serverParsingErrorMessage);
                        if(context.callback)
                                context.callback(context,context.userParams);
                        return;
                }
                var list = [];
                for (var i=0; i < workspaces.length; i++) {
                    list.push({title:workspaces[i]})
                }
                context.workspaces = list;
                context.status = true;
        } else {
                context.statusText = xhr.statusText;
        }
        if(context.callback)
                context.callback(context,context.userParams);
};

TiddlyWebAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
        context = this.setContext(context,userParams,callback);
        var uriTemplate = '%0recipes/%1/tiddlers';
        var uri = uriTemplate.format([context.host,context.workspace]);
        var req = TiddlyWebAdaptor.doHttpGET(uri,TiddlyWebAdaptor.getTiddlerListCallback,context, {'accept':'application/json'});
        return typeof req == 'string' ? req : true;
};

TiddlyWebAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
        context.status = false;
        context.statusText = TiddlyWebAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
        if(status) {
                try {
                    eval('var tiddlers=' + responseText);
                } catch (ex) {
                        context.statusText = exceptionText(ex,TiddlyWebAdaptor.serverParsingErrorMessage);
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

TiddlyWebAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
        var info = {};
        var host = this && this.host ? this.host : TiddlyWebAdaptor.fullHostName(tiddler.fields['server.host']);
        var bag = tiddler.fields['server.bag']
        var workspace = tiddler.fields['server.workspace']
        var baguriTemplate = '%0bags/%1/tiddlers/%2';
        var recipeuriTemplate = '%0recipes/%1/tiddlers/%2';
        if (bag)
            info.uri = baguriTemplate.format([host,bag,tiddler.title]);
        else
            info.uri = recipeuriTemplate.format([host,workspace,tiddler.title]);
        return info;
};

TiddlyWebAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
        context = this.setContext(context,userParams,callback);
        if(revision)
                context.revision = revision;
        return this.getTiddler(title,context,userParams,callback);
};

TiddlyWebAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
        context = this.setContext(context,userParams,callback);
        if(title)
                context.title = title;
        if(context.revision) {
                var uriTemplate = '%0recipes/%1/tiddlers/%2/revisions/%3';
        } else {
                uriTemplate = '%0recipes/%1/tiddlers/%2';
        }
        uri = uriTemplate.format([context.host,context.workspace,TiddlyWebAdaptor.normalizedTitle(title),context.revision]);

        context.tiddler = new Tiddler(title);
        context.tiddler.fields['server.type'] = TiddlyWebAdaptor.serverType;
        context.tiddler.fields['server.host'] = TiddlyWebAdaptor.minHostName(context.host);
        context.tiddler.fields['server.workspace'] = context.workspace;
        var req = TiddlyWebAdaptor.doHttpGET(uri,TiddlyWebAdaptor.getTiddlerCallback,context, {'accept':'application/json'});
        return typeof req == 'string' ? req : true;
};

TiddlyWebAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
        context.status = false;
        context.statusText = TiddlyWebAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
        if(status) {
                var info=[]
                try {
                    eval('info=' + responseText);
                } catch (ex) {
                        context.statusText = exceptionText(ex,TiddlyWebAdaptor.serverParsingErrorMessage);
                        if(context.callback)
                                context.callback(context,context.userParams);
                        return;
                }
                context.tiddler.text = info['text'];
                context.tiddler.tags = info['tags'];
                context.tiddler.fields['server.bag'] = info['bag'];
                context.tiddler.fields['server.page.revision'] = info['revison']
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

TiddlyWebAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
        context = this.setContext(context,userParams,callback);
        var uriTemplate = '%0recipes/%1/tiddlers/%2/revisions';
        // no support for limit
        var uri = uriTemplate.format([context.host,context.workspace,TiddlyWebAdaptor.normalizedTitle(title)]);
        var req = TiddlyWebAdaptor.doHttpGET(uri,TiddlyWebAdaptor.getTiddlerRevisionListCallback,context);
        return typeof req == 'string' ? req : true;
};

TiddlyWebAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
        context.status = false;
        if(status) {
                try {
                    eval('var info=' + responseText);
                } catch (ex) {
                        context.statusText = exceptionText(ex,TiddlyWebAdaptor.serverParsingErrorMessage);
                        if(context.callback)
                                context.callback(context,context.userParams);
                        return;
                }
                var list = [];
                for(var i=0; i<info.length; i++) {
                    var tiddler = new Tiddler(info[i]['title']);
                    tiddler.modifier = info[i]['modifier'];
                    tiddler.tags = info[i]['tags'];
                    tiddler.fields['server.page.revision'] = info[i]['revision'];
                    tiddler.modified = Date.convertFromYYYYMMDDHHMM(info[i]['modified']);
                    tiddler.created = Date.convertFromYYYYMMDDHHMM(info[i]['created']);
                    list.push(tiddler);
                }
                var sortField = 'server.page.revision';
                list.sort(function(a,b) {
                    return a.fields[sortField] < b.fields[sortField]
                      ? +1
                      : (a.fields[sortField] == b.fields[sortField] ? 0 : -1);
                 });
                context.revisions = list;
                context.status = true;
        } else {
                context.statusText = xhr.statusText;
        }
        if(context.callback)
                context.callback(context,context.userParams);
};

TiddlyWebAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
        context = this.setContext(context,userParams,callback);
        context.title = tiddler.title;
        var baguriTemplate = '%0bags/%1/tiddlers/%2';
        var recipeuriTemplate = '%0recipes/%1/tiddlers/%2';
        var host = context.host ? context.host : TiddlyWebAdaptor.fullHostName(tiddler.fields['server.host']);
        var bag = tiddler.fields['server.bag'];
        var uri;
        if (bag) {
            uri = baguriTemplate.format([host,bag,tiddler.title]);
        } else if (context.workspace) {
            uri = recipeuriTemplate.format([host,context.workspace,tiddler.title]);
	} else {
            return 'no bag or recipe available for tiddler, set recipe';
        }
        context.uri = uri;
        payload = {
            title: tiddler.title,
            text: tiddler.text,
            modifier: tiddler.modifier,
            tags: tiddler.tags,
            revision: tiddler['server.page.revision']
        };
        payload = JSON.stringify(payload)
        var req = TiddlyWebAdaptor.doHttpPUT(uri,TiddlyWebAdaptor.putTiddlerCallback,context,{},payload,TiddlyWebAdaptor.mimeType);
        return typeof req == 'string' ? req : true;
};

TiddlyWebAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
        if(status) {
                context.status = true;
        } else {
                displayMessage('putTiddler xhr status is' + xhr.status);
                displayMessage('putTiddler xhr status text is' + xhr.statusText);
                context.status = false;
                context.statusText = xhr.statusText;
        }
        if(context.callback)
                context.callback(context,context.userParams);
};

TiddlyWebAdaptor.prototype.close = function()
{
        return true;
};

config.adaptors[TiddlyWebAdaptor.serverType] = TiddlyWebAdaptor;
} //# end of 'install only once'

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

//}}}
