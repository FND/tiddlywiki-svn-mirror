/***
|''Name''|imageSelectorPlugin|
|''Description''|Displays all tiddlers tagged image|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''|assumes running on tiddlyweb with binary tiddlers|

!Usage
{{{

<<imageSelector>>

}}}

!Code
***/

//{{{


config.macros.imageSelector = {
	onImgClick: null
};
config.macros.imageSelector.handler = function(place) {
	var images =  store.reverseLookup("tags","image",true,'modified');
	for(var t=images.length-1; t>=0; t--) {
	    var i = images[t];
	    var img = createTiddlyElement(place, "img",  null, 'resize');
	    img.src = i.fields['server.host']+"recipes/"+i.fields['server.recipe']+"/tiddlers/"+i.fields['server.title'];
		img.onclick = config.macros.imageSelector.onImgClick;
		if(t % 3 == 0)
			createTiddlyElement(place, "br");
	}
}

//}}}
