//{{{
SanitizeTitle = {
	forbidden : ['[', ']', '{', '}', ':', '|', '$', '+', '#', '@', '"'],
	
	old_save_handler : config.commands.saveTiddler.handler,
	
	init: function(){
		config.commands.saveTiddler.handler = function(event,src,title) {
			var newTitle = story.getTiddlerField(title,'title').value;
			if (newTitle.split('').containsAny(SanitizeTitle.forbidden)) {
				alert('The title cannot contain any of the following characters: [ ] { } : | $ + # @ "');
				return false;
			}	
			return SanitizeTitle.old_save_handler.apply(this,arguments);
		}
	}
}

SanitizeTitle.init();
//}}}