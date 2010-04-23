


config.macros.lifeStream = {};
config.macros.lifeStream.handler = function(place,macroName,params)
{
	var context = {};
	context.callback = function() {
		config.macros.lifeStream.display(place, params);
	};
	
	/*

	
var wordpress = new wordpressAdaptor();
wordpress.openHost();
context.host = document.domain+"/wordpress/";
wordpress.getWorkspaceList(context);
	
	*/



	var github = new githubAdaptor();
	github.openHost();
	context.host = document.domain+"/github/simonmcmanus.json";
	github.getWorkspaceList(context);
	
	
	

	var delicious = new deliciousAdaptor();
	delicious.openHost();
	context.host = document.domain+"/delicious/v2/json/simonmcmanus";
	delicious.getWorkspaceList(context);
		
	context.host = document.domain+"/twitter/statuses/user_timeline/simonmcmanus";
	var twitter = new twitterAdaptor();
	twitter.openHost();
	twitter.getWorkspaceList(context);
	
	var flickr = new flickrAdaptor();
	flickr.openHost();
	context.host = document.domain+"/flickr/services/feeds/photos_public.gne?ids=22127230@N08";
	flickr.getWorkspaceList(context);
	
	
	var trac = new tracAdaptor();
	trac.openHost();
	context.host = document.domain+"/trac/timeline?format=rss";
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
		if(tiddlers[t].isTagged("note") ||["flickr", "twitter", "wordpress", "delicious", "trac"].contains(tiddlers[t].fields["original_server.type"])) {
			if(typeof(tiddlers[t]['modified'])!='undefined'){
				var theDay = tiddlers[t]['modified'].convertToLocalYYYYMMDDHHMM().substr(0,8);
			if(theDay != lastDay) {
				if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==today.formatString("DD/MM/YYYY"))
					createTiddlyElement(place, "h3", null, null,  "Today");
				else if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==yesterday.formatString("DD/MM/YYYY"))
					createTiddlyElement(place, "h3", null, null,  "Yesterday");
				else
					createTiddlyElement(place, "h3", null, null, tiddlers[t]['modified'].formatString("DD/MM/YYYY"));
				lastDay = theDay;
			}		
		}
	}
		switch(tiddlers[t].fields['original_server.type']){
			case "wordpress" :
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "plugins/lifestream/files/images/wordpress.png";
				img.width = "20";
				img.height = "20";
				img.style.border ="0px";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream wordpressStream");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
			//	wikify("'''"+tiddlers[t].text+"'''\n\r"+tiddlers[t].fields["url"],slider);	
				wikify(tiddlers[t].fields["url"]+"\n\r"+tiddlers[t].fields.prettyDate,slider);	
			break;
			case "trac":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "/static/trac.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream tracStream");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				wikify(tiddlers[t].fields["url"]+"\n\r"+tiddlers[t].fields.prettyDate,slider);		
				
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
				wikify("[img["+tiddlers[t].text+"]]\n\r"+tiddlers[t].fields['link']+"\n\r"+tiddlers[t].fields.prettyDate,slider);
				createTiddlyElement(sliderButton, "div", null, "noFloat");
			break;
			case "twitter":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				//img.src = tiddlers[t].fields['user_img'];
				img.src= "/static/twitter.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				
				var div = createTiddlyElement(sliderButton, "div", null, "textSpace");
				div.innerHTML =  tiddlers[t].text;
				addClass(sliderButton,"stream twitterStream");
				createTiddlyElement(sliderButton, "div", null, "noFloat");
				wikify(tiddlers[t].fields['url']+"\n\r"+tiddlers[t].fields.prettyDate,slider);
			break;
			case "github":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src= "http://prob_prod.s3.amazonaws.com/github-icon-2.png?1270218957";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				
				var div = createTiddlyElement(sliderButton, "div", null, "textSpace");
				div.innerHTML =  tiddlers[t].title;
				addClass(sliderButton,"stream twitterStream");
				createTiddlyElement(sliderButton, "div", null, "noFloat");
				wikify(tiddlers[t].text+"\n\r"+tiddlers[t].fields.prettyDate,slider);
			break;
			case "delicious":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "/static/delicious.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				addClass(sliderButton,"stream deliciousStream");
				wikify(tiddlers[t].text+"\n\r"+tiddlers[t].fields.prettyDate,slider);
			break;
			default:
				if(tiddlers[t].isTagged("note")){
					var img = createTiddlyElement(null, "img", null, "imgClass");
					img.src = "/static/note.png";
					img.width = "20";
					img.height = "20";
					var slider = config.macros.slider.createSlider(place, "", "");
					addClass(slider,"slider");
					var sliderButton = findRelated(slider,"button","className","previousSibling");
					sliderButton.appendChild(img);
					createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
					addClass(sliderButton,"stream deliciousStream");
					wikify(tiddlers[t].text+"\n\r"+humane_date(tiddlers[t].modified),slider);
			}
		}
		
	}
};
