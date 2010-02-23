/***
|''Name:''|RibbitVoicemail2LeggedPlugin|
|''Description:''|Collect your messages from Ribbit and store as tiddlers|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/RibbitVoiceCommentsPl.js |
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
	
var consumerKey = "MzdmMjdjZGItZjAyMC00YzIzLTgxMDItYzkyOWQ2ZDdhYjY3";
var secretKey ="YWIyNjFlN2YtNWU5Ni00YWFjLThkZTMtOTkxOTdmYWJjZTkx";
var username = "benjamin.nickolls@gmail.com";
var password = "password";
	
var log = console.log;

config.macros.RibbitVoiceComments = {
	
	//TODO check the existance of the comment plugin
	handler: function(place, macroName, params, wikifier, paramString, tiddler){
		//TODO parseparams
		this.tiddler=tiddler;
		if(Ribbit.userId!=null){
			Ribbit.Messages().getReceivedMessages(this.getComments,0,100);
		}
		this.login(consumerKey, secretKey, username, password, this.getComments);
	},
	
	login: function(consumerKey, secretKey, username, password, callback){
		Ribbit.init(consumerKey);
		Ribbit.login(function(result){
			if (result.hasError){
				Log("Bah! Couldn't login");
			}
			Ribbit.Messages().getReceivedMessages(callback,0,100);
		},username,password);
	},
	
	getComments: function(result){
		if(result.hasError){
			Log("Bah couldn't get any messages");
		}else if(result.entry.length!=0){
			for(var i=0;i<result.entry.length;i++){
				var message = result.entry[i];
				var comment = message.body;
				//TODO uncouple
				config.macros.comments.addComment(tiddler,comment);
			}
		}
	}
	
};

//}}}