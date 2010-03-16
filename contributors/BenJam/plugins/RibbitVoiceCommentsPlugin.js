/***
|''Name:''|RibbitCommentsPlugin|
|''Description:''|Collect comments by voice|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/RibbitVoiceCommentsPl.js |
|''Version:''|0.1|
|''Date:''|Feb 15, 2010|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

Usage:

<<voiceComments [authMode], [user], [password] [consumerKey], [secretKey]>>

authMode: the authentication mode to use, '2' for private domain authentication, or '3' for public domain
user: the username of the account to collect from in 2Legged authentication
password: the password of the account to collect from in 3Legged authentication
consumerKey: the consumer key of the Ribbit application hosting a comments service (2Leg and 3Leg authentication)
secretKey: The secret key of the RIbbit application hosting a comments service for 3Legged authentication

***/
//{{{

(function($) {

    var consumerKey = "MzdmMjdjZGItZjAyMC00YzIzLTgxMDItYzkyOWQ2ZDdhYjY3";
    var secretKey ="YWIyNjFlN2YtNWU5Ni00YWFjLThkZTMtOTkxOTdmYWJjZTkx";

    var log = console.log;

    config.macros.voiceComments = {
        
        handler: function(place, macroName, params, wikifier, paramString, tiddler){
			var macroParams = paramString.parseParams();
			log(macroParams);
            if(Ribbit.userId!=null){
				log("Logged in on previous session");
            }        
			
        }

    };
	//three leg (public) domain at r4m.ribbit.com (requires a redirect)
	function login3Leg(place,macroParams){
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
								log("Logged in, now do something useful with it!")
								win.close();
								return
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
			
			//get a unique url for Ribbit login and send to callback
			Ribbit.createUserAuthenticationUrl(gotUrlCallback);
		}//if
	}//login
	
	//2legged (private domain) authentication 
	function login2Leg(place, macroParams){
		if(Ribbit.userId!==null){
			log("User already logged in")
			return
		}
		
		var username = getParam(macroParams,"user");
		var password = getParam(macroParams,"pass");
		
		if(getParam(macroParms,"consumerKey")!==null){
			log("Overwriting consumer key");
			consumerKey = getParams(macroParams,"consumerKey");
			log(consumerKey);
		}
		Ribbit.init(consumerKey);
		Ribbit.login(function(result){
			if(result.hasError){
				log(result);
			}else{
				log("Logged in, now do something useful with it!")
				return
			}
		},username, password);
		return
	}

})(jQuery);

//}}}
