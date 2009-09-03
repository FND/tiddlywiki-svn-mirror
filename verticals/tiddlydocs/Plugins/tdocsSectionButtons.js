config.macros.docSectionButtons = {};
config.macros.docSectionButtons.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
        if(typeof(tiddler.fields['server.host']) === "string") {
                var a = createTiddlyElement(place, "a", null, 'button');
                a.setAttribute('href', tiddler.fields['server.host']+tiddler.fields['server.workspace']+'/tiddlers/'+tiddler.title+'.wiki');
                var img = document.createElement('img');
                img.src = 'http://www.sheffieldhealthyschools.co.uk/images/icons/link_icon.png';
                a.appendChild(img);
                createTiddlyText(a, 'Permalink');
                var a2 = createTiddlyElement(place, "a", null, 'button');
                a2.setAttribute('href',  tiddler.fields['server.host']+tiddler.fields['server.workspace']+'/tiddlers/'+tiddler.title+'.atom');
                var img = document.createElement('img');
                img.src = 'http://www.acdivoca.org/852571DC00681414/Lookup/RSS-feed-small-PNG/$file/RSS-feed-small-PNG.png';
                a2.appendChild(img);
                createTiddlyText(a2, 'RSS');
        }
};

