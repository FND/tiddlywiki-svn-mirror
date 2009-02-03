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
	
//	var flickr = new flickrAdaptor();
//	flickr.openHost();
//	context.host = "http://api.flickr.com/services/feeds/photos_public.gne?ids=22127230@N08";
//	flickr.getWorkspaceList(context);
	
	var delicious = new deliciousAdaptor();
	delicious.openHost();
	context.host = "http://feeds.delicious.com/v2/json/simonmcmanus";
	delicious.getWorkspaceList(context);
	
	var wordpress = new wordpressAdaptor();
	wordpress.openHost();
	context.host = "http://simonmcmanus.wordpress.com";
	wordpress.getWorkspaceList(context);
	
	var trac = new tracAdaptor();
	trac.openHost();
	context.host = "http://trac.tiddlywiki.org/timeline?format=rss";
	trac.getWorkspaceList(context);
	createTiddlyElement(place, "h4", null, null, "loading...");
};

config.macros.lifeStream.display = function (place, params)
{
	removeChildren(place);
	setStylesheet(".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;  margin:1px; float:none}"+
	".tiddler .button:hover,.tiddler .button	 {background-repeat:no-repeat; float:none;  }"+
	".textSpace {padding-top:1px}"+
	".tiddler .button, .tiddler .button:hover {padding:5px; margin:5px}"+
	".noFloat {float:none; background-color:red;}"+
	".stream { display: block; padding:1px; margin:1px ; max-width:500px;  min-height:20px; }"+
	".imgClass {float:left; display:block;padding-right:10px}");
	var tiddlers = store.reverseLookup("tags","excludeLists",false,"modified");
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	lastDay ="";
	var today = new Date;
	var yesterday= new Date()
	yesterday.setDate(yesterday.getDate()-1);
	for(var t=tiddlers.length-1; t>=last; t--) {
		
		if(tiddlers[t].isTagged("Notes") ||["flickr", "twitter", "wordpress", "delicious", 
"trac"].contains(tiddlers[t].fields["server.type"])) {

			if(typeof(tiddlers[t]['modified'])!='undefined'){
			//	console.log(tiddlers[t]['created']+tiddlers[t].fields["server.type"]);
				var theDay = tiddlers[t]['modified'].convertToLocalYYYYMMDDHHMM().substr(0,8);


			if(theDay != lastDay) {
				if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==today.formatString("DD/MM/YYYY"))
					createTiddlyElement(place, "h3", null, null,  "Today");
				else if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==yesterday.formatString("DD/MM/YYYY"))
					createTiddlyElement(place, "h3", null, null,  "Yesterday");
				else
					createTiddlyElement(place, "h3", null, null,  
tiddlers[t]['modified'].formatString("DD/MM/YYYY"));
				lastDay = theDay;
			}	
			
			}
	}
		switch(tiddlers[t].fields['server.type']){
			case "wordpress" :
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "http://www.mrblogger.com/wp-content/wordpress-icon-128.png";
				img.width = "20";
				img.height = "20";
				img.style.border ="0px";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream wordpressStream");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				wikify("'''"+tiddlers[t].text+"'''\n\r"+tiddlers[t].fields["url"],slider);			
			break;
			case "trac":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "http://mousebender.files.wordpress.com/2007/07/trac_logo.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream tracStream");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				wikify(tiddlers[t].fields["url"],slider);			
			break;
			case "flickr":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = tiddlers[t].text;
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);		
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				addClass(sliderButton,"stream flickrStream");
				wikify("[img["+tiddlers[t].text+"]]\n\r"+tiddlers[t].fields['link']+"\n\r"+tiddlers[t].created,slider);
				createTiddlyElement(sliderButton, "div", null, "noFloat");
			break;
			case "twitter":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = tiddlers[t].fields['user_img'];
				img.width = "20";
				img.height = "20";
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
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "http://ransom.redjar.org/images/delicious_icon.gif";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				addClass(sliderButton,"stream deliciousStream");
				wikify(tiddlers[t].text+"\n\r"+tiddlers[t].created,slider);
			break;
			default:
				if(tiddlers[t].isTagged("Notes")){
					var img = createTiddlyElement(null, "img", null, "imgClass");
					img.src = "http://www.iconspedia.com/uploads/578075880.png";
					img.width = "20";
					img.height = "20";
					var slider = config.macros.slider.createSlider(place, "", "");
					addClass(slider,"slider");
					var sliderButton = findRelated(slider,"button","className","previousSibling");
					sliderButton.appendChild(img);
					createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
					addClass(sliderButton,"stream deliciousStream");
					wikify(tiddlers[t].text+"\n\r"+tiddlers[t].created,slider);
					

				}
		}
	}
};
