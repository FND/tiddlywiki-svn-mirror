/***
|''Name:''|RibitVoicemail|
|''Description:''|Collect Voicemail in a TiddlyWiki from Ribbit|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/|
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|
Usage:
//{{{
The handler config.macros.Voicemail.handler will fill the current TiddlyWiki with voicemail from the currently logged in Ribbit user, else the RibbitLogin plugin will be envoked.
//}}}
***/
//{{{
(function($) {
	
		log = console.log;
	
		var online = navigator.onLine;
		var messages;
		var messagesCount = 0;
		var uncached = 0;
		var loading = true;
		var a = null;
	
		config.macros.Voicemail = {};

		config.macros.Voicemail.handler = function(place, macroName, params, wikifier, paramString, tiddler){
			var macroParams = paramString.parseParams(null, null, true);
			config.macros.Voicemail.getMessages();
		};
	
		config.macros.Voicemail.getMessages = function(){
			if(Ribbit.userId!==null){
				Ribbit.Messages().getReceivedMessages(cache);
			}
		};
	
		config.macros.Voicemail.goOffline = function(){
			online = false;
		};
	
		config.macros.Voicemail.goOnline = function(){
			online = true;
		};
	
		function cache(result){
	        if (result.hasError && online){
				alert("Bah, couldn't collect messages, you online?");
	        }
	        else{
	            for (var i in result){
	                var message = result[i];
	                if (!messages[message.id]){
	                    messages[message.id] = {
								id:message.id,
	                            body:message.body,
	                            sender:message.sender,
	                            from:message.from,
	                            mediaUri:message.mediaUri,
	                            time:message.time
	                        }; 
	                }
	                else if (loading){
	                    messages[message.id].body = message.body;
	                    render(message);
	                }
	                else{
	                    messages[message.id].body = message.body;
	                }
	            }
	        }
	        for (var j in messages){
	            messagesCount ++;
	            var message = messages[j];
	            if (!message.audioData){
	                uncached++;
	                getAudio(message);
	            }
	        }
	        cachingDone();
	    }

		function cachingDone(){
	        if (uncached > 0 ){
	            setTimeout(cachingDone,500);
	        }
	        else{
	            loading = false;
	        }
	    }

		function getAudio(message){
			$.get(Ribbit.getStreamableUrl(message.mediaUri), function (data){
				message.audioData = data;
				render(message);
	            uncached --;
	            log("Downloading audio - " + uncached + "/" + messagesCount);
			});
		}

		function render(message){
			var id = message.id;
			var sender = message.sender;
			var from = message.from;
			var body = message.body;
			var mediaUri = message.mediaUri; 
			var fields = {};
			message.audioData ? fields.audioData = message.audioData : fields.audioData = null;
			var tags = ["Voicemail"];
			var timestamp = Date.convertFromYYYYMMDDHHMMSSMMM(message.time);
			store.saveTiddler(id,id,body,sender,timestamp,tags,fields,null,timestamp,sender);
	    }	

})(jQuery);
//}}}
