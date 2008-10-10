config.macros.lifeStream = {};
config.macros.lifeStream.handler = function(place,macroName,params)
{
	var context = {};
	context.callback = function() {
		config.macros.lifeStream.display(place, params);
	};
	context.host = "http://twitter.com/statuses/user_timeline/simonmcmanus";
	var twitter = new twitterAdaptor();
	twitter.openHost();
	twitter.getWorkspaceList(context);

var flickr = new flickrAdaptor();
	flickr.openHost();
	context.host = "http://api.flickr.com/services/feeds/photos_public.gne?ids=22127230@N08";
	flickr.getWorkspaceList(context);
		var delicious = new deliciousAdaptor();
	delicious.openHost();
	context.host = "http://feeds.delicious.com/v2/json/simonmcmanus";
	delicious.getWorkspaceList(context);
	
	var wordpress = new wordpressAdaptor();
	wordpress.openHost();
	context.host = "http://simonmcmanus.com";
	wordpress.getWorkspaceList(context);
	createTiddlyElement(place, "h3", null, null, "Loading...");
};

config.macros.lifeStream.display = function (place, params)
{
	removeChildren(place);
	setStylesheet(".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;   background-color:#111; margin:20px; float:none}"+
	".stream { background-repeat:no-repeat; display: block; color:white; padding:10px; margin:10px ; width750px; border:1px solid #111;}"+	
	".slider { background-color:#111;color:white; margin-left:20px; margin-top:-18px; padding:10px 10px 10px 50px; width:604px;border:2px solid #111; padding-left:69px;border-top:0px;}"+	
	".imgClass {float:left; display:block; padding-right:10px}"+
	".tiddler a.deliciousStream,a.delicousStream:hover{left:80px;padding-left:70px;background:url(http://ransom.redjar.org/images/delicious_icon.gif);background-repeat:no-repeat;  background-color:#111;}"+
	".tiddler a.wordpressStream,a.wordpressStream:hover{left:80px;padding-left:70px;background:url(http://tbn0.google.com/images?q=tbn:R26G1WDW9AZUaM:http://joeymoggie.net/wp-content/uploads/2007/09/wordpress_logo50x50.jpg);background-repeat:no-repeat;  background-color:#111;}"+	
	".textSpace {padding-left:60px; }"+
	
	".noFloat {float:none; background-color:red;}"+
	".tiddler .button:hover	 { background-color:#111; border:1px solid #111;}");

	var tiddlers = store.reverseLookup("tags","excludeLists",false,"modified");
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	for(var t=tiddlers.length-1; t>=last; t--) {	
		switch(tiddlers[t].fields['server.type']){
			case "wordpress" :
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].title);
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream wordpressStream");
				wikify("'''"+tiddlers[t].text+"'''\n\r"+tiddlers[t].fields["url"],slider);			
			break;
			case "flickr":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = tiddlers[t].text;
				img.width = "50";
				img.height = "50";
				var slider = config.macros.slider.createSlider(place, "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				createTiddlyText(sliderButton, tiddlers[t].title);
				addClass(sliderButton,"stream flickrStream");
				wikify("[img["+tiddlers[t].text+"]]\n\r"+tiddlers[t].fields['link']+"\n\r\n\r"+tiddlers[t].created,slider);
				createTiddlyElement(sliderButton, "div", null, "noFloat");
			break;
			case "twitter":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = tiddlers[t].fields['user_img'];
				img.width = "50";
				img.height = "50";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				
				var div = createTiddlyElement(sliderButton, "div", null, "textSpace");
				div.innerHTML =  wikifyStatic(tiddlers[t].text);
				addClass(sliderButton,"stream twitterStream");
				createTiddlyElement(sliderButton, "div", null, "noFloat");
				wikify(tiddlers[t].fields['url']+""+"\n\r"+tiddlers[t].created,slider);
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