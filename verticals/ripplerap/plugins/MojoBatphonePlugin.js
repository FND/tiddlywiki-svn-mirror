/***
|''Name:''|MojoBatphonePlugin|
|''Description:''|MojoBatphonePlugin test harness|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/MojoBatphonePlugin.js |
|''Version:''|0.0.1|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.MojoBatphonePlugin) {
version.extensions.MojoBatphonePlugin = {installed:true};

config.macros.mojoBatphone = {

	debug: false,
	offline: false,
	//proxy: 'http://ripplerap.com/mojoBatphone',
	proxy: 'http://psd.local/src/tiddlywiki.org/Trunk/verticals/ripplerap/server/mojoBatphone.php',

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
	        var button = createTiddlyButton(place,'RING!','Click here to ring the Bat Phone!',this.ring);
	},

	ring: function () {

	        var macro = config.macros.mojoBatphone;
	        var username = config.options.txtUserName;
	        var telno = config.options.txtMojoTelno;
	
		var body = encodeURIComponent('username') + '=' + username
				+ '&' + encodeURIComponent('telno') + '=' + encodeURIComponent(telno); 
				 
		if(macro.debug)
			displayMessage('call info:' + body );

		var callback = function(status,params,responseText,url,xhr) {
			displayMessage(status?'call made':'call failed');
			if(macro.debug)
				displayMessage(responseText);
		};

		if(!macro.offline) {
			var req = doHttp('POST', macro.proxy, body, null, null,null, callback);
			if(macro.debug)
				displayMessage(req);
		}
	}
}

} //# end of 'install only once'
//}}}
