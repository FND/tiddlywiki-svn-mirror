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

Usage

***/
//{{{

(function($) {

    var consumerKey = "MzdmMjdjZGItZjAyMC00YzIzLTgxMDItYzkyOWQ2ZDdhYjY3";
    var secretKey ="YWIyNjFlN2YtNWU5Ni00YWFjLThkZTMtOTkxOTdmYWJjZTkx";
    var username = "benjamin.nickolls@gmail.com";
    var password = "password";
    var tiddler;
        
    var log = console.log;

    config.macros.RibbitVoiceComments = {
        
        handler: function(place, macroName, params, wikifier, paramString, tiddler){
			var macroParams = paramString.parseParams();
            if(Ribbit.userId!=null){
				log("Logged in on previous session");
            }        
			login(place);
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
								log("Logged in, now do something useful with it!")
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
			
			//get a unique url for Ribbit login and send to callback
			Ribbit.createUserAuthenticationUrl(gotUrlCallback);
		}//if
	}

})(jQuery);

//}}}
