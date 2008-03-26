/***
|''Name:''|TwitterHelperPlugin|
|''Description:''|Synchronizes TiddlyWikis with RSS feeds|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/TwitterHelperPlugin.js |
|''Version:''|0.0.16|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

!!Description

This plugin uses the RSSAdaptor and WebDavLib to periodically:
# download tiddlers from the specified download feed
# upload user notes to the speficied upload feed

The feeds are standard TiddlyWiki feeds (that is tiddlers tagged "systemServer) that are additionally tagged with "ripplerap"
and either "notes" "upload" or "updates". "notes" specifies the root uri of where from which other are downloaded. "upload" speficies
the uri where the user's notes are uploaded. "updates" specifies the uri of the conference agenda, this feed is used to make any
last minute changes to the conference agenda.

!!Usage

Set up the "note", "upload" and "updates" feeds.

Requires the RSS Adaptor: http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/adaptors/RSSAdaptor.js
Requires WebDavLib: http://svn.tiddlywiki.org/Trunk/contributors/SaqImtiaz/plugins/WebDavLib.js

If required, set config.options.txtRippleRapInterval (in seconds). Default is 60 seconds.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TwitterPlugin) {
version.extensions.TwitterPlugin = {installed:true};

if(!config.options.txtTwitterPollPeriod)
	{config.options.txtTwitterPollPeriod = 60;}

config.optionsDesc.txtRippleRapInterval = "~RippleRap synchronization interval (in seconds)";


config.macros.Twitter = {};
config.macros.Twitter.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	//parse the paramters.
	var params = paramString.parseParams(null,null,true,false,false);
	var action = params[0].action[0];
	var count = params[0].count ? params[0].count[0] : false;
	var template = params[0].template ? params[0].template[0] : false;
	
	twitterer = new TwitterHelper();
	twitterer.init();		
					
	
	switch(action) {
		case 'listen':
			config.macros.Twitter.poll = true;
			twitterer.makeRequest();
			//this.listen(place, count);
			break; 
		case 'postbox':
		   	break;
		case 'loginform':
		   	twitterer.loginform(place);
			break;
		case 'signout':
		   	//this.signin(place, platform);
			break;
		default:
			log('ERROR. '+ action + ' is not a valid parameter for the Twitter plugin.');
			break;
	}
};

	
function TwitterHelper() 
{
	this.LoginURI = null;
	this.LogoutURI = null;
	this.ListenURI = null;
	this.PostURI = null;
	
	this.updateTag = null; 
	this.username = null;
	this.password = null;
	this.authenticated = false;
	
	return this;
};

TwitterHelper.userNameNotSet = "You have not set your username";

// logging function, for debug
TwitterHelper.log = function(x)
{
	if(window.console)
		console.log(x);
	else
		displayMessage(x);
};

TwitterHelper.prototype.init = function()
{
	
	TwitterHelper.log("Sync initialising");
		
	this.LoginURI = store.getTiddlerSlice("TwitterConfig",'LoginURI');
	this.LogoutURI = store.getTiddlerSlice("TwitterConfig",'LogoutURI');
	this.ListenURI = store.getTiddlerSlice("TwitterConfig",'ListenURI');
	this.PostURI = store.getTiddlerSlice("TwitterConfig",'PostURI');
	
	this.updateTag = config.options.txtTwitterUpdateTag;
	this.username = config.options.txtTwitterUsername;
	this.password = config.options.txtTwitterPassword;

};

TwitterHelper.prototype.getInterval = function()
{
	var t = config.options.txtTwitterPollPeriod ? parseInt(config.options.txtTwitterPollPeriod)*1000 : 60000;
	if(isNaN(t))
		t = 60000;
	return t;
};


TwitterHelper.prototype.makeRequest = function()
{
	if(!config.options.chkTwitterListen)
		return;
	var me  = this;
	me.getData(me.ListenURI);
};


TwitterHelper.prototype.getData = function(uri)
{
	var adaptor = new TwitterAdaptor();
	var context = {listener:this, host:uri,adaptor:adaptor, rssUseRawDescription:true};
	
	TwitterHelper.log("userdetails: u:"+this.username +" p:"+ this.password);
	
	var ret = adaptor.getTiddlerList(context,null,TwitterHelper.createTiddlersFromData,null,this.username,this.password);

	TwitterHelper.log("getTiddlerList:"+ret);
	
	return ret;
};


TwitterHelper.createTiddlersFromData = function(context,userParams)
{
	TwitterHelper.log("getNotesTiddlerListCallback:"+context.status);


	var tiddlers = context.tiddlers;
	var length = tiddlers ? tiddlers.length : 0;
	var me = context.listener;
	store.suspendNotifications();
	
	for(var i=0; i<length; i++) {
		tiddler = tiddlers[i];
		var t = store.fetchTiddler(tiddler.title);
		//# if the notes tiddler doesn't exist, or it is written by someone else, then get it
		if(!t || tiddler.modifier!=config.options.txtUserName) {
			// if(tiddler.modifier!=config.options.txtUserName) {
				tiddler.tags.pushUnique(me.updateTag);
				// tiddler.tags.remove(me.myNoteTag);
				// tiddler.tags.remove(me.sharedTag);
			// }
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		}
	}
	store.resumeNotifications();
	refreshDisplay();

	TwitterHelper.log("getting more in :"+ me.getInterval());

	window.setTimeout(function() {	me.makeRequest.call(me); },me.getInterval());
};

//Attempt to authenticate the user.
TwitterHelper.prototype.loginform = function(place)
{
	var me = this;
	
	// The user details to gather.
	var userDetails = [];
	userDetails.push(['username','Username']);
	userDetails.push(['password','Password']);		
	
	//Build the UI for the conifg
	var f = createTiddlyElement(place,"form","Twitter_login_form");
	f.setAttribute("name","Twitter_login_form");
	createTiddlyElement(f,"span",null,null,"Signin to Twitter ");
	for(var d=0; d<userDetails.length; d++){
		createTiddlyElement(f,"span",null,null,userDetails[d][1]);
		if(userDetails[d][0] == "password") {
			var input = createTiddlyElement(f,'input',null,null,null,{'type':'password'});
		}
		else {
			var input = createTiddlyElement(f,"input",null);
		}
		input.setAttribute('name',userDetails[d][0]);
		input.setAttribute('id',userDetails[d][0]);
		
	}

	var btn = createTiddlyButton(f,"Login to Twitter","Login to Twitter",this.doLogin);
	btn.setAttribute("form",f);
	btn.setAttribute("uri",me.LoginURI);
	
};



//Attempt to authenticate the user.
TwitterHelper.prototype.doLogin = function(ev)
{
	/*
		TODO Get the form data in a more elegant way.
	*/
	var uri = this.LoginURI;
	var usr = document.Twitter_login_form.username.value;
	var pwd = document.Twitter_login_form.password.value;
	
	TwitterHelper.log("checking : "+ usr + ":" + pwd + "@" +uri );
	
	// if(uri && usr && pwd) {
	// 	//get the update and post it.
	// 	var params = {};
	// 	params.listener = this;
	// 	params.place = place;
	// 	doHttp("POST",uri,null,null,usr,pwd,TwitterHelper.loginCalback,params);	
	// }
	// else {
	// 	log("Ooops. We don't have all the details we need to post this comment.");
	// }
};
TwitterHelper.prototype.loginCalback = function(status,params,responseText,url,xhr){
	
	/*
		TODO remove logging.
	*/
	TwitterHelper.log(status);
	TwitterHelper.log(xhr);
	
	if(xhr.status == 200){
		
		var me = params.listener;
		me.authenticated = true;
		
		TwitterHelper.log("signed in? " + me.authenticated);
		
		/*
			TODO Decide what feedback mechanisim is best to signify a successful login.
		*/
		// var uri = config.macros.Microblog.microblogs[params.platform].ListenURI;
		// log("logged in, so going to read " + uri);
		// config.macros.Microblog.listen(params.platform);
	}
};


	
} //# end of 'install only once'
//}}}
