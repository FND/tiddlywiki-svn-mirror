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


config.macros.imageSelector = {};
config.macros.imageSelector.handler = function(place) {
	var images =  store.reverseLookup("tags","image",true,'modified');
	var col1 = createTiddlyElement(place, "span", "imgSelCol1", "imgCol");
	var col2 = createTiddlyElement(place, "span", "imgSelCol2", "imgCol");
	var col3 = createTiddlyElement(place, "span", "imgSelCol3", "imgCol");

	var count = 1;
	for(var t=images.length-1; t>=0; t--) {
	    var i = images[t];
		if(count == 1)
			config.macros.imageSelector.buildImg(col1, i);
		else if(count == 2)
			config.macros.imageSelector.buildImg(col2, i);
		else if(count == 3)
			config.macros.imageSelector.buildImg(col3, i);
		
		if(count > 3)
			count = 1;
		else
			count++;
	}
};

config.macros.imageSelector.onImgClick = function() {
	if(jQuery(this).hasClass('selectedImage')){
			jQuery(this).removeClass('selectedImage');
	}else{
		jQuery(this).addClass('selectedImage');			
	}
};

config.macros.imageSelector.buildImg = function(place, tiddler) {
    var img = createTiddlyElement(place, "img",  null, 'resize');
    img.src = tiddler.fields['server.host']+"recipes/"+tiddler.fields['server.recipe']+"/tiddlers/"+tiddler.fields['server.title'];
	img.onclick = config.macros.imageSelector.onImgClick;
	createTiddlyElement(place, "br");
	return img;
};

// used to create a html string of all the images which have been selected
config.macros.imageSelector.builtSelectedImgHtml = function() {
	var html = [];
	jQuery('.selectedImage').each(function(){
		html.push("<img src='"+this.src+"' />");
	});
	if(html.length > 0){
		return html.join(" ");
	}else {
		return "";
	}
}

setStylesheet(store.getTiddlerText('imageSelector##StyleSheet'), 'df');

//}}}

/***
!StyleSheet

.imgCol {
	float:left;
}

img.resize {
	max-width: 130px;
	height : auto;
	margin:1em;
}

img.resize {
	width: auto;
	max-height : 130px;
}

img.selectedImage{
	border:2px solid red;
}

***/