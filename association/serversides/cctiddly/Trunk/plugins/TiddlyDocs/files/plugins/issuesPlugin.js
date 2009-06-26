config.macros.issuesPlugin = {};
config.macros.issuesPlugin.handler = function(place,macroName,params)
{
	tiddlers = store.getTaggedTiddlers('issue');
	if(tiddlers.length < 1){
		wikify('there are no known issues.', place);		
	}else {
		for(var t=0; t < tiddlers.length; t++) {
			console.log(tiddlers[t].title);
			wikify('[['+tiddlers[t].title+']]\n', place);
		}	
	}	
};
