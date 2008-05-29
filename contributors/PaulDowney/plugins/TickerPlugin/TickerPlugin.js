/***
|''Name:''|TickerPlugin|
|''Description:''|Periodically Reevaluate Tiddlers|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TickerPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

ticker tiddlers are:
* tagged "ticker"

***/

//{{{
if(!version.extensions.TickerPlugin) {
version.extensions.TickerPlugin = {installed:true};

config.options.txtTickerInterval = 60;
config.optionsDesc.txtTickerInterval = "~Ticker interval (in seconds)";
            
config.macros.Ticker = {

	hiddenPlace: null,
	tag : "ticker",

	init: function() {
		this.tick();
	},

	tick: function() {
		var now = Date();
		var tiddlers = store.getTaggedTiddlers(this.tag);
		var interval = this.getInterval();

		for(var i=0;i<tiddlers.length;i++){
			var remaining = this.action(tiddler, now);
			if(remaining < interval) {
				interval = remaining;
			}
		}

		window.setTimeout(callee, interval);
	},

	getInterval: function(interval) {
		if(isNaN(parseInt(interval,10))) {
			interval = parseInt(config.options.txtTickerInterval,10);
			if(isNaN(interval)) {
				interval = 60;
			}
		}
		return interval * 1000;
	},

	action: function(tiddler, now) {
		var interval = this.getInterval(tiddler.fields.ticker_interval);
		var lastcalled = parseInt(tiddler.fields.ticker_interval);

		this.refreshTiddler(tiddler);

		return remaining;
	},

	refreshTiddler: function(tiddler) {
	    if (!story.refreshTiddler(tiddler.title,null,true)) {
		    wikify(tiddler.text,this.hiddenPlace,null,null);
	    }
	}
};

} //# end of 'install only once'
//}}}
