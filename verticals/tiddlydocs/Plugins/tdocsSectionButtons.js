config.macros.docSectionButtons = {};
config.macros.docSectionButtons.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
        if(typeof(tiddler.fields['server.host']) === "string") {
                var a = createTiddlyElement(place, "a", null, 'button');
                a.setAttribute('href', tiddler.fields['server.host']+tiddler.fields['server.workspace']+'/tiddlers/'+tiddler.title+'.wiki');
                var img = document.createElement('img');
                img.src = '/static/mydocs_images/icon_link.png';
				img.height = '15';
				img.width = '15';
                a.appendChild(img);
                createTiddlyText(a, 'Permalink');
                var a2 = createTiddlyElement(place, "a", null, 'button');
                a2.setAttribute('href',  tiddler.fields['server.host']+tiddler.fields['server.workspace']+'/tiddlers/'+tiddler.title+'.atom');
                var img = document.createElement('img');
                img.src = '/static/mydocs_images/icon_rss.png';
                a2.appendChild(img);
                createTiddlyText(a2, 'RSS');
        }
};

