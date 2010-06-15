(function($) {
	
	log = console.log;
	
	var online = navigator.onLine;
	var messages;
	var messagesCount = 0;
	var uncached = 0;
	var loading = true;
	var a = null;
	
	config.macros.PlayAudio = {};
	
	config.macros.PlayAudio.handler = function(place, macroName, params, wikifier, paramString, tiddler){
		
		var macroParams = paramString.parseParams("uri",null,true);
		var uri = getParam(macroParams,"uri");
		createTiddlyButton(place, "Play Audio", null, function(){
			playAudio(uri);
		});
	};
	
	config.macros.Voicemail = {};

	config.macros.Voicemail.handler = function(place, macroName, params, wikifier, paramString, tiddler){
		var macroParams = paramString.parseParams(null, null, true);
		config.macros.Voicemail.getMessages();
	};
	
	config.macros.Voicemail.getMessages = function(){
		if(!localStorage.messages){
			localStorage.messages = "{}";
		}
		messages = JSON.parse(localStorage.messages);
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
            for (var i  in result){
                message = result[i];
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
            localStorage.messages = JSON.stringify(messages);
            loading = false;
        }
    }

	function getAudio(message){
		$.get(Ribbit.getStreamableUrl(message.mediaUri), function (data){
			alert(data);
			message.audioData = data;
			render(message);
            uncached --;
            log("left to download - " + uncached + "/" + messagesCount);
		});
	
	    }

	function render(message){
		var id = message.id;
		var sender = message.sender;
		var from = message.from;
		var body = message.body+"\n\n<<PlayAudio "+message.mediaUri+">>";
		var mediaUri = message.mediaUri; 
		// var fields = {
		// 	mediaUri: message.mediaUri,
		// 	audioData: null
		// };
		var fields = {};
		message.audioData ? fields.audioData = message.audioData : fields.audioData = null;
		var tags = ["Voicemail"];
		var timestamp = Date.convertFromYYYYMMDDHHMMSSMMM(message.time);
		store.saveTiddler(id,id,body,sender,timestamp,tags,fields,null,timestamp,sender);
    }
	
	//TODO something clever here
    function playAudio(uri){
		alert(Ribbit.getStreamableUrl(uri));
        if (a != null){
            a.pause();
        }
        for (var i in messages){
            var message = messages[i];
            if (message.mediaUri == uri){
               a = new Audio(message.audioData);
               a.play();
               break;
            }
        }
    }

})(jQuery);
//}}}
