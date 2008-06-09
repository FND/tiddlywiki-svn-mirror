/***
|''Name:''|ConfabbLoginPlugin|
|''Description:''||
|''Author:''|Paul Downey|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/adaptors/ConfabbLoginPlugin.js|
|''Version:''|0.0.1|
|''Date:''|May 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.4.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ConfabbLoginPlugin) {
version.extensions.ConfabbLoginPlugin = {installed:true};


/*
 *  button to login to Confabb
 */
config.macros.ConfabbLogin = {

	callback: null,

	login: function(){
		var callback = function(status,params,text,url,xhr){
			var me = config.macros.ConfabbLogin;
			if(status){
				displayMessage('logged in' + status);
			} else {
				displayMessage('not logged in' + status);
			}
			config.macros.RippleRap.getAgenda();
			if (me.callback){
				me.callback();
			}
		};
		var username = config.options.txtSharedNotesUserName;
		var password = config.options.pasSharedNotesPassword;

		var url = "http://staging.confabb.com/login";
		data = "login=" + username + "&password=" + password + "&commit=Log+In";
		doHttp('POST',url,data,'application/x-www-form-urlencoded',null,null,callback,null,{},true)
		return false;
	},

	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var me = config.macros.ConfabbLogin;
                var button = createTiddlyButton(place,'Login to Confabb','Click here to login to Confabb',me.login);
	}
};

} //# end of 'install only once'
//}}}
