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
	
	
	displayMessage("0");
	var delicious = new deliciousAdaptor();
	delicious.openHost();
	displayMessage("1");
	context.host = "http://feeds.delicious.com";
	delicious.getWorkspaceList(context);
	
	
	
	setStylesheet(".twitterStream { background-repeat:no-repeat; background-image:url(http://assets0.twitter.com/images/twitter.png);}"+
	".flickrStream { }"+
	".stream {background-color:#111;color:black; padding:10px; margin:10px ; border:1px solid #111;}"+
".stream:hover {background-color:#333; color:black; border:1px solid #111; cursor:pointer;} .stream:hover h1 {color:white}"+
"h1 {border-bottom:0px;underline:none; padding-top:20px;}");

	var field = params[0] || "modified";
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	for(var t=tiddlers.length-1; t>=last; t--) {
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
					console.log(store.getTiddlerText(this.title));
					box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+wikifyStatic(store.getTiddlerText(this.title))+"</h3><br />";
					box.style.position = 'absolute';
					box.style.width= "800px";
					var content = createTiddlyElement(box, "div");
					ccTiddlyAdaptor.center(box);
					ccTiddlyAdaptor.showCloak();
				};

				wikify("[img[http://jonsthoughtsoneverything.com/projects/xbmc/flickr/flickrLogo.png]]"+tiddlers[t].text, li);
			break;
			case "twitter":
				var li = createTiddlyElement(place, "div", null, "twitterStream stream");
				li.title = tiddlers[t].title;
					li.onclick = function() {
						setStylesheet(
						"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
						"html > body > #backstageCloak {height:"+window.innerHeight*2+"px;}"+
						"#errorBox {border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
						var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
						console.log(store.getTiddlerText(this.title));
						box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+wikifyStatic(store.getTiddlerText(this.title))+"</h3><br />";
						box.style.position = 'absolute';
						box.style.width= "800px";
						var content = createTiddlyElement(box, "div");
						ccTiddlyAdaptor.center(box);
						ccTiddlyAdaptor.showCloak();
					};
				wikify("!"+tiddlers[t].text, li);
			break;
			default:
			//	createTiddlyElement(ul,"li",null,"listLink").appendChild(createTiddlyLink(place,tiddlers[t].title,true));
		}
	}
};
