/***
|''Name:''|RibbitVoicemail|
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
note: This application requires that you have a Ribbit for mobile account.
{{{
<<RibbitVoicemail consumerKey [secretKey] [username] [password]  [markRead]>>

consumerKey: your Ribbit application consumer key
secretKey: your Ribbit application secretKey (3Legged auth only)
username: your Ribbit application username (2Legged auth only)
password: your Ribbit application password (2Legged auth only)
markRead: whether or not you want to mark messages downloaded as read (default no)

TODO:
Use HTML5 <audio> tag to indicate the playable voicemail recording
Use localstorage to save the voicemail for offline
}}}
***/
//{{{

(function($) {
	
    var log = console.log;

    config.macros.RibbitVoicemail = {

        handler: function(place, macroName, params, wikifier, paramString, tiddler){
			var macroParams = paramString.parseParams();
			log(macroParams);
			
            if(Ribbit.userId!=null){
				log("Logged in on previous session");
            }        
			if(getParam(macroParams,"secretKey")!==null){
				//user wants to do a 3LeggedAuthentication
				log("login on 3Legged auth");
				login3Leg(place, macroParams);
			}
			else{
				log("login on 2Legged auth");
				login2Leg(place, macroParams);
			}
        }

    };
	//three leg (public) domain at r4m.ribbit.com (requires a redirect)
	function login3Leg(place,macroParams){
		if(!Ribbit.isLoggedIn || !Ribbit.checkAccessTokenExpiry()){
			
			var cKey = getParam(macroParams,"consumerKey");
			var sKey = getParam(macroParams,"secretKey");
			
			Ribbit.init3Legged(cKey, sKey);
			
			var win=null;

			//innner function to handle login on seperate window
			var gotUrlCallback = function(url){
				log(url);				
				//poll the newly created window for login
				var pollApproved = function(){
					setTimeout(function(){
						var callBack = function(result){
							if(!result.hasError){
								log("Logged in, now do something useful with it!");
								win.close();
								getMessages(macroParams);
								return;
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

			};//gotUrlCallback

			//get a unique url for Ribbit login and send to callback
			Ribbit.createUserAuthenticationUrl(gotUrlCallback);
		}//if
	}//login

	//2legged (private domain) authentication 
	function login2Leg(place, macroParams){
		if(Ribbit.userId!==null){
			log("User already logged in");
			return;
		}
		var cKey = getParam(macroParams,"consumerKey");
		var username = getParam(macroParams,"username");
		var password = getParam(macroParams,"password");

		Ribbit.init(cKey);
		Ribbit.login(function(result){
			if(result.hasError){
				log(result);
			}else{
				log("Logged in, now do something useful with it!");
				getMessages(macroParams);
				return;
			}
		},username, password);
		return;
	}
	
	function getMessages(macroParams){
		Ribbit.Messages().getReceivedMessages(function(result){
			if (result.hasError){
				log("Bah! couldn't collect messages");
			}else{
				if(result.entry.length !=0){	
					store.suspendNotifications();
					for(var i=0;i<result.entry.length;i++){
						var message = result.entry[i];
						var id = new String(message.id).split(':')[1];
						var sender = new String(message.sender).split(':')[1];
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
		},0,100);
	}

})(jQuery);

//}}}
