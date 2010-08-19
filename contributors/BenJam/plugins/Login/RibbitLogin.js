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
		consumerKey = null;
		secretKey = null;
		var userDetails = [];
		
	    config.macros.RibbitLogin = {

		        handler: function(place, macroName, params, wikifier, paramString, tiddler){
					var macroParams = paramString.parseParams("authmode", null, true);
					var authmode = getParam(macroParams,"authmode",null);				

					//not enough info
					if(authmode===null){
						// log("No authomde specified");
						return;
					}

					//already siged in
					if(Ribbit.userId!==null){
						// log("Logged in on previous session");
						return;
					}

					switch(parseInt(authmode)){
						case 2:
							login2Leg(place,macroParams);
							break;
						case 3:
							login3Leg(place,macroParams);
							break;
						default:
					  		return;
					}
				}//handler
	
		};//macro

		//three leg (public) domain at r4m.ribbit.com (requires a redirect)
		function login3Leg(place, macroParams){
			if(Ribbit.userId!==null){
				createTiddlyButton(place,"Logout",null,function(){
					Ribbit.logoff();
					story.refreshAllTiddlers(); 
				})
				return;
			}
			if(getParam(macroParams,"consumerKey",null)==null || getParam(macroParams,"secretKey",null)==null){
				// log('Bah! Couln\'t find one/both of the keys');
				return;
			}
			if(getParam(macroParams,"consumerKey",null)!==null || getParam(macroParams,"secretKey",null)!==null){
				consumerKey = getParam(macroParams,"consumerKey",null);
				secretKey = getParam(macroParams,"secretKey",null);
				// log('Keys stored');
			}
			if(!Ribbit.isLoggedIn || !Ribbit.checkAccessTokenExpiry()){
				Ribbit.init3Legged(consumerKey, secretKey);
				createTiddlyButton(place,"Login to Ribbit Mobile", null, function(){
					Ribbit.getAuthenticatedUserInPopup(function(){
						// log("Logged in, now do something useful with it");
						story.refreshAllTiddlers(); 
					}, "G", "width=1024,height=600,toolbar:no")
					});

			}//if
		}//login

		//2legged (private domain) authentication 
		function login2Leg(place, macroParams){
			if(Ribbit.userId!==null){
				createTiddlyButton(place,"Logout",null,function(){
					Ribbit.logoff();
					story.refreshAllTiddlers();
				})
			}
			if(getParam(macroParams,"consumerKey",null)==null){
				// log("Bah! Couldn\'t find keys");
				return;
			}
			consumerKey = getParam(macroParams,"consumerKey");
			Ribbit.init(consumerKey);
			
			if(!$('input:password')){
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
					Ribbit.login(function(result){
		            	if(result.hasError){
							// log("Bah! Couldn\'t log in");
		            	}else{
		                	// log("Logged in, now do something useful with it!");
							story.refreshAllTiddlers(); 
		            	}
		        	},i[0].value, i[1].value);
				});
			}
			return;
		}

	})(jQuery);
}//end of install only once
//}}}
