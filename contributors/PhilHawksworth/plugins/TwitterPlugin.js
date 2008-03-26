/***
|''Name:''|TwitterPlugin|
|''Description:''|Add some simple Twitter functionality to a Tiddlywiki|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/MicroblogPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Jan 23, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

{{{
	
	Usgage:
	
	<<Twitter action:listener count:10>>

	<<Twitter action:postbox>>
	
}}}


***/

//{{{
if(!version.extensions.TwitterPlugin) {
version.extensions.TwitterPlugin = {installed:true};
	
	var log = config.macros.Console.log;
	var listener = null;
	config.options.txtTwitterPollPeriod = 5;
	
	config.macros.Twitter = {};
	config.macros.Twitter.poll = false;
	
	config.macros.Twitter.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		
		//parse the paramters.
		var params = paramString.parseParams(null,null,true,false,false);
		var action = params[0].action[0];
		var count = params[0].count ? params[0].count[0] : false;
				
		switch(action) {
			case 'listen':
				config.macros.Twitter.poll = true;
				this.listen(place, count);
				break; 
			case 'postbox':
			   	this.signin(place, platform);
				break;
			default:
				log('ERROR. '+ action + ' is not a valid parameter for the Twitter plugin.');
				break;
		}
	};
	
	
	config.macros.Twitter.listen = function(place, count) {
		if(!listener)
			listener = new TwitterListener();
		listener.uri = "A URI";
		listener.doListen();
		
	};
	
	
	function TwitterListener() {
		
		log("creating listener");
	
		this.timer = null;
		this.uri = null;
		return this;
	};
	
	
	TwitterListener.prototype.doListen = function() {
		log("get tweets from " + listener.uri);
		
		
		var adaptor = new TwitterAdapter();
		var context = {listener:this, host:uri, adaptor:adaptor };
		var ret = adaptor.getTiddlerList(context,null,TwitterListener.makeTweetTiddlers);
		
		log("makeTweetTiddlers:"+ ret);
		
		return ret;
	
		listener.timer = window.setTimeout(function() {listener.doListen();}, listener.getInterval());
	};

	
	TwitterListener.prototype.makeTweetTiddlers = function(context,userParams)	{
		
		log("getNotesTiddlerListCallback:"+context.status);
		
		var tiddlers = context.tiddlers;
		var length = tiddlers ? tiddlers.length : 0;
		var me = context.synchronizer;
		store.suspendNotifications();
		for(var i=0; i<length; i++) {
			tiddler = tiddlers[i];
			var t = store.fetchTiddler(tiddler.title);
			//# if the notes tiddler doesn't exist, or it is written by someone else, then get it
			if(!t || tiddler.modifier!=config.options.txtUserName) {
				if(tiddler.modifier!=config.options.txtUserName) {
					tiddler.tags.pushUnique(me.discoveredNoteTag);
					tiddler.tags.remove(me.myNoteTag);
					tiddler.tags.remove(me.sharedTag);
				}
				store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			}
		}
		store.resumeNotifications();
		refreshDisplay();
		me.sessionDownload.requestPending = false;
		me.makeRequest.call(me);
	};
	
	
	TwitterListener.prototype.getInterval = function() {
		var t = config.options.txtTwitterPollPeriod ? parseInt(config.options.txtTwitterPollPeriod)*1000 : 60000;
		if(isNaN(t))
			t = 60000;
		return t;
	};
	
	

	

	
	
	
	
	// 
	// 
	// //microblogengine
	// function MicroblogEngine(platform, loginURI, logoutURI, listenURI, postURI) {
	// 	this.platform = platform;
	// 	this.LoginURI = loginURI ? loginURI : null;
	// 	this.LogoutURI = logoutURI ? logoutURI : null;
	// 	this.ListenURI = listenURI ? listenURI : null;
	// 	this.PostURI = postURI ? postURI : null;
	// 	this.authenticated = false;
	// 	this.period = config.options.txtMicroblogDefaultPollPeriod;
	// 	this.timer = null;
	// 	this.poll = false;
	// 	
	// 	return this;
	// };
	// 
	// 
	// // gather the config data from the config tiddler for use when required.
	// config.macros.Microblog.constructMicroblog = function(platform, settingsTiddler){
	// 	
	// 	//Get the existing micorblog object for this platform or create a new one.
	// 	if(microblogs[platform])
	// 		var mb = microblogs[platform];
	// 	else {
	// 		var mb = new MicroblogEngine(platform);
	// 		log("Creates a new MB object for " + platform);
	// 	}
	// 		
	// 	//Gather the data from the tiddler.
	// 	var slices = store.calcAllSlices(settingsTiddler);
	// 	for(var s in slices) {
	// 	 	mb[s] = store.getTiddlerSlice(settingsTiddler, s);
	// 	}
	// 	microblogs[platform] = mb;
	// 		
	// 	/*
	// 		TODO Remove debug logging.
	// 	*/
	// 	log("-----------------");
	// 	var m = microblogs[platform];	
	// 	for (var t in m) {
	// 		log(t +" : "+ m[t]);
	// 	};
	// };
	// 
	// 
	// config.macros.Microblog.listen = function(place, platform, count, output) {
	// 
	// 	/*
	// 		TODO Remove debug logging.
	// 	*/
	// 	log("Listen for " + platform);
	// 
	// 	var uri = microblogs[platform].ListenURI;	
	// 	var context = {
	// 		host:uri,
	// 		place:place, 
	// 		platform:platform, 
	// 		count:count,
	// 		output:output
	// 		};
	// 				
	// 	log("Getting updates from " + platform);
	// 	doHttp("GET",uri,null,null,null,null,config.macros.Microblog.listenHandler,context);
	// };
	// 
	// 
	// //parse incoming feed
	// config.macros.Microblog.listenHandler = function(status,params,responseText,url,xhr){
	// 
	// 	if(!status) {
	// 		log("We couldn't get a response from " + params.platform + ". Please check your settings and ensure that all is well with " + params.platform);
	// 		return;
	// 	}
	// 
	// 	log("parsing updates from " + params.platform);
	// 	log("the oputput will be " + params.output);
	// 
	// 	var rootURI = microblogs[params.platform].RootURI;
	//  
	// 	/*
	// 		TODO Replace this nasty JSON eval. Create a smart TW JSON parsing helper.
	// 	*/
	// 	var updates = eval(responseText);		
	// 	var count = params.count ? params.count : updates.length;
	// 	if (count == 'all') 
	// 		count = updates.length;
	// 
	// 
	// 	var msg, m, a, i;
	// 	var container =	document.getElementById('twitter_updates');
	// 	if(!container)
	// 		container =	createTiddlyElement(params.place,"div","twitter_updates",null,null);
	// 	removeChildren(container);
	// 	
	// 	for(var u=0; u<count; u++) {
	// 		msg = updates[u];
	// 	
	// 		/*
	// 			TODO remove debug logging
	// 		*/
	// 		log(msg);
	// 
	// 
	// 		/*
	// 			TODO abstract the of update to allow for different platforms
	// 		*/ 
	// 		switch(params.output) {
	// 			case 'inline':
	// 			
	// 				m =	createTiddlyElement(container,"div",null,"microblog_update",null);
	// 				a =	createTiddlyElement(m,"a",null,null,null);
	// 				a.href = rootURI + "/" + msg.user.screen_name + "/statuses/" + msg.id;
	// 				i =	createTiddlyElement(a,"img",null,null,null);
	// 				i.src = msg.user.profile_image_url;
	// 				createTiddlyElement(m,"span",null,'user',msg.user.name);		
	// 				createTiddlyElement(m,"span",null,'date',msg.created_at);		
	// 				createTiddlyElement(m,"span",null,'text',msg.text.htmlDecode());
	// 
	// 				break;    
	// 			case 'tiddlers':
	// 			
	// 				break;
	// 			default:
	// 				log('Somebody needs to tell me what to do with these updates!');
	// 				break;
	// 		}
	// 	}
	// 	
	// 	if(microblogs[params.platform].poll) {
	// 		microblogs[params.platform].timer = window.setTimeout(function() {config.macros.Microblog.listen(params.place, params.platform, params.count, params.output);}, microblogs[params.platform].period);	
	// 	}		
	// };
	// 
	// 
	// config.macros.Microblog.killListener = function(platform) {
	// 	
	// 	microblogs[platform].timer = null;
	// 
	// 	/*
	// 		TODO Remove debug logging.
	// 	*/
	// 	log("Kill Listen for " + platform);
	// 	log("...listen: " + microblogs[platform].timer);	
	// };
	// 
	// 
	// 
	// 
	// http://api.pownce.com/1.0/public_note_lists/{rel}/{username}.{format}
	// 
	// config.macros.Microblog.getInterval = function() {
	// 	var t = config.options.txtMicroblogPollPeriod ? parseInt(config.options.txtMicroblogPollPeriod)*1000 : 60000;
	// 	if(isNaN(t))
	// 		t = 60000;
	// 	return t;
	// };

	//signin
	
	//signout
	
	//makePostForm


	
	
	
	
	
	
	
	
	



	// 
	// //create signin UI.
	// config.macros.Microblog.signin = function(place, platform){
	// 
	// 	// The user details to gather.
	// 	var userDetails = [];
	// 	userDetails.push(['username','Username']);
	// 	userDetails.push(['password','Password']);		
	// 	
	// 	//Build the UI for the conifg
	// 	var f = createTiddlyElement(place,"form","user_form_"+platform);
	// 	createTiddlyElement(f,"span",null,null,"Signin for " + platform + " microblog.");
	// 	for(var d=0; d<userDetails.length; d++){
	// 		createTiddlyElement(f,"span",null,null,userDetails[d][1]);
	// 		if(userDetails[d][0] == "password") {
	// 			var input = createTiddlyElement(f,'input',null,null,null,{'type':'password'});
	// 		}
	// 		else {
	// 			var input = createTiddlyElement(f,"input",null);
	// 		}
	// 		input.setAttribute('name',userDetails[d][0]);
	// 	}
	// 	var btn = createTiddlyButton(f,"Start using " + platform,"Store these settings and start using the microblog",config.macros.Microblog.signinClick);
	// 	btn.setAttribute("platform",platform);
	// 	//var loggedin = createTiddlyElement(place,"span",'microblog_loggedin_' + platform,'hidden',"Logged in to " + platform);
	// 	//var logoutbtn = createTiddlyButton(loggedin,"Signout of " + platform,"Signout of " + platform,config.macros.Microblog.logout);
	// 	//logoutbtn.setAttribute("platform",platform);
	// };
	// 
	// 
	// // Record the config data for a new Microblog and initialise.
	// config.macros.Microblog.signinClick = function(ev){
	// 	
	// 	var e = ev ? ev : window.event;
	// 	var platform = this.getAttribute("platform");
	// 	var mb = config.macros.Microblog.microblogs[platform];
	// 	
	// 	//record the details.
	// 	var form = this.parentNode;
	// 	var inputs = form.getElementsByTagName('input');
	// 	var f;
	// 	for (var i=0; i < inputs.length; i++) {
	// 		f = inputs[i];
	// 		mb[f.name] = f.value;
	// 	};
	// 	config.macros.Microblog.auth(platform);	
	// };
	// 
	// 
	// //Attempt to authenticate the user.
	// config.macros.Microblog.auth = function(platform)
	// {
	// 	var uri = config.macros.Microblog.microblogs[platform].LoginURI;
	// 	var usr = config.macros.Microblog.microblogs[platform].username;
	// 	var pwd = config.macros.Microblog.microblogs[platform].password;
	// 	
	// 	log("checking : "+ usr + ":" + pwd + "@" +uri );
	// 	
	// 	if(uri && usr && pwd) {
	// 		//get the update and post it.
	// 		var params = {};
	// 		params.platform = platform;
	// 		doHttp("POST",uri,null,null,usr,pwd,config.macros.Microblog.authCalback,params);	
	// 	}
	// 	else {
	// 		log("Ooops. We don't have all the details we need to post this comment.");
	// 	}
	// };
	// config.macros.Microblog.authCalback = function(status,params,responseText,url,xhr){
	// 	
	// 	/*
	// 		TODO remove logging.
	// 	*/
	// 	log(status);
	// 	log(xhr);
	// 	
	// 	if(xhr.status == 200){
	// 		config.macros.Microblog.microblogs[params.platform].authenticated = true;
	// 		var p = document.getElementById('user_form_'+params.platform);
	// 		p.style.display = "block";
	// 		
	// 		config.macros.Microblog.postform();
	// 		
	// 		/*
	// 			TODO Decide what feedback mechanisim is best to signify a successful login.
	// 		*/
	// 		// var uri = config.macros.Microblog.microblogs[params.platform].ListenURI;
	// 		// log("logged in, so going to read " + uri);
	// 		// config.macros.Microblog.listen(params.platform);
	// 	}
	// };
	// 
	// 
	// //Attempt to authenticate the user.
	// config.macros.Microblog.logout = function(ev)
	// {
	// 	var e = ev ? ev : window.event;
	// 	var platform = this.getAttribute("platform");	
	// 	var uri = config.macros.Microblog.microblogs[platform].LogoutURI;
	// 	
	// 	if(uri) {
	// 		var params = {};
	// 		params.platform = platform;
	// 		doHttp("POST",uri,null,null,null,null,config.macros.Microblog.logoutCalback,params);	
	// 	}
	// 	else {
	// 		log("Ooops. We don't have the details we need logout from " + platform);
	// 	}
	// };
	// config.macros.Microblog.logoutCalback = function(status,params,responseText,url,xhr){
	// 	
	// 	/*
	// 		TODO remove debug logging.
	// 	*/
	// 	log(status);
	// 	log(xhr);
	// 	
	// 	log("logged out of " + params.platform);
	// 	var p = document.getElementById('microblog_loggedin_'+params.platform);
	// 	p.style.display = "none";
	// };
	// 
	// 
	// 
	// //create listener.
	// config.macros.Microblog.listen = function(place, platform, count, avatars, makeTiddlers)
	// {
	// 	var uri = config.macros.Microblog.microblogs[platform].ListenURI;	
	// 	var context = {
	// 			host:uri, 
	// 			place:place, 
	// 			platform:platform, 
	// 			count:count,
	// 			avatars:avatars,
	// 			makeTiddlers:makeTiddlers
	// 			};
	// 			
	// 	log("Getting updates from " + platform);
	// 	doHttp("GET",uri,null,null,null,null,config.macros.Microblog.listenHandler,context);
	// };
	// 
	// //parse incoming feed
	// config.macros.Microblog.listenHandler = function(status,params,responseText,url,xhr){
	// 	
	// 	if(!status) {
	// 		log("We couldn't get a response from " + params.platform + ". Please check your settings and ensure that all is well with " + params.platform);
	// 		return;
	// 	}
	// 	
	// 	log("parsing updates from " + params.platform);
	// 	
	// 	var rootURI = config.macros.Microblog.microblogs[params.platform].RootURI;
	// 	 
	// 	/*
	// 		TODO Replace this nasty JSON eval. Create a smart TW JSON parsing helper.
	// 	*/
	// 	var updates = eval(responseText);
	// 	var count = params.count ? params.count : updates.length;
	// 	if (count == 'all') 
	// 		count = updates.length;
	// 
	// 	/*
	// 		TODO abstract the of update to allow for different platforms
	// 	*/ 
	// 	var msg, m, a, i;
	// 	for(var u=0; u<count; u++) {
	// 		msg = updates[u];
	// 		
	// 		/*
	// 			TODO remove debug logging
	// 		*/
	// 		log(msg);
	// 		
	// 		
	// 		/*
	// 			TODO move this test to be somewhere more efficient?
	// 		*/
	// 		if(params.makeTiddlers) {
	// 			log("Make tiddlers");
	// 			var t = new Tiddler();
	// 			t.text = msg.text.htmlDecode();				
	// 			log(t);
	// 			
	// 
	// 		}
	// 		else {
	// 			m =	createTiddlyElement(params.place,"div",null,"microblog_update",null);
	// 			if(params.avatars){
	// 				a =	createTiddlyElement(m,"a",null,null,null);
	// 				a.href = rootURI + "/" + msg.user.screen_name + "/statuses/" + msg.id;
	// 				i =	createTiddlyElement(a,"img",null,null,null);
	// 				i.src = msg.user.profile_image_url;
	// 			}
	// 			createTiddlyElement(m,"span",null,'user',msg.user.name);		
	// 			createTiddlyElement(m,"span",null,'date',msg.created_at);		
	// 			createTiddlyElement(m,"span",null,'text',msg.text.htmlDecode());	
	// 		}
	// 		
	// 
	// 	}
	// };
	// 
	// 
	// //create input UI.
	// config.macros.Microblog.postform = function(place,platform){
	// 	
	// 	//display the signin form if user not authenticated.
	// 	if(!config.macros.Microblog.microblogs[platform].authenticated) {
	// 		log('authentication needed for ' + platform);
	// 		config.macros.Microblog.signin(place, platform);
	// 	}
	// 	else {
	// 		var f = createTiddlyElement(place,"form");
	// 		createTiddlyElement(f,"span",null,null,"post an update");
	// 		var input = createTiddlyElement(f,"input",null);
	// 		input.setAttribute('name','update');
	// 		var btn = createTiddlyButton(f,"Update " + platform,"post an update to" + platform,config.macros.Microblog.postUpdate);
	// 		btn.setAttribute("platform",platform);
	// 	}
	// };
	// 
	// //Post an upate to the microblog platform.
	// config.macros.Microblog.postUpdate = function(ev){
	// 	var e = ev ? ev : window.event;
	// 	var platform = this.getAttribute("platform");
	// 	var uri = config.macros.Microblog.microblogs[platform].PostURI;
	// 	var usr = config.macros.Microblog.microblogs[platform].username;
	// 	var pwd = config.macros.Microblog.microblogs[platform].password;
	// 	
	// 	if(uri && usr && pwd) {
	// 		//get the update and post it.
	// 		var form = this.parentNode;
	// 		var update = "status=" + form['update'].value;
	// 		
	// 		/*
	// 			TODO Remove debug logging.
	// 		*/
	// 		log("Posting to: "+ usr + ":" + pwd + "@" +uri + " ...(" + update + ")");
	// 		
	// 		var params = {};
	// 		params.platform = platform;
	// 		doHttp("POST",uri,update,null,null,null,config.macros.Microblog.postUpdateCalback,params);	
	// 	}
	// 	else {
	// 		log("Ooops. We don't have all the details we need to post this comment.");
	// 	}
	// 
	// };
	// config.macros.Microblog.postUpdateCalback = function(status,params,responseText,url,xhr){
	// 	
	// 	if(!status)
	// 		log('There was a problem posting your update to ' + params.platform);
	// 	/*
	// 		TODO refresh any listings that would show this update.
	// 	*/
	// 	
	// 	/*
	// 		TODO reset the update form after posting.
	// 	*/
	// };

} //# end of 'install only once'
//}}}