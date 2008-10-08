config.macros.lifeStream = {};
config.macros.lifeStream.handler = function(place,macroName,params)
{
	var context = {};
	window.ls_callbackCount = 0;
	context.callback = function() {
		config.macros.lifeStream.display(place, params);
	};
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
config.macros.lifeStream.display(place, params);	
};

config.macros.lifeStream.display = function (place, params)
{
	setStylesheet(".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;   background-color:#111; margin:20px}"+
	".stream { background-repeat:no-repeat; display: block; color:white; padding:10px; margin:10px ; width750px; border:1px solid #111;}"+	
	".slider { background-color:#111;color:white; margin-left:20px; margin-top:-20px; padding:10px 10px 10px 50px; width:625px;border:1px solid #111;}"+	
	".tiddler a.deliciousStream,a.delicousStream:hover{padding-left:50px;background:url(http://ransom.redjar.org/images/delicious_icon.gif);background-repeat:no-repeat;  background-color:#111;}"+
	".textSpace {margin-left:10px; position:relative}"+
	".tiddler .button:hover	 { background-color:#111; border:1px solid #111;}");

	var tiddlers = store.reverseLookup("tags","excludeLists",false,"modified");
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
				wikify("\n\r[img["+tiddlers[t].text+"]]\n\r"+tiddlers[t].created,slider);
			break;
			case "twitter":
				var img = createTiddlyElement(null, "img");
				img.src = tiddlers[t].fields['user_img'];
				img.width = "50";
				img.height = "50";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace",  wikifyStatic(tiddlers[t].text));
				addClass(sliderButton,"stream twitterStream");
				wikify("\n\r"+"\n\r"+tiddlers[t].created,slider);
			break;
			case "delicious":
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].title);
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream deliciousStream");
				wikify(tiddlers[t].text+"\n\r"+tiddlers[t].created,slider);
			break;
			default:
		}
	}
};