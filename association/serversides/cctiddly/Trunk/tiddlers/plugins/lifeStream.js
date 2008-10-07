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
	".flickrStream { }"+
	"a.twitterStream {background:url(http://www.iconarchive.com/icons/fasticon/web-2/Twitter-256x256.png); }"+
	"a.deliciousStream {background:url(http://ransom.redjar.org/images/delicious_icon.gif);}"+
	".tiddler .button {background-repeat:no-repeat;  padding-left:50px; }"+
	".stream { background-repeat:no-repeat; display: block; width:100%; background-color:#111;color:white; padding:10px; margin:10px ; width:90%; border:1px solid #111;}"+
".stream:hover { border:1px solid #111; cursor:pointer;} .stream:hover h1 {color:white}"+
"h1 {border-bottom:0px;underline:none; padding-top:20px;}");

	var field = params[0] || "modified";
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	for(var t=tiddlers.length-1; t>=last; t--) {
		
		
				createTiddlyElement(place, "br");
		
	
	
	
	
		switch(tiddlers[t].fields['server.type']){
			case "flickr":
				var li = createTiddlyElement(place, "div", null, "flickrStream stream");
				li.title = tiddlers[t].title;
				


				
				li.onclick = function() {
					setStylesheet(
					"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
					"html > body > #backstageCloak {height:"+window.innerHeight*2+"px;}"+
					"#errorBox {border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
					var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
					box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+wikifyStatic(store.getTiddlerText(this.title))+"</h3><br />";
					box.style.position = 'absolute';
					box.style.width= "800px";
					var content = createTiddlyElement(box, "div");
					ccTiddlyAdaptor.center(box);
					ccTiddlyAdaptor.showCloak();
				};

				wikify("[img[http://jonsthoughtsoneverything.com/projects/xbmc/flickr/flickrLogo.png]]"+tiddlers[t].text+" \n\r"+tiddlers[t].created, li);
				
				
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].title);
				wikify("HIHIHIH",slider);
				
				var sliderButton = findRelated(slider,"stream","className","previousSibling");
				if(!sliderButton)
				displayMessage(error);


				
				
			break;
			case "twitter":
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].text);
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream twitterStream");
				wikify("\n\r"+tiddlers[t].created,slider);
			break;
			case "delicious":
				var slider = config.macros.slider.createSlider(place, "", tiddlers[t].title);
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream deliciousStream");
				wikify("\n\r"+tiddlers[t].text+""+tiddlers[t].created,slider);
			break;
			default:
			//	createTiddlyElement(ul,"li",null,"listLink").appendChild(createTiddlyLink(place,tiddlers[t].title,true));
		}
	}
};
