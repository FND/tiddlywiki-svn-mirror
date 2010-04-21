/***
|''Name:''|RibbitCommentsPlugin|
|''Description:''|Collect voicemail from your Ribbit inbox|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/RibbitVoiceCommentsPl.js |
|''Version:''|0.1|
|''Date:''|Feb 15, 2010|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''Dependencies:''|Requires RibitLogin and YYYYMMDDHHMMSSMMMPlugin|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

Usage:
//{{{
<<RibbitVoicemail>>
//}}}

***/
//{{{



var consumerKey = "MzdmMjdjZGItZjAyMC00YzIzLTgxMDItYzkyOWQ2ZDdhYjY3";
var secretKey ="YWIyNjFlN2YtNWU5Ni00YWFjLThkZTMtOTkxOTdmYWJjZTkx";

var log = console.log;

config.macros.RibbitVoicemail = {};

config.macros.RibbitVoicemail.handler = function(place, macroName, params, wikifier, paramString, tiddler){

	var macroParams = paramString.parseParams(null, null, true);
	getMessages();
};

config.macros.RibbitVoicemail.getMessages = function(){
	
	if(Ribbit.userId===null){
		log("Ribbit sesison expired");
		//story.displayTiddler("top","Ribbit");
	}
	
	Ribbit.Messages().getReceivedMessages(function(result){
		if (result.hasError){
			log("Bah! couldn't collect messages");
			log(result);
		}
		else{
			if(result.entry.length !==0){    
				store.suspendNotifications();
				for(var i=0;i<result.entry.length;i++){
						var message = result.entry[i];
						var id = new String(message.id).split(':')[1];
						var sender = new String(message.sender).split(':')[1];
						var title = message.type+" "+id+" from "+sender;
						var body = message.body+"\n\n[[.mp3|"+ message.mediaUri +"]]";
						var tags = [message.type];
						var timestamp = Date.convertFromYYYYMMDDHHMMSSMMM(message.time);
						store.saveTiddler(title,title,body,sender,timestamp,tags,config.defaultCustomFields,null,timestamp,sender);
				}
				store.resumeNotifications();
				refreshAll();
			}
		}
	},0,100);
};

//}}}
