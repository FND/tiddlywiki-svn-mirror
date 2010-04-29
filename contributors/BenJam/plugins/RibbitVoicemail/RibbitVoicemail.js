(function($) {

	var log = console.log;
	
	var online = navigator.onLine;
	var messages;
	var messagesCount = 0;
	var uncached = 0;
	var loading = true;
	var a = null;
	
	config.macros.RibbitVoicemail = {};

	config.macros.RibbitVoicemail.handler = function(place, macroName, params, wikifier, paramString, tiddler){

		var macroParams = paramString.parseParams(null, null, true);
		config.macros.RibbitVoicemail.getMessages();
	};
	
	config.macros.RibbitVoicemail.getMessages = function(){
		if(!localStorage.messages){
			localStorage.messages = "{}";
		}
		messages = JSON.parse(localStorage.messages);
		if(Ribbit.userId!==null){
			Ribbit.Messages().getReceivedMessages(cache);
		}
	};
	
	function cache(result){
        if (result.hasError && online){
			log(result);
			//story.displayTiddler("Ribbit");
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
            if (loading){
                setInterval(config.macros.RibbitVoicemail.getMessages(),30000);
            }
            loading = false;
        }
    }

	function getAudio(message){
        $.get("http://home.san1t1.com/hothouse/messageProxy.php?uri="+escape(message.mediaUri) + "&accessToken="+Ribbit.accessToken+"&accessSecret="+Ribbit.accessSecret, function (data){
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
		var body = message.body;
		var mediaUri = message.mediaUri;
		var tags = ["Voicemail"];
		var timestamp = Date.convertFromYYYYMMDDHHMMSSMMM(message.time);
		store.saveTiddler(message.id,message.id,body,message.sender,timestamp,tags,{"mediaUri":message.mediaUri},null,timestamp,message.sender);
    }
	
	//TODO something clever here
    function playAudio(uri){
        if (a !== null){
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
