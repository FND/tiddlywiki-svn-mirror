/***
|''Name:''|RibbitLogin|
|''Description:''|Login to the Ribbit Service (r4m.ribbit.com 'public' domain)|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/|
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|
Usage:
//{{{
<<RibbitLogin authmode [user] [pass] [consumerKey] [secretKey] >>

authmode [2,3] initiates a two or three legged authentication
user the username for 2 legged auth to sign in [2Legged auth only]
pass the password for 2 legged auth to sign in [2Legged auth only]
consumerKey the Ribbit app consumer key to use (overwrites my own default)
secretKey the Ribbit app secret key to use (overwrites my own defaut) [3Legged Auth only]

//}}}
***/
//{{{
if(!version.extensions.RibbitLogin){
	version.extensions.RibbitLogin = {installed:true};	
	
	(function($) {
    
	    log = console.log;

		//some defaults from benjmain.nickolls@gmail.com/Ribbit_Intro
	    consumerKey = "MzdmMjdjZGItZjAyMC00YzIzLTgxMDItYzkyOWQ2ZDdhYjY3";
	    secretKey ="YWIyNjFlN2YtNWU5Ni00YWFjLThkZTMtOTkxOTdmYWJjZTkx";
		var userDetails = [];
		
	    config.macros.RibbitLogin = {

		        handler: function(place, macroName, params, wikifier, paramString, tiddler){
					var macroParams = paramString.parseParams("authmode", null, true);
					var authmode = getParam(macroParams,"authmode",null);				

					//not enough info
					if(authmode===null){
						// log("No authomde specified");
						return
					}

					//already siged in
					if(Ribbit.userId!==null){
						// log("Logged in on previous session");
						return
					}

					switch(parseInt(authmode)){
						case 2:
							login2Leg(place,macroParams);
							break;
						case 3:
							login3Leg(place,macroParams);
							break;
						default:
					  		return
					}
				}//handler
	
		};//macro

		//three leg (public) domain at r4m.ribbit.com (requires a redirect)
		function login3Leg(place, macroParams){
		
			// log("Initiating 3 Legged auth");
			if(getParam(macroParams,"consumerKey",null)!==null && getParam(macroParams,"secretKey",null)!==null){
				consumerKey=getParam(macroParams,"consumerKey");
				secretKey=getParam(macroParams,"secretKey");
			}
			// log("Consumer key: "+consumerKey);
			// log("Secret key: "+secretKey);
		
			if(!Ribbit.isLoggedIn || !Ribbit.checkAccessTokenExpiry()){
				Ribbit.init3Legged(consumerKey, secretKey);
				var win=null;
		
				//innner function to handle login on seperate window
				var gotUrlCallback = function(url){
					// log(url);				
					//poll the newly created window for login
					var pollApproved = function(){
						setTimeout(function(){
							var callBack = function(result){
								if(!result.hasError){
									// log("Logged in, now do something useful with it!");
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
						return false
					});
			
				}//gotUrlCallback
		
				//get a unique url for Ribbit login and send to callback
				Ribbit.createUserAuthenticationUrl(gotUrlCallback);
			}//if
		}//login

		//2legged (private domain) authentication 
		function login2Leg(place, macroParams){
			Ribbit.init(consumerKey);
			// log("init with consumer Key "+consumerKey);
	
			// if(getParam(macroParams,"consmerKey",null)!==null){
			// 	consumerKey = getParam(macroParams,"consmerKey");
			// 	log("New consumer key: "+consumerKey);
			// }		

			userDetails.push(['username','Username']);
			userDetails.push(['password','Password']);
									
			var f = createTiddlyElement(place,"form",null);
			for(var d=0; d<userDetails.length; d++){
				createTiddlyElement(f,'span',null,null,userDetails[d][1]);
				if(userDetails[d][0] == 'password') {
					var input = createTiddlyElement(f,'input',null,null,null,{'type':'password'});
				}
				else {
					var input = createTiddlyElement(f,'input',null);
				}
				input.setAttribute('name',userDetails[d][0]);
			}
			var btn = createTiddlyButton(f,'Sign in',null,function(){
				var i = f.getElementsByTagName('input');
				// log(i[0].value);
				// log(i[1].value);
				Ribbit.login(function(result){
					// log(result)
	            	if(result.hasError){
	                	// log("Bah, couldn't login");
	            	}else{
	                	// log("Logged in, now do something useful with it!");
	            	}
	        	},i[0].value, i[1].value);
			});
			return
		}

	})(jQuery);
}//end of instal only once
//}}}
