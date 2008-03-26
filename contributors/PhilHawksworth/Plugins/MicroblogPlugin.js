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
	<<microblog identifier signin>>
}}}


Display the interface to allow posting of an update.
{{{
	<<microblog identifier postform>>	
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
	
	var log = function(str) {
		if(window.console) {
			console.log(str);
			return;
		}
	};
	
	
	// var refreshDisplay_original = refreshDisplay;
	// var refreshDisplay = function() {
	// 	
	// 	var tempTweet = document.getElementById('twitter_post_input');
	// 	if(tempTweet){
	// 		var tweetValue = tempTweet.value;
	// 		log("TT:" + tweetValue);
	// 	}
	// 	
	// 	refreshDisplay_original();		
	// 	
	// 	if(tweetValue && tweetValue != "")
	// 		tempTweet.value = tweetValue;
	// 		
	// };
	
	
	config.macros.Microblog = {};
	var microblogs = config.macros.Microblog.microblogs = [];

	config.macros.Microblog.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		
		if(params.length < 2) {
			log('Not enough arguments in the call to the Microblog plugin');
			return;
		}
		var platform = params[0]; 
		var action = params[1]; 
		
		//get the settings for this Microblog platform.
		if(!microblogs[platform])
			this.settings(platform);
		
		switch(action) {
			case 'signin':
				this.signin(place,platform);
				break;	  
			case 'postform':
				this.postform(place,platform);
				break;
			case 'listen':			
				var count = params[2] ? params[2] : false;
				var avatars = params[3] =='avatars' ? true : false;
				var makeTiddlers = params[4] =='makeTiddlers' ? true : false;
				var template = params[5] ? params[5] : null;
				microblogs[platform].poll = true;
				this.listen(place, platform, count, avatars, makeTiddlers, template);
				break;
			case 'refreshButton':
				this.refreshBtn(place);
				break;
			case 'reflect':
				var template = params[5] ? params[5] : null;
				this.reflect(place, platform, template);
			default:
				log('ERROR. '+ action+ ' is not a valid parameter for the Microblog plugin.');
				break;
		}
	};
	
	
	// gather the config data from the config tiddler for use when required.
	config.macros.Microblog.settings = function(platform){
		
		//Get the existing data object or create a new one.
		var mb = microblogs[platform] ? microblogs[platform] : {};
		
		//Gather the data from the tiddler.
		var configTiddlerTitle = "MicroblogConfig_" + platform;
		var slices = store.calcAllSlices(configTiddlerTitle);
		mb['authenticated'] = false;
		for(var s in slices) {
			mb[s] = store.getTiddlerSlice(configTiddlerTitle, s);
		}
		
		microblogs[platform] = mb;	
	};
	


	//create signin UI.
	config.macros.Microblog.signin = function(place, platform){

		// The user details to gather.
		var userDetails = [];
		userDetails.push(['username','Username']);
		userDetails.push(['password','Password']);
		
		//Build the UI for the conifg
		var f = createTiddlyElement(place,"form","user_form_"+platform);
		// createTiddlyElement(f,"span",null,null,"Signin for " + platform + " microblog.");
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
		var btn = createTiddlyButton(f,"Sign in to " + platform,"Store these settings and start using the microblog",config.macros.Microblog.signinClick);
		btn.setAttribute("platform",platform);
		btn.setAttribute("place",place);
		var t = story.findContainingTiddler(place);		
		btn.setAttribute("tiddlerTitle",t.getAttribute('tiddler'));

		
		// var loggedin = createTiddlyElement(place,"span",'microblog_loggedin_' + platform,'hidden',"Logged in to " + platform);
		// var logoutbtn = createTiddlyButton(loggedin,"Signout of " + platform,"Signout of " + platform,config.macros.Microblog.logout);
		// logoutbtn.setAttribute("platform",platform);
	};
	
	
	// update the config details for this micoroblog with the user details and then try to authenticate.
	config.macros.Microblog.signinClick = function(ev){
		
		var e = ev ? ev : window.event;
		var btn = this;
		var platform = btn.getAttribute("platform");
		var place = btn.getAttribute("place");
		var tiddlerTitle = btn.getAttribute("tiddlerTitle");
		
		var mb = microblogs[platform];
		
		//record the details.
		var form = btn.parentNode;
		var inputs = form.getElementsByTagName('input');
		var f;
		for (var i=0; i < inputs.length; i++) {
			f = inputs[i];
			mb[f.name] = f.value;
		};
		config.macros.Microblog.auth(tiddlerTitle, platform, btn); 
	};


	//Attempt to authenticate the user.
	config.macros.Microblog.auth = function(tiddlerTitle, platform, btn)
	{
		var uri = microblogs[platform].LoginURI;
		var usr = microblogs[platform].username;
		var pwd = microblogs[platform].password;
		
		if(uri && usr && pwd) {
			//get the update and post it.
			log("logging in to "+ platform);
			var params = {};
			params.platform = platform;
			params.tiddlerTitle = tiddlerTitle;
			doHttp("POST",uri,null,null,usr,pwd,config.macros.Microblog.authCalback,params);	
		}
		else {
			log("Ooops. We don't have all the details we need to post this comment.");
		}
	};
	config.macros.Microblog.authCalback = function(status,params,responseText,url,xhr){
		
		if(xhr.status == 200){
			microblogs[params.platform].authenticated = true;
			config.options.txtTwitterSignedIn = 'true';
			story.refreshTiddler(params.tiddlerTitle, null, true);
			
			// var p = document.getElementById('microblog_loggedin_'+params.platform);
			// p.style.display = "block";
			
			/*
				TODO Decide what feedback mechanisim is best to signify a successful login.
			*/
		}
	};
	
	
	//Attempt to authenticate the user.
	config.macros.Microblog.logout = function(ev) {
		var e = ev ? ev : window.event;
		var platform = this.getAttribute("platform");	
		var uri = microblogs[platform].LogoutURI;
		
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
		microblogs[params.platform].authenticated = false;
		
		config.options.txtTwitterSignedIn = 'false';
					
		var p = document.getElementById('microblog_loggedin_'+params.platform);
		p.style.display = "none";
	};
	
	
	//create listener.
	config.macros.Microblog.listen = function(place, platform, count, avatars, makeTiddlers, template) {
		//display the signin form if user not authenticated.
		if(!microblogs[platform].authenticated) {
			createTiddlyElement(place,"span",null,null,"Please log in to " + platform );
			return;
		} 
		
		var uri = microblogs[platform].ListenURI;	
		var context = {
				host:uri, 
				place:place, 
				platform:platform, 
				count:count,
				avatars:avatars,
				makeTiddlers:makeTiddlers,
				template:template
				};
		
		if(place.childNodes.length==0)
			wikify("{{loadingIndicator{\n\nloading...}}}",place);
		log("Getting updates from " + platform);
		doHttp("GET",uri,null,null,null,null,config.macros.Microblog.listenHandler,context);
	};
	
	//parse incoming feed
	config.macros.Microblog.listenHandler = function(status,params,responseText,url,xhr){
		
		if(!status) {
			log("We couldn't get a response from " + params.platform + ". Please check your settings and ensure that all is well with " + params.platform);
			return;
		}
				
		var rootURI = microblogs[params.platform].RootURI;
		 
		/*
			TODO Replace this nasty JSON eval. Create a smart TW JSON parsing helper?
		*/
		var updates = eval(responseText);
		var count = params.count ? params.count : updates.length;
		if (count == 'all') 
			count = updates.length;

		store.suspendNotifications();
		
		/*
			TODO Cleaning out the display this way seems to kill future images. Fix me!
		*/
		
		removeChildren(params.place);
	
		var msg, m, a, i;
		var id, text, creator, timestamp, d;
		for(var u=0; u<count; u++) {
					
			msg = updates[u];
			
			id = msg.id.toString();
			text = msg.text.htmlDecode();
			
			/*
				TODO Format date string nicely.
			*/
			timestamp = msg.created_at;
			d = new Date(timestamp);
			
			creator = msg.user.name;
			screenname = msg.user.screen_name;
			image = msg.user.profile_image_url;
			status_link = rootURI + "/" + screenname + "/statuses/" + id;
			user_link = rootURI + "/" + screenname;
	
			/*
				TODO move this test to be somewhere more efficient?
			*/
			if(params.makeTiddlers) {
				//create a tiddler for each tweet.
				var t = store.fetchTiddler(id);
	  			//if the notes tiddler doesn't exist, then create and save it
	  			if(!t) {
	  				t = new Tiddler(id);
					t.text = text;
	  				t.created = d;
	  				t.modifier = creator;
					if(msg.url)
						t.fields.url = msg.url;
	  				t.fields.screen_name = screenname;
	  				t.fields.profile_image_url = image;
					t.fields.status_link = status_link;
					t.fields.user_link = user_link;
	  				t.tags.pushUnique(params.platform);
	  				t.tags.pushUnique("Microblog_update");
	  				store.saveTiddler(t.title,t.title,t.text,t.modifier,null,t.tags,t.fields,true,t.created);
	  			}
						
			}
			else {
				//render the tweets inline.
				m = createTiddlyElement(params.place,"div",null,"microblog_update",null);
				if(params.avatars){
					a = createTiddlyElement(m,"a",null,null,null);
					a.href = status_link;
					i = createTiddlyElement(a,"img",null,null,null);
					i.src = image;
				}
				createTiddlyElement(m,"span",null,'user',creator);		
				createTiddlyElement(m,"span",null,'date',timestamp);		
				createTiddlyElement(m,"span",null,'text',text); 
			}
		}
		
		// Render the tiddlers if they were created.
		//var notDrawn = params.place.childNodes;
		if(params.makeTiddlers) {
			var filter = 'filter:"[tag['+ params.platform+ ']]" template:' + params.template;
			// config.macros.ListTemplate.handler(params.place,null,null,null,paramString,null);
			config.macros.Microblog.renderTemplate(params.place,filter);
		}
		
		/*
			TODO Prevent the refresh from clearing the posting form.
		*/
		refreshDisplay();		
		store.resumeNotifications();

		
		if(microblogs[params.platform].poll) {
			var period = config.macros.Microblog.getInterval(params.platform);
			microblogs[params.platform].timer = window.setTimeout(function() {config.macros.Microblog.listen(params.place, params.platform, params.count, params.avatars, params.makeTiddlers, params.template);}, period); 
		}
		else {
			microblogs[params.platform].timer = null;
		}
	};
	
	config.macros.Microblog.reflect = function(place, platform, template) {
		var filter = 'filter:"[tag['+ platform+ ']]" template:' + template;
		config.macros.Microblog.renderTemplate(place,filter);
	};
	
	config.macros.Microblog.renderTemplate = function(place, filter) {
		config.macros.ListTemplate.handler(place,null,null,null,filter,null);
	};
	
	//refresh this display
	config.macros.Microblog.refreshBtn = function(place){
		var btn = createTiddlyButton(place, "refresh","refresh",config.macros.Microblog.doRefresh);
		var t = story.findContainingTiddler(place);		
		btn.setAttribute("tiddlerTitle",t.getAttribute('tiddler'));
	
	};
	
	config.macros.Microblog.doRefresh = function(ev){
		var e = ev ? ev : window.event;
		var t = this.getAttribute("tiddlerTitle");	
		story.refreshTiddler(t, null, true);
	};
	

	//create input UI.
	config.macros.Microblog.postform = function(place,platform){
		
		//display the signin form if user not authenticated.
		if(!microblogs[platform].authenticated) {
			log('authentication needed for ' + platform);
			createTiddlyElement(place,"span",null,null,"Please log in to " + platform + " before posting an update." );
		} 
		else {
			var f = createTiddlyElement(place,"form");
			f.id = platform + "_postform";
			// createTiddlyElement(f,"span",null,null,"post an update");
			var input = createTiddlyElement(f,"textarea",'twitter_post_input','twitter_post_input');
			input.setAttribute('name','update');
			var btn = createTiddlyButton(f,"Update " + platform,"post an update to" + platform,config.macros.Microblog.postUpdate);
			btn.setAttribute("platform",platform);
		}
	};
	
	//Post an upate to the microblog platform.
	config.macros.Microblog.postUpdate = function(ev){
		var e = ev ? ev : window.event;
		var platform = this.getAttribute("platform");
		var uri = microblogs[platform].PostURI;
		
		//not required if we let the browser session take care of the authentication.
		var usr = microblogs[platform].username;
		var pwd = microblogs[platform].password;
		
		if(uri) {
			//get the update and post it.
			var form = this.parentNode;
			var update = "status=" + form['update'].value;
			var params = {};
			params.platform = platform;
			params.field = form['update'];
			doHttp("POST",uri,update,null,null,null,config.macros.Microblog.postUpdateCalback,params);	
		}
		else {
			log("Ooops. We don't have all the details we need to post this comment.");
		}

	};
	config.macros.Microblog.postUpdateCalback = function(status,params,responseText,url,xhr){
		
		if(xhr.status == 200)
			log("posted");
			if(params.field)
				params.field.value="";
			/*
				TODO refresh any listings that would show this update.
			*/
		else
			log('There was a problem posting your update to ' + params.platform);

	};
	config.macros.Microblog.getInterval = function(platform) {
		var t = microblogs[platform].Period ? parseInt(microblogs[platform].Period) * 1000 : 60000;
		if(isNaN(t))
			t = 60000;
		return t;
	};


} //# end of 'install only once'
//}}}