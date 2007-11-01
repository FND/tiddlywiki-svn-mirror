//{{{

/* Update on 09/10/07: SIMPLIFICATION
 * No longer offering a choice of streams by default
 * Boolean parameter provided to specify whether we are working with streams */

config.macros.tiddlyChatterSetup = {};

config.macros.tiddlyChatterSetup.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	params = paramString.parseParams("anon",null,true,false,false);
	// using_streams defines whether we are working with multiple streams
	var using_streams = getParam(params,"using_streams",null);
	
	var streamManagementWrapper = createTiddlyElement(place,"div","streamManagementWrapper");
	var channelBox;
	if(using_streams) {
		// create an interface for handling streams
		// a streams is a feed you publish
		// add a button to create new streams
		var channelWrapper = createTiddlyElement(streamManagementWrapper,"div","channelWrapper");
		channelBox = createTiddlyElement(channelWrapper,"div","channelBox");
		var newChannelButton = createTiddlyButton(channelBox,"New stream","New stream",this.reveal);
		createTiddlyElement(channelBox,"br");
		// set up the new channel UI to reveal when 'new channel' is clicked
		var newChannelBox = createTiddlyElement(channelWrapper,"div","newChannelBox");
		newChannelBox.style.display = "none";
		createTiddlyElement(newChannelBox,"span",null,null,"Please provide a name for your stream");
		createTiddlyElement(newChannelBox,"br");
		createTiddlyElement(newChannelBox,"span",null,null,"Stream:");
		var channelName = createTiddlyElement(newChannelBox,"input","newChannelName");
		createTiddlyButton(newChannelBox,"create","Create stream",this.onClickNewChannel);
		createTiddlyElement(newChannelBox,"br");
	}
	// create an interface for handling subscriptions
	// we do this whether or not using_streams is true
	// a subscription is to someone else's stream
	// add a button to create new subscriptions
	var subscriptionWrapper = createTiddlyElement(streamManagementWrapper,"div","subscriptionWrapper");
	var subscriptionBox = createTiddlyElement(subscriptionWrapper,"div","subscriptionBox");
	var newSubscriptionButton = createTiddlyButton(subscriptionBox,"New subscription","New subscription",this.reveal);
	createTiddlyElement(subscriptionBox,"br");
	// set up the new subscription UI to reveal when 'new subscription' is clicked
	var newSubscriptionBox = createTiddlyElement(subscriptionWrapper,"div","newSubscriptionBox");
	newSubscriptionBox.style.display = "none";
	createTiddlyElement(newSubscriptionBox,"span",null,null,"Please point to the stream list you want to subscribe to");
	createTiddlyElement(newSubscriptionBox,"br");
	createTiddlyElement(newSubscriptionBox,"span",null,null,"URL:");
	var subscriptionURL = createTiddlyElement(newSubscriptionBox,"input","newSubscriptionURL");
	createTiddlyButton(newSubscriptionBox,"go","View stream list",this.onClickNewSubscription);
	createTiddlyElement(newSubscriptionBox,"br");
	
	// a stream is defined as a tiddler tagged with systemServer, channel and the id of the channel
	// the id is what you tag your tiddler with to put it in that channel
	// a subscription is defined as a tiddler tagged with systemServer, channel, subscription and the id of the channel
	// a subscription is also a channel, in that you can subscribe to it
	var channels = [];
	var subscriptions = [];
	if (using_streams) {
		store.forEachTiddler(function(title,tiddler) {
			if (tiddler.isTagged("systemServer") && tiddler.isTagged("channel")) {
				channels.push(tiddler);
				if (tiddler.isTagged("subscription")) {
					subscriptions.push(tiddler);
				}
			}
		});
		// the channels array now has all the channel tiddlers in it, so we add them to the channelBox
		for (var i=0;i<channels.length;i++) {
			createTiddlyLink(channelBox,channels[i].title,true);
			// if the channel is a subscription too, flag this to the user
			if (channels[i].isTagged("subscription")) {
				wikify("// - one of your own subscriptions//",channelBox);
			}
			createTiddlyElement(channelBox,"br");
		}
	} else {
		store.forEachTiddler(function(title,tiddler) {
			if (tiddler.isTagged("systemServer") && tiddler.isTagged("published")) {
				subscriptions.push(tiddler);
			}
		});
	}
	// the subscriptions array now has all the subscriptions tiddlers in it, so we add them to the subscriptionBox
	// we do this whether or not using_streams is true
	var ownPath = document.location.href.replace(/.html$/,"");
	for (var i=0;i<subscriptions.length;i++) {
		createTiddlyLink(subscriptionBox,subscriptions[i].title,true);
		// if the url of a subscription is the same as the page (minus the file extension)
		// flag that to the user
		var feedPath = store.getTiddlerSlice(subscriptions[i].title,"URL").replace(/.xml$/,"");
		if (ownPath == feedPath) {
			wikify("// - this is your own ~ChatterFeed//",subscriptionBox);
		} else {
			wikify("// - <html>" + store.getTiddlerSlice(subscriptions[i].title,"URL") + "</html>//",subscriptionBox);
		}
		createTiddlyElement(subscriptionBox,"br");
	}
	return streamManagementWrapper;
};

// onclick for creating a new channel; 'this' refers to the button
config.macros.tiddlyChatterSetup.onClickNewChannel = function() {
	var channelName = this.previousSibling.value;
	// create a new tiddler tagged with channel, systemServer and whatever id the user specified
	// a channel's filter is of the form [tag[public id]], where id is the same as above
	// we leave the URL field blank and let that be created by the subscription mechanism
	var tags = "channel systemServer";
	tags += " " +channelName;
	var tiddlerBody = "|''Type:''|RSS|\n|''URL:''||\n|''Workspace:''||\n|''TiddlerFilter:''|[tag[public "+channelName+"]]|";
	store.saveTiddler(channelName,channelName,tiddlerBody,config.options.txtUserName,null,tags);
	var this_tiddler = story.findContainingTiddler(this);
	story.refreshTiddler(this_tiddler.getAttribute("tiddler"),this_tiddler.getAttribute("template"),true);
};

// onclick after clicking the new subscription button; 'this' refers to the button
config.macros.tiddlyChatterSetup.onClickNewSubscription = function() {
	var subscriptionURL = document.getElementById("newSubscriptionURL").value;
	var place = document.getElementById("newSubscriptionBox");
	// load up the url provided and show a list of channels to subscribe to
	// assume we are pointing at a TiddlyWiki
	var adaptor = new FileAdaptor();
	var context = {};
	context.place = place;
	adaptor.openHost(subscriptionURL,context,null,config.macros.tiddlyChatterSetup.onOpenHost);
};

config.macros.tiddlyChatterSetup.onOpenHost = function(context,userParams) {
	if(context.status !== true) {
		displayMessage("error opening host: " + context.statusText);
	} else {
		var filter = "[tag[channel systemServer]]";
		context.adaptor.getTiddlerList(context,userParams,config.macros.tiddlyChatterSetup.onGetTiddlerList,filter);
	}
};

config.macros.tiddlyChatterSetup.onGetTiddlerList = function(context,userParams) {
	// collect a list of existing channels to check against
	var channels = [];
	store.forEachTiddler(function(title,tiddler) {
		if (tiddler.isTagged("systemServer") && tiddler.isTagged("channel")) {
			channels.push(tiddler);
		}
	});
	// offer a list of channels to subscribe to
	for (var i=0; i<context.tiddlers.length; i++) {
		createTiddlyElement(context.place,"span",null,null,context.tiddlers[i].title);
		var box = createTiddlyCheckbox(context.place,"tick me",false,function(){
			var subscribeButton = document.getElementById("subscribeButton");
			if(this.checked==true) {
				subscribeButton.tiddler_title = this.previousSibling.textContent;
			} else {
				subscribeButton.tiddler_title = "";
			}
		});
		// if the name of a potential subscription is the same as one of your own channels,
		// flag that to the user
		for (var t in channels) {
			if (channels[t].title == context.tiddlers[i].title) {
				wikify("// - this could be your own content - learn more [[here|ReciprocalSubscriptions]]//",context.place);
			}
		}
		createTiddlyElement(context.place,"br");
	}
	var subscribeButton = createTiddlyButton(context.place,"subscribe","Subscribe",config.macros.tiddlyChatterSetup.onClickSubscribe,null,"subscribeButton");
	subscribeButton.context = context;
};

// onclick for clicking the subscribe button; 'this' refers to the button
config.macros.tiddlyChatterSetup.onClickSubscribe = function() {
	var tiddler = {};
	var tiddler_title = this.tiddler_title;
	for (var t in this.context.tiddlers) {
		if (this.context.tiddlers[t].title == this.tiddler_title) {
			tiddler = this.context.tiddlers[t];
		}
	}
	if (tiddler) {
		// now copy the tiddler across, adding in the 'subscription' tag and rebuilding the body with the URL
		var adaptor_store = this.context.adaptor.store;
		var type_field = adaptor_store.getTiddlerSlice(tiddler.title,"Type");
		var url_field = adaptor_store.getTiddlerSlice(tiddler.title,"URL");
		var workspace_field = adaptor_store.getTiddlerSlice(tiddler.title,"Workspace");
		var filter_field = adaptor_store.getTiddlerSlice(tiddler.title,"TiddlerFilter");
		var subscriptionTemplate = "|''Type:''|%0|\n|''URL:''|%1|\n|''Workspace:''|%2|\n|''TiddlerFilter:''|%3|";
		var text = subscriptionTemplate.format([type_field,url_field,workspace_field,filter_field]);
		tiddler.tags.push("subscription");
		store.saveTiddler(tiddler.title, tiddler.title, text, tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
		var this_tiddler = story.findContainingTiddler(this);
		story.refreshTiddler(this_tiddler.getAttribute("tiddler"),this_tiddler.getAttribute("template"),true);
	} else {
		displayMessage("problem with matching: " + tiddler_title);
	}
};

// onclick for "new" buttons; 'this' refers to the button
config.macros.tiddlyChatterSetup.reveal = function() {
	var slideBox = this.parentNode.nextSibling;
	var isOpen = slideBox.style.display != "none";
	if(anim && typeof Slider == "function")
		anim.startAnimating(new Slider(slideBox,!isOpen,null,"none"));
	else
		slideBox.style.display = isOpen ? "none" : "block";
};

// Extension to TiddlyWiki.js
// Filter a list of tiddlers
TiddlyWiki.prototype.filterTiddlers = function(filter)
{
	var results = [];
	if(filter) {
		var re = /(\w+)|(?:\[([ \w]+)\[([ \w]+)\]\])|(?:\[\[([ \w]+)\]\])/mg;
		var match = re.exec(filter);
		while(match) {
			if(match[1]) {
				var tiddler = this.fetchTiddler(match[1])
				if(tiddler)
					results.push(tiddler);
			} else if(match[2]) {
				if(match[2]=="tag") {
					this.forEachTiddler(function(title,tiddler) {
						if(tiddler.isTaggedAllOf(match[3].split(" "))) {
							results.push(tiddler);
						}
					});
				}
			} else if(match[4]) {
				var tiddler = this.fetchTiddler(match[4])
				if(tiddler)
					results.push(tiddler);
			}			
			match = re.exec(filter);
		}
	} else {
		this.forEachTiddler(function(title,tiddler) {results.push(tiddler);});
	}
	return results;
};

//}}}