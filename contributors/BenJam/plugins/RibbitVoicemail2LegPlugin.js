/***
|''Name:''|RibbitVoicemail2LeggedPlugin|
|''Description:''|Collect your messages from Ribbit and store as tiddlers|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/RibbitVoicemailPlugin.js |
|''Version:''|0.1|
|''Date:''|Feb 15, 2010|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

Usage:
note: This application uses the two legged authentication model within your private domain, you can enable this for your own application inside the Kermite test suite.
{{{
<<RibbitVoicemail username password [consumerKey]>>
}}}
username: Ribbit account username
password: Ribbit account password
consumerKey: Ribbit application consumer key

If no consumerKey is present the default key for my own application RibbitIntro is used
***/
//{{{
	
var log = console.log;
var consumerKey = "MzdmMjdjZGItZjAyMC00YzIzLTgxMDItYzkyOWQ2ZDdhYjY3";

config.macros.RibbitVoicemail2Leg = {
	
	handler: function(place, macroName, params, wikifier, paramString, tiddler){
		//params = paramString.parseParams();
		if(params.length>3){
			log("Bah! Too many params");
			return;
		}
		var username = params[0];
		var password = params[1];
		if(params.length==3){
			var key=params[3];
			this.login(username,password,key);
		}
		this.defaultLogin(username,password);
	},
	
	defaultLogin: function(username,password){
		if(Ribbit.userId!==null){
			Ribbit.Messages().getReceivedMessages(this.getVoicemail,0,100);  
		}
		Ribbit.init(consumerKey);
		Ribbit.login(this.loginCallback,username,password);
	},
	
	login: function(username,password,key){
		if(Ribbit.userId!==null){
			Ribbit.Messages().getReceivedMessages(this.getVoicemail,0,100);  
		}
		Ribbit.init(key);
		Ribbit.login(this.loginCallback,username,password);
	},
	
	loginCallback: function(result){
		if(result.hasError)
			log("Bah! Couldn't log in");
		else{
			Ribbit.Messages().getReceivedMessages(this.getVoicemail,0,100);  
		}	
	},

	getVoicemail: function(result){
		if (result.hasError){
			log("Bah! couldn't collect messages");
		}else{
			if(result.entry.length !=0){	
				store.suspendNotifications();
				for(var i=0;i<result.entry.length;i++){
					var message = result.entry[i];
					//seperate id and sender elements
					var id = new String(message.id).split(':')[1];
					var sender = new String(message.sender).split(':')[1];
					//construct a decent title and body
					var title = message.type+" "+id+" from "+sender;
					var body = message.body+"\n\n[[.mp3|"+ message.mediaUri +"]]";
					var tags = [message.type];
					var timestamp = Date.parse(message.time);
					store.saveTiddler(title,title,body,sender,timestamp,tags,config.defaultCustomFields,null,timestamp,sender);
				}
				store.resumeNotifications();
				refreshAll();
			}
		}
		
	}
}
//}}}