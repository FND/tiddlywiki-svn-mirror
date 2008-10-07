config.macros.lifeStream = {};
config.macros.lifeStream.handler = function(place,macroName,params)
{
	
	
	var context = {};
	context.host = "http://twitter.com";
	var twitter = new twitterAdaptor();
	twitter.openHost();
	twitter.getWorkspaceList(context);
	
	var flickr = new flickrAdaptor();
	flickr.openHost();
	context.host = "http://api.flickr.com";
	flickr.getWorkspaceList(context);
	
	var delicious = new deliciousAdaptor();
	delicious.openHost();
	context.host = "http://feeds.delicious.com";
	delicious.getWorkspaceList(context);
	

	
	config.macros.slider.createSlider = function(place,cookie,title,tooltip)
	{
		var c = cookie || "";
		var btn = createTiddlyButton(place,title,tooltip,this.onClickSlider);
		var panel = createTiddlyElement(null,"div",null,"sliderPanel");
		panel.setAttribute("cookie",c);
		panel.style.display = config.options[c] ? "block" : "none";
		place.appendChild(panel);
		return panel;
	};
	
	
	setStylesheet(".twitterStream { background-repeat:no-repeat;}"+
	"a.flickrStream, a.flickrStream:hover { background:url(http://i65.photobucket.com/albums/h239/myspacemasonry/links/ExtCommunity_Flickr_Size50x50.jpg)}"+
	"a.twitterStream, a.twitterStream:hover {background:url(http://www.ewanspence.com/blog/wp-content/themes/hemingway/styles/purple/icon_twitter.jpg); }"+
	"a.deliciousStream,a.deliciousStream:hover {background:url(http://ransom.redjar.org/images/delicious_icon.gif);}"+
	".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;  padding-left:50px; background-color:#111; margin:20px}"+
	".stream { background-repeat:no-repeat; display: block; color:white; padding:10px; margin:10px ; width:85%; border:1px solid #111;}"+	
	".slider { background-color:#111;color:white; margin-left:64px; width:84%;margin-top:-19px; padding:10px; border:1px solid #111;}"+	

	".tiddler .button:hover	 { background-color:#111; border:1px solid #333;}"
	);

	var field = params[0] || "modified";
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	for(var t=tiddlers.length-1; t>=last; t--) {
		switch(tiddlers[t].fields['server.type']){
			case "flickr":
				var img = createTiddlyElement(null, "img");
				img.src = tiddlers[t].text;
				img.width = "50";
				img.height = "50";
				var slider = config.macros.slider.createSlider(place, "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				createTiddlyText(sliderButton, tiddlers[t].title);
				addClass(sliderButton,"stream flickrStream");
				wikify("\n\r"+tiddlers[t].created,slider);
			break;
			case "twitter":
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].text);
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream twitterStream");
				wikify("\n\r"+tiddlers[t].created,slider);
			break;
			case "delicious":
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].title);
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream deliciousStream");
				wikify("\n\r"+tiddlers[t].text+""+tiddlers[t].created,slider);
			break;
			default:
			//	createTiddlyElement(ul,"li",null,"listLink").appendChild(createTiddlyLink(place,tiddlers[t].title,true));
		}
	}
};
