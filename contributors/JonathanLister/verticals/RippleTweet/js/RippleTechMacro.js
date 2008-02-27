// Requires config.macros.Microblog
config.macros.RippleTech = {};

config.macros.RippleTech.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		var platform = params[0];
		config.macros.Microblog.settings(platform);

		var uri = microblogs[platform].ListenURI;
		console.log("uri " + uri);
		var count = params[2];
		var avatars = params[3] =='avatars' ? true : false;
		var makeTiddlers = params[4] =='makeTiddlers' ? true : false;
		var context = {
				host:uri,
				place:place,
				platform:platform,
				count:count,
				avatars:avatars,
				makeTiddlers:makeTiddlers,
				rssUseRawDescription:true
				};
				
		console.log(context);
		console.log(microblogs[platform]);
	
		var adaptor = new RSSAdaptor();
		var ret = adaptor.openHost(context.host,context,params,config.macros.RippleTech.onOpenHost);
		if (typeof(ret) == "string") {
			displayMessage("problem opening host: " + ret);
			return false;
		}
		else if (ret) {
			return true;
		}
};
			
config.macros.RippleTech.onOpenHost = function(context,params) {

	console.log("in onOpenHost");
	var ret = context.adaptor.getTiddlerList(context,params,config.macros.RippleTech.convertItemsToJSON);
	if (typeof(ret) == "string") {
		displayMessage("problem opening tiddlers: " + ret);
		return false;
	}
	else if (ret) {
		return true;
	}
};

config.macros.RippleTech.convertItemsToJSON = function(context,params) {
// Requirement: convert Tiddlers to the minimal twitter format needed:
// [{created_at:modified,text:text,user:{name:modifier}},...]
	console.log("in convertItemsToJSON");
	var items = context.tiddlers;
	console.log(items);
	var JSONarray = [];
	for (var i in items) {
		var item = items[i];
		if (item instanceof Tiddler) {
			console.log(item);
			var itemObject = {};
			itemObject.created_at = item.created.formatString("ddd, DD MMM YYYY 0hh:0hh:0ss TZD");
			itemObject.text = item.text;
			itemObject.user = {};
			// this isn't really the name, but the first field that gets display by the Microblog listenHandler
			itemObject.user.name = item.title;
			if(item.modifier == "anonymous")
				itemObject.user.name += " by <a href="+item.fields.linktooriginal+">"+item.fields.source_name+"</a>";
			else
				itemObject.user.name += " by <a href="+item.fields.linktooriginal+">"+item.modifier+"</a>";
			JSONarray.push(itemObject);
		}
	}
	var JSONstring = JSONarray.toJSONString();
	console.log("going into microblog land");
	config.macros.Microblog.listenHandler(true,context,JSONstring,context.host,null);
};
