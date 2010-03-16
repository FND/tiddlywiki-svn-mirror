/***
|''Name:''|RibbitVoicemail3LegPlugin|
|''Description:''|Collect your messages from Ribbit and store as tiddlers|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/RibbitVoicemail3LegPlugin.js |
|''Version:''|0.1|
|''Date:''|Feb 15, 2010|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|
TODO UPDATE
Usage:
note: This application requires that you have a RIbbit for mobile account.
{{{
<<RibbitVoicemail username password [consumerKey]>>
}}}
username: Ribbit account username
password: Ribbit account password
consumerKey: Ribbit application consumer key

If no consumerKey is present the default key for my own application RibbitIntro is used
***/
//{{{

(function($){
	
	var log = console.log;
	var consumer = "MDllOTljNzgtYmYwZC00YzJlLTlkZDctYmMyZmZiY2UzYjFl";
	var secret = "ODI5OWM2MjYtNjE2MS00YWNkLWIwNTgtMDYzYjcwMjgwYmQ1";

	config.macros.RibbitVoicemail3Leg = {
		
		handler:function(place, macroName, params, wikifier, paramString, tiddler){
			var macroParams = paramString.parseParams(null, null, true);
			if(Ribbit.userId!==null){
				log("using previous session");
				Ribbit.Messages().getReceivedMessages(getMessages,0,100);
			}
			else{
				login(place,tiddler, macroParams);
			}
			
		}
	};
	
	function login(place){
		if(!Ribbit.isLoggedIn || !Ribbit.checkAccessTokenExpiry()){
			Ribbit.init3Legged(consumerKey, secretKey);
			var win=null;
			
			//innner function to handle login on seperate window
			var gotUrlCallback = function(url){
				log(url);				
				//poll the newly created window for login
				var pollApproved = function(){
					setTimeout(function(){
						var callBack = function(result){
							if(!result.hasError){
								log("Logged in now do something useful with it");
								Ribbit.Messages().getReceivedMessages(getMessages,0,100);
								win.close();
							}
							else{
								pollApproved();
							}
						};//callBack
						Ribbit.checkAuthenticatedUser(callBack);
					},4000); //setTimeout
				}; //pollApproved
				createTiddlyButton(place,"Login", null, function(){
					win = window.open(url, "r4mlogin","width=1024,height=800,toolbar:no");
					pollApproved();
					return false;
				});
				
			}//gotUrlCallback
			Ribbit.createUserAuthenticationUrl(gotUrlCallback);
		}//if
	}//login
	
	function getMessages(result){
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
}(jQuery);
//}}}