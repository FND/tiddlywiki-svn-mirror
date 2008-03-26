/***
|''Name:''|SimpleMojoPlugin|
|''Description:''|Click to call/SMS Telnos using BT Mojo|
|''Version:''|1.0.0|
|''Date:''|Nov 21, 2007|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SimpleMojoPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

uses browser session cookie, so you need to sign-in to  http://mojo.bt.com
from another tab/window

***/

//{{{
// Ensure that the SimpleMojoPlugin Plugin is only installed once.
if(!version.extensions.SimpleMojoPlugin) {
version.extensions.SimpleMojoPlugin = {installed:true};

merge(config.optionsDesc,{'txtMojoUserName':'Mojo Username'});

config.macros.mojo = {

	debug: false,
	offline: false,

	makeCall: function (caller, callee) {

	        var macro = config.macros.mojo;
	
	        var user = config.options.txtMojoUserName;
	
		    var body = encodeURIComponent('call[username]') + '=' + user 
				+ '&' + encodeURIComponent('call[gadgetkey]') + '=' + '1234567891' 
				+ '&' + encodeURIComponent('call[caller]') + '=' + encodeURIComponent(caller)
				+ '&' + encodeURIComponent('call[callee]') + '=' + encodeURIComponent(callee); 
				 
		if(macro.debug)
			displayMessage('call info:' + body );

		var callback = function(status,params,responseText,url,xhr) {
			displayMessage(status?'call made':'call failed');
			if(config.macros.mojo.debug)
				displayMessage(responseText);
		};

		if(!macro.offline) {
			var req = doHttp('POST', 'http://mojo.bt.com/calls', body, null, null,null, callback);
			if(macro.debug)
				displayMessage(req);
		}
	},
	
	
	sendSMS: function (recipient, text) {

	        var macro = config.macros.mojo;
	
	        var user = config.options.txtMojoUserName;
	
		    var body = encodeURIComponent('message[username]') + '=' + user 
				+ '&' + encodeURIComponent('message[gadgetkey]') + '=' + '1234567891' 
				+ '&' + encodeURIComponent('message[recipient]') + '=' + encodeURIComponent(recipient)
				+ '&' + encodeURIComponent('message[text]') + '=' + encodeURIComponent(text); 
				 
		if(macro.debug)
			displayMessage('message info:' + body );

		var callback = function(status,params,responseText,url,xhr) {
			displayMessage(status?'message sent':'message failed');
			if(config.macros.mojo.debug)
				displayMessage(responseText);
		};

		if(!macro.offline) {
			var req = doHttp('POST', 'http://mojo.bt.com/messages', body, null, null,null, callback);
			if(macro.debug)
				displayMessage(req);
		}
	},
	
	getElementByClass:  function (node,className) {
		var re = new RegExp('\\b'+className+'\\b');
		var element = node.getElementsByTagName('*');
		for(var i = 0; i < element.length; i++) {
			var classes = element[i].className;
			if(re.test(classes)) return element[i];
		}
		return 0;
	},
	
	onClickDial: function (e) {
	        var macro = config.macros.mojo;
	        var caller = macro.telno;
	        var callee = macro.getElementByClass(this.previousSibling,'value').firstChild.data;
	    macro.makeCall(caller, callee);
	}

}

} //# end of "install only once"
//}}}
