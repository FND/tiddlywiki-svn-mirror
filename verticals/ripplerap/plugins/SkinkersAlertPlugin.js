/***
|''Name:''|SkinkersAlertPlugin|
|''Description:''|Send an alert using Skinkers|
|''Version:''|1.0.0|
|''Date:''|Nov 21, 2007|
|''Source:''|http://www.tiddlywiki.com/#SkinkersAlertPlugin|
|''Author:''|PaulDowney (paul.downey (at) whatfettle (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.2|
***/

//{{{
// Ensure that the SkinkersAlertPlugin Plugin is only installed once.
if(!version.extensions.SkinkersAlertPlugin) {
version.extensions.SkinkersAlertPlugin = {installed:true};

config.macros.skinkersAlert = {

	debug: true,
	offline: false,
	
	alert: function (title, text) {

	        var macro = config.macros.skinkersAlert;
	
	        var user = config.options.txtMojoUserName;
	
		    var body = encodeURIComponent('message_title') + '=' + encodeURI(title) 
				+ '&' + encodeURIComponent('message_body') + '=' + encodeURIComponent(text)
				+ '&' + encodeURIComponent('message_link') + '=' + encodeURIComponent('http://lifestream.whatfettle.com/ripplerap');
				 
		if(macro.debug)
			displayMessage('message info:' + body );

		var callback = function(status,params,responseText,url,xhr) {
			displayMessage(status?'message sent':'message failed');
			if(config.macros.skinkersAlert.debug)
				displayMessage(responseText);
		};

		if(!macro.offline) {
			var req = doHttp('POST', 'http://10.29.2.182/rest/Default.aspx', body, null, null,null, callback);
			if(macro.debug)
				displayMessage(req);
		}
	}

}

} //# end of "install only once"
//}}}