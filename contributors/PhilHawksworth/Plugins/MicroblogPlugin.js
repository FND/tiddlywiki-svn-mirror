/***
|''Name:''|MicroblogPlugin|
|''Description:''|Add some simple Microblog functionality to a Tiddlywiki|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/MicroblogPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Jan 23, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


Usage:

Display the login interface:
<identifier> corresponds to the name of the microblogging platfom and requires an associated MicroblogConfig_identifier tiddler
{{{
	<<microblog identifier config>>
}}}


Display the interface to allow posting of an update.
{{{
	<<microblog identifier ui>>	
}}}


Display a stream of updates from the microblogging platform.
	count: INT : the number of updtes to display | 'all' displays all available from the feed.
	avatars: Boolean: display the avatar corresponding to the update.
	makeTiddler: Boolean: create and save a tiddler for each update or simply display the updates (transient).
{{{
	<<microblog identifier listen [count] [avatars] [makeTiddlers]>>	
}}}


***/

//{{{
if(!version.extensions.MicroblogPlugin) {
version.extensions.MicroblogPlugin = {installed:true};
	
	/*
		TODO add polling mechanism
	*/
	/*
		TODO add force refresh mechanisim
	*/
	
	var log = config.macros.Console.log;

	config.macros.Microblog = {};
	config.macros.Microblog.microblogs = [];
	config.macros.Microblog.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		if(params.length < 2) {
			log('Not enough arguments in the call to the Microblog plugin');
			return;
		}
		var platform = params[0]; 
		var action = params[1]; 
		
		//get the settings for this Microblog platform.
		if(!config.macros.Microblog.microblogs[platform])
			this.settings(platform);
		
		switch(action) {
			case 'config':
				this.config(place,platform);
				break;    
			case 'ui':
				this.ui(place,platform);
				break;
			case 'listen':
				var count = params[2] ? params[2] : false;
				var avatars = params[3] =='avatars' ? true : false;
				var makeTiddlers = params[4] =='makeTiddlers' ? true : false;
				this.listen(place, platform, count, avatars, makeTiddlers);
				break;
			default:
				log('ERROR. '+ action+ ' is not a valid parameter for the Microblog plugin.');
				break;
		}
	};
	
	
	// gather the config data from the config tiddler for use when required.
	config.macros.Microblog.settings = function(platform){
		
		//Get the existing data object or create a new one.
		var mb = config.macros.Microblog.microblogs[platform] ? config.macros.Microblog.microblogs[platform] : {};
		
		//Gather the data from the tiddler.
		var configTiddlerTitle = "MicroblogConfig_" + platform;
		var slices = store.calcAllSlices(configTiddlerTitle);
		for(var s in slices) {
			mb[s] = store.getTiddlerSlice(configTiddlerTitle, s);
		}
		
		config.macros.Microblog.microblogs[platform] = mb;	
		
		/*
			TODO Remove debug logging.
		*/
		log("-----------------");
		var m = config.macros.Microblog.microblogs[platform];	
		for (var t in m) {
			log(t +" : "+ m[t]);
		};
		log("-----------------");
	};


	//create config UI.
	config.macros.Microblog.config = function(place, platform){

		// The user details to gather.
		var userDetails = [];
		userDetails.push(['username','Username']);
		userDetails.push(['password','Password']);		
		
		//Build the UI for the conifg
		createTiddlyElement(place,"span",null,null,"Configuration for " + platform + "microblog.");
		var f = createTiddlyElement(place,"form");
		for(var d=0; d<userDetails.length; d++){
			createTiddlyElement(f,"span",null,null,userDetails[d][1]);
			if(userDetails[d][0] == "password") {
				var input = createTiddlyElement(f,'input',null,null,null,{'type':'password'});
			}
			else {
				var input = createTiddlyElement(f,"input",null);
			}
			input.setAttribute('name',userDetails[d][0]);
		}
		var btn = createTiddlyButton(f,"Start using " + platform,"Store these settings and start using the microblog",config.macros.Microblog.configClick);
		btn.setAttribute("platform",platform);
		var loggedin = createTiddlyElement(place,"span",'microblog_loggedin_' + platform,'hidden',"Logged in to " + platform);
		var logoutbtn = createTiddlyButton(loggedin,"Signout of " + platform,"Signout of " + platform,config.macros.Microblog.logout);
		logoutbtn.setAttribute("platform",platform);
	};
	
	
	// Record the config data for a new Microblog and initialise.
	config.macros.Microblog.configClick = function(ev){
		
		var e = ev ? ev : window.event;
		var platform = this.getAttribute("platform");
		var mb = config.macros.Microblog.microblogs[platform];
		
		//record the details.
		var form = this.parentNode;
		var inputs = form.getElementsByTagName('input');
		var f;
		for (var i=0; i < inputs.length; i++) {
			f = inputs[i];
			mb[f.name] = f.value;
		};
		config.macros.Microblog.auth(platform);	
	};


	//Attempt to authenticate the user.
	config.macros.Microblog.auth = function(platform)
	{
		var uri = config.macros.Microblog.microblogs[platform].LoginURI;
		var usr = config.macros.Microblog.microblogs[platform].username;
		var pwd = config.macros.Microblog.microblogs[platform].password;
		
		log("checking : "+ usr + ":" + pwd + "@" +uri );
		
		if(uri && usr && pwd) {
			//get the update and post it.
			var params = {};
			params.platform = platform;
			doHttp("POST",uri,null,null,usr,pwd,config.macros.Microblog.authCalback,params);	
		}
		else {
			log("Ooops. We don't have all the details we need to post this comment.");
		}
	};
	config.macros.Microblog.authCalback = function(status,params,responseText,url,xhr){
		
		/*
			TODO remove logging.
		*/
		console.log(status);
		console.log(xhr);
		
		if(xhr.status == 200){
			var p = document.getElementById('microblog_loggedin_'+params.platform);
			p.style.display = "block";
			
			/*
				TODO Decide what feedback mechanisim is best to signify a successful login.
			*/
			// var uri = config.macros.Microblog.microblogs[params.platform].ListenURI;
			// log("logged in, so going to read " + uri);
			// config.macros.Microblog.listen(params.platform);
		}
	};
	
	
	//Attempt to authenticate the user.
	config.macros.Microblog.logout = function(ev)
	{
		var e = ev ? ev : window.event;
		var platform = this.getAttribute("platform");	
		var uri = config.macros.Microblog.microblogs[platform].LogoutURI;
		
		if(uri) {
			var params = {};
			params.platform = platform;
			doHttp("POST",uri,null,null,null,null,config.macros.Microblog.logoutCalback,params);	
		}
		else {
			log("Ooops. We don't have the details we need logout from " + platform);
		}
	};
	config.macros.Microblog.logoutCalback = function(status,params,responseText,url,xhr){
		
		/*
			TODO remove debug logging.
		*/
		console.log(status);
		console.log(xhr);
		
		log("logged out of " + params.platform);
		var p = document.getElementById('microblog_loggedin_'+params.platform);
		p.style.display = "none";
	};
	

	
	//create listener.
	config.macros.Microblog.listen = function(place, platform, count, avatars, makeTiddlers)
	{
		var uri = config.macros.Microblog.microblogs[platform].ListenURI;	
		var context = {
				host:uri, 
				place:place, 
				platform:platform, 
				count:count,
				avatars:avatars,
				makeTiddlers:makeTiddlers
				};
				
		log("Getting updates from " + platform);
		doHttp("GET",uri,null,null,null,null,config.macros.Microblog.listenHandler,context);
	};
	
	//parse incoming feed
	config.macros.Microblog.listenHandler = function(status,params,responseText,url,xhr){
		
		if(!status) {
			log("We couldn't get a response from " + params.platform + ". Please check your settings and ensure that all is well with " + params.platform);
			return;
		}
		
		log("parsing updates from " + params.platform);
		
		var rootURI = config.macros.Microblog.microblogs[params.platform].RootURI;
		 
		/*
			TODO Replace this nasty JSON eval. Create a smart TW JSON parsing helper.
		*/
		var updates = eval(responseText);
		var count = params.count ? params.count : updates.length;
		if (count == 'all') 
			count = updates.length;

		/*
			TODO abstract the of update to allow for different platforms
		*/ 
		var msg, m, a, i;
		for(var u=0; u<count; u++) {
			msg = updates[u];
			
			/*
				TODO remove debug logging
			*/
			console.log(msg);
			
			m =	createTiddlyElement(params.place,"div",null,"microblog_update",null);
			if(params.avatars){
				a =	createTiddlyElement(m,"a",null,null,null);
				a.href = rootURI + "/" + msg.user.screen_name + "/statuses/" + msg.id;
				i =	createTiddlyElement(a,"img",null,null,null);
				i.src = msg.user.profile_image_url;
			}
			createTiddlyElement(m,"span",null,'user',msg.user.name);		
			createTiddlyElement(m,"span",null,'date',msg.created_at);		
			createTiddlyElement(m,"span",null,'text',msg.text);	
		}
	};
	
	
	//create input UI.
	config.macros.Microblog.ui = function(place,platform){
		var f = createTiddlyElement(place,"form");
		createTiddlyElement(f,"span",null,null,"post an update");
		var input = createTiddlyElement(f,"input",null);
		input.setAttribute('name','update');
		var btn = createTiddlyButton(f,"Update " + platform,"post an update to" + platform,config.macros.Microblog.postUpdate);
		btn.setAttribute("platform",platform);
	};
	
	//Post an upate to the microblog platform.
	config.macros.Microblog.postUpdate = function(ev){
		var e = ev ? ev : window.event;
		var platform = this.getAttribute("platform");
		var uri = config.macros.Microblog.microblogs[platform].PostURI;
		var usr = config.macros.Microblog.microblogs[platform].username;
		var pwd = config.macros.Microblog.microblogs[platform].password;
		
		if(uri && usr && pwd) {
			//get the update and post it.
			var form = this.parentNode;
			var update = "status=" + form['update'].value;
			
			/*
				TODO Remove debug logging.
			*/
			log("Posting to: "+ usr + ":" + pwd + "@" +uri + " ...(" + update + ")");
			
			var params = {};
			params.platform = platform;
			doHttp("POST",uri,update,null,null,null,config.macros.Microblog.postUpdateCalback,params);	
		}
		else {
			log("Ooops. We don't have all the details we need to post this comment.");
		}

	};
	config.macros.Microblog.postUpdateCalback = function(status,params,responseText,url,xhr){
		
		if(!status)
			log('There was a problem posting your update to ' + params.platform);
		/*
			TODO refresh any listings that would show this update.
		*/
		
		/*
			TODO reset the update form after posting.
		*/
	};

} //# end of 'install only once'
//}}}