config.macros.docSectionButtons = {};
config.macros.docSectionButtons.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(typeof(tiddler.fields['server.host']) === "string") {
		return;
		var a = createTiddlyElement(place, "a", null, 'button');
		a.href = tiddler.fields['server.host']+tiddler.fields['server.workspace']+'/tiddlers/'+tiddler.title+'.wiki';
		var img = createTiddlyElement(a, 'img', '', '', '', {'height':'12px'});	
		img.src = 'http://www.sheffieldhealthyschools.co.uk/images/icons/link_icon.png';	
		createTiddlyText(a, 'Permalink');
		var a2 = createTiddlyElement(place, "a", null, 'button');
		a2.href = tiddler.fields['server.host']+tiddler.fields['server.workspace']+'/tiddlers/'+tiddler.title+'.atom';
		var img2 = createTiddlyElement(a2, 'img', '', '', '', {'height':'12px'});	
		img2.src = 'http://www.acdivoca.org/852571DC00681414/Lookup/RSS-feed-small-PNG/$file/RSS-feed-small-PNG.png';
		createTiddlyText(a2, 'RSS');
	}
};
