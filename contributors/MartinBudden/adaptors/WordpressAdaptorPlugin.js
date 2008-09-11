/***
|''Name:''|WordpressAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from Wordpress|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/WordpressAdaptorPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Mar 11, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.1|

see: http://codex.wordpress.org/XML-RPC_Support and http://www.xmlrpc.com/metaWeblogApi

# Do the actions indicated by the !!TODO comments, namely:
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

''For debug:''
|''Default Wordpress username''|<<option txtWordpressUsername>>|
|''Default Wordpress password''|<<option txtWordpressPassword>>|

***/
//{{{
// For debug:
if(!config.options.txtWordpressUsername)
	{config.options.txtWordpressUsername = '';}
if(!config.options.txtWordpressPassword)
	{config.options.txtWordpressPassword = '';}
//}}}

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.WordpressAdaptorPlugin) {
version.extensions.WordpressAdaptorPlugin = {installed:true};

config.commands.getTiddler.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTiddler',tiddler.fields) && tiddler.fields['server.page.id'];
};

function WordpressAdaptor()
{
}

WordpressAdaptor.prototype = new AdaptorBase();

WordpressAdaptor.serverType = 'wordpress'; // MUST BE LOWER CASE
WordpressAdaptor.serverParsingErrorMessage = "Error parsing result from server";
WordpressAdaptor.errorInFunctionMessage = "Error in function WordpressAdaptor.%0";
WordpressAdaptor.fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';

WordpressAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
WordpressAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a Wordpress timestamp in YYYYMMDDThh:mm:ssZ format into a JavaScript Date object
WordpressAdaptor.dateFromTimestamp = function(timestamp)
{
	var dt = timestamp;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(4,2)-1,dt.substr(6,2),dt.substr(9,2),dt.substr(12,2)));
};

WordpressAdaptor.prototype.setContext = function(context,userParams,callback)
{
//#console.log('setContext');
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = this.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	if(config.options.txtWordpressUsername && config.options.txtWordpressPassword) {
		context.username = config.options.txtWordpressUsername;
		context.password = config.options.txtWordpressPassword;
	} else if(context.loginPromptFn) {
		context = context.loginPromptFn(context);
	}
	return context;
};

WordpressAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
//#console.log('getWorkspaceList');
	context = this.setContext(context,userParams,callback);
	if(context.workspace) {
//#console.log("w:"+context.workspace);
		context.status = true;
		context.workspaces = [{name:context.workspace,title:context.workspace}];
		if(context.callback)
			window.setTimeout(function() {callback(context,userParams);},0);
		return true;
	}
// !!TODO set the uriTemplate
	var uriTemplate = '%0/xmlrpc.php';
	var uri = uriTemplate.format([context.host]);
	var fn = 'wiki.getAllWorkspaces';
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName></methodCall>';
	var payload = fnTemplate.format([fn]);
	var req = httpReq('POST',uri,WordpressAdaptor.getWorkspaceListCallback,context,{'Content-Length': payload.length},payload,'text/xml; charset=utf-8');
	return typeof req == 'string' ? req : true;
};

WordpressAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getWorkspaceListCallback:'+status);
	context.status = false;
	context.statusText = WordpressAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var item = {
				title:'exampleTitle',
				name:'exampleName'
				};
			list.push(item);
		} catch(ex) {
			context.statusText = exceptionText(ex,WordpressAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WordpressAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#console.log('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/xmlrpc.php';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri:'+uri);

	var fn = 'metaWeblog.getRecentPosts'; // blogid, username, password, numberOfPosts
	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '<param><value><string>%2</string></value></param>';
	fnParamsTemplate += '</params>';
	var count = 10;
	var fnParams = fnParamsTemplate.format([context.workspace,context.username,context.password,count]);
	var payload = WordpressAdaptor.fnTemplate.format([fn,fnParams]);
	var req = httpReq('POST',uri,WordpressAdaptor.getTiddlerListCallback,context,null,payload);
//#console.log("req:"+req);
	return typeof req == 'string' ? req : true;
};
/*
<?xml version="1.0"?>
<methodResponse><params><param>
<value> 
<array><data> 
<value><struct>

<member><name>dateCreated</name><value><dateTime.iso8601>20070929T13:53:11</dateTime.iso8601></value></member>
<member><name>userid</name><value><string>1887353</string></value></member>
<member><name>postid</name><value><string>1</string></value></member>
<member><name>description</name><value><string>Welcome to &lt;a href=&quot;http://wordpress.com/&quot;&gt;WordPress.com&lt;/a&gt;. This is your first post. Edit or delete it and start blogging!</string></value></member>
<member><name>title</name><value><string>Hello world!</string></value></member>
<member><name>link</name><value><string>http://martinbudden.wordpress.com/2007/09/29/hello-world/</string></value></member>
<member><name>permaLink</name><value><string>http://martinbudden.wordpress.com/2007/09/29/hello-world/</string></value></member>
<member><name>categories</name><value><array><data> <value><string>Uncategorized</string></value> </data></array></value></member>
<member><name>mt_excerpt</name><value><string></string></value></member>
<member><name>mt_text_more</name><value><string></string></value></member>
<member><name>mt_allow_comments</name><value><int>1</int></value></member>
<member><name>mt_allow_pings</name><value><int>1</int></value></member>
<member><name>mt_keywords</name><value><string></string></value></member>
<member><name>wp_slug</name><value><string>hello-world</string></value></member>
<member><name>wp_password</name><value><string></string></value></member>
<member><name>wp_author_id</name><value><string>1887353</string></value></member>
<member><name>wp_author_display_name</name><value><string>martinbudden</string></value></member>
<member><name>date_created_gmt</name><value><dateTime.iso8601>20070929T13:53:11</dateTime.iso8601></value></member>
<member><name>post_status</name><value><string>publish</string></value></member>
<member><name>custom_fields</name><value><array><data> </data></array></value></member> 
</struct></value>

<value><struct>
<member><name>dateCreated</name><value><dateTime.iso8601>19700101T00:00:00</dateTime.iso8601></value></member>
<member><name>userid</name><value><string>1887353</string></value></member>
<member><name>postid</name><value><string>4</string></value></member>
<member><name>description</name><value><string>Importing All photos in a &quot;photos&quot; directory with following structure: photos/CameraName/YYYY/YYYY-MM/photo.ext eg photos/EOS30D/2008/2008-09/IMG_1761.CR2 rename photo according to camera name, eg: photos/EOS30D/2008/2008-09/C30_1761.CR2 &lt;h1&gt;Setup&lt;/h1&gt; Catalog Settings Metadata tab check &quot;Automatically write changes into XMP&quot; Create following Smart Collections: &quot;1 Red (needs developing)&quot; &quot;2 Yellow (partially developed)&quot; &quot;3 Green (developed)&quot; note that the number is part of the collection name, this ensures the collections appear next to each other in the Collections panel Import photos use &quot;Add photos to catalog without moving&quot; use a Metadata preset that includes appropriate Copyright, Creator, Image and other values go through imported photos quickly and flag as Pick (P) or Rejected (R) also set Label to Red for any photos that need some developing (ie cropping or exposure changes). Optionally set star Rating of photos. Delete rejected photos (Photo menu) Go through photos refining star rating, adding keywords (including 'flickr' keywork for any photos to be uploaded to flickr) Develop any photos that have a Red label. Set the label to Green when development is complete, or Yellow if the you want to come back and do some further development later. at slower pace</string></value></member>
<member><name>title</name><value><string>How I organise my photos with Lightroom</string></value></member>
<member><name>link</name><value><string>http://martinbudden.wordpress.com/?p=4</string></value></member>
<member><name>permaLink</name><value><string>http://martinbudden.wordpress.com/?p=4</string></value></member>
<member><name>categories</name><value><array><data> <value><string>Uncategorized</string></value> </data></array></value></member>
<member><name>mt_excerpt</name><value><string></string></value></member>
<member><name>mt_text_more</name><value><string></string></value></member>
<member><name>mt_allow_comments</name><value><int>1</int></value></member>
<member><name>mt_allow_pings</name><value><int>1</int></value></member>
<member><name>mt_keywords</name><value><string>photograpy lightroom</string></value></member>
<member><name>wp_slug</name><value><string></string></value></member>
<member><name>wp_password</name><value><string></string></value></member>
<member><name>wp_author_id</name><value><string>1887353</string></value></member>
<member><name>wp_author_display_name</name><value><string>martinbudden</string></value></member>
<member><name>date_created_gmt</name><value><dateTime.iso8601>19700101T00:00:00</dateTime.iso8601></value></member>
<member><name>post_status</name><value><string>draft</string></value></member>

<member><name>custom_fields</name><value>
<array><data>
<value><struct>
<member><name>id</name><value><string>4</string></value></member>
<member><name>key</name><value><string>_edit_last</string></value></member>
<member><name>value</name><value><string>1887353</string></value></member>
</struct></value>
<value><struct>
<member><name>id</name><value><string>3</string></value></member>
<member><name>key</name><value><string>_edit_lock</string></value></member>
<member><name>value</name><value><string>1220897803</string></value></member>
</struct></value>
</data></array>
</value></member>

</struct></value> 
</data></array>
</value> 
</param></params></methodResponse>
*/

WordpressAdaptor._setTiddlerFromMembers = function(members)
{
//#console.log('_setTiddlerFromMembers',members);
	var tiddler = new Tiddler();
	//#console.log('members',members);
	for(var j=0;j<members.length;j++) {
		var member = members[j];
		if(member.nodeType==1) {
			var n = member.firstChild.firstChild.nodeValue;
			var v = member.lastChild.textContent;
			//#console.log(n+':'+v);
			switch(n) {
			case 'title':
				tiddler.title = v;
				break;
			case 'description':
				tiddler.text = v;
				break;
			case 'wp_author_display_name':
				tiddler.modifier =v;
				break;
			case 'dateCreated':
				tiddler.modified = WordpressAdaptor.dateFromTimestamp(v);
				break;
			case 'mt_keywords':
				if(v)
					tiddler.tags = v.readBracketedList();
				break;
			case 'postid':
				tiddler.fields['server.page.id'] = v;
				break;
			case 'wp_author_id':
				tiddler.fields['server.modifier.id'] = v;
				break;
			}
		}
	}
	return tiddler;
};

WordpressAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log("getTiddlerListCallback:"+status);
//#console.log(xhr);
	function gev(p,i,n) {
		try {
			return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
		} catch(ex) {
		}
		return null;
	}
	context.status = false;
	context.statusText = WordpressAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			var list = [];
			if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
				window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			var x = xhr.responseXML;
			var posts = x.getElementsByTagName('struct');
			for(var i=0;i<posts.length;i++) {
				var members = posts[i].childNodes;
				var tiddler = WordpressAdaptor._setTiddlerFromMembers(members);
				tiddler.fields['server.type'] = WordpressAdaptor.serverType;
				tiddler.fields['server.host'] = WordpressAdaptor.minHostName(context.host);
				if(tiddler.title)
					list.push(tiddler);
			}
			context.tiddlers = list;
			context.adaptor.tiddlers = list;
			context.status = true;
		} catch(ex) {
			context.statusText = exceptionText(ex,WordpressAdaptor.serverParsingErrorMessage);
		}
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WordpressAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uriTemplate = '%0/%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

WordpressAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#console.log('getTiddler');
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	if(context.adaptor.tiddlers && !context.revision) {
		var i = context.adaptor.tiddlers.findByField('title',title);
		if(i!==null) {
			context.tiddler = context.adaptor.tiddlers[i];
			context.tiddler.fields = context.adaptor.tiddlers[i].fields;
			context.status = true;
			window.setTimeout(function() {callback(context,userParams);},0);
			return true;
		}
	}
	var tiddler = store.getTiddler(title);
// !!TODO set the uriTemplate
	var uriTemplate = '%0/xmlrpc.php';
	var uri = uriTemplate.format([context.host]);
//#displayMessage('uri: '+uri);

	//metaWeblog.getPost (postid, username, password) returns struct
	var fn = 'metaWeblog.getPost';
	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '<param><value><string>%2</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([tiddler.fields['server.page.id'],context.username,context.password]);
	var payload = WordpressAdaptor.fnTemplate.format([fn,fnParams]);

	var req = httpReq('POST',uri,WordpressAdaptor.getTiddlerCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

WordpressAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log("getTiddlerCallback:"+status);
//#console.log(xhr);
	context.status = false;
	context.statusText = WordpressAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
			if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
				window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			//var x = xhr.responseXML.getElementsByTagName('member')[0];
			//var members = x.parentNode;
			var members = xhr.responseXML.getElementsByTagName('struct')[0].childNodes;
			context.tiddler = WordpressAdaptor._setTiddlerFromMembers(members);
			context.tiddler.fields['server.type'] = WordpressAdaptor.serverType;
			context.tiddler.fields['server.host'] = WordpressAdaptor.minHostName(context.host);
			context.statustext = "";
			context.status = true;
		} catch(ex) {
			context.statusText = exceptionText(ex,WordpressAdaptor.serverParsingErrorMessage);
		}
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WordpressAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	context.tiddler = tiddler;
	var uriTemplate = '%0/xmlrpc.php';
	var uri = uriTemplate.format([context.host]);
	var id = tiddler.fields['server.page.id'];

	// metaWeblog.newPost (blogid, username, password, struct, publish) returns string
	// metaWeblog.editPost (postid, username, password, struct, publish) returns true
	var fn = id ? 'metaWeblog.editPost' : 'metaWeblog.newPost';
	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '<param><value><string>%2</string></value></param>';
	fnParamsTemplate += '<param><struct>';
	fnParamsTemplate += '<member><name>description</name><value>%3</value></member>';
	fnParamsTemplate += '<member><name>title</name><value>%4</value></member>';
	fnParamsTemplate += '</struct></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([id,context.username,context.password,tiddler.text,tiddler.title]);
	var payload = WordpressAdaptor.fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	var req = httpReq('POST',uri,WordpressAdaptor.putTiddlerCallback,context,{"Content-Length":payload.length},payload);
	return typeof req == 'string' ? req : true;
};

WordpressAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('putTiddlerCallback:'+status);
//#console.log(xhr);
//#console.log(responseText);
	if(status) {
		context.status = true;
		if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
			window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		var id = xhr.responseXML.getElementsByTagName('string')[0];
		if(id)
			context.tiddler.fields['server.page.id'] = id.textContent;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

config.adaptors[WordpressAdaptor.serverType] = WordpressAdaptor;
} //# end of 'install only once'
//}}}

/*
<?xml version="1.0"?> <methodResponse> <params> <param> <value> <struct> <member><name>dateCreated</name><value><dateTime.iso8601>20080911T06:32:30</dateTime.iso8601></value></member> <member><name>userid</name><value><string>1887353</string></value></member> <member><name>postid</name><value><string>6</string></value></member> <member><name>description</name><value><string>test content</string></value></member> <member><name>title</name><value><string>test</string></value></member> <member><name>link</name><value><string>http://martinbudden.wordpress.com/?p=6</string></value></member> <member><name>permaLink</name><value><string>http://martinbudden.wordpress.com/?p=6</string></value></member> <member><name>categories</name><value><array><data> <value><string>Uncategorized</string></value> </data></array></value></member> <member><name>mt_excerpt</name><value><string></string></value></member> <member><name>mt_text_more</name><value><string></string></value></member> <member><name>mt_allow_comments</name><value><int>1</int></value></member> <member><name>mt_allow_pings</name><value><int>1</int></value></member> <member><name>mt_keywords</name><value><string></string></value></member> <member><name>wp_slug</name><value><string></string></value></member> <member><name>wp_password</name><value><string></string></value></member> <member><name>wp_author_id</name><value><string>1887353</string></value></member> <member><name>wp_author_display_name</name><value><string>martinbudden</string></value></member> <member><name>date_created_gmt</name><value><dateTime.iso8601>20080911T06:32:30</dateTime.iso8601></value></member> <member><name>post_status</name><value><string>draft</string></value></member> <member><name>custom_fields</name><value><array><data> <value><struct> <member><name>id</name><value><string>6</string></value></member> <member><name>key</name><value><string>_edit_last</string></value></member> <member><name>value</name><value><string>1887353</string></value></member> </struct></value> <value><struct> <member><name>id</name><value><string>5</string></value></member> <member><name>key</name><value><string>_edit_lock</string></value></member> <member><name>value</name><value><string>1221116740</string></value></member> </struct></value> </data></array></value></member> </struct> </value> </param> </params> </methodResponse>
*/