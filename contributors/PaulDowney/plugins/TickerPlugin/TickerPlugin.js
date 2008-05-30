/***
|''Name:''|TickerPlugin|
|''Description:''|Periodically Refresh Tiddlers tagged with 'ticker'|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TickerPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

depends upon YYYYMMDDHHMMSSMMMPlugin.js

ticker tiddlers are:
* tagged "ticker"

***/

//{{{
if(!version.extensions.TickerPlugin) {
version.extensions.TickerPlugin = {installed:true};

config.options.txtTickerInterval = undefined;
config.optionsDesc.txtTickerInterval = "~Ticker interval in seconds";
            
config.macros.Ticker = {

	hiddenPlace: null,	// element to wikify closed tiddlers
	tag : "ticker",		// tag for finding tiddlers to refresh
	enabled: true,		// disabling will still tick, but won't invoke tiddlers
	disabled: false,	// setting will stop the ticking, forever!
	min_interval: 1,	// minimum interval between ticks in seconds

	init: function() {
		this.tick();
	},

	tick: function() {
		var me = config.macros.Ticker;
		if(me.disabled){
			return;
		}
		var tiddlers = store.getTaggedTiddlers(me.tag);
		var interval = config.macros.Ticker.getInterval();

		for(var i=0;i<tiddlers.length;i++){
			var remaining = me.checkTiddler(tiddlers[i]);
			if(remaining && remaining < interval) {
				interval = remaining;
			}
		}
		if (interval <= 0) {
			interval = me.getInterval(me.min_interval);
		}
		console.log("remaining: ", interval);
		window.setTimeout(arguments.callee, interval);
	},

	getInterval: function(interval) {
		var me = config.macros.Ticker;
		if(isNaN(parseInt(interval,10))) {
			interval = parseInt(me.txtTickerInterval,10);
			if(isNaN(interval)) {
				interval = 2;
			}
		}
		return interval * 1000;
	},

	checkTiddler: function(tiddler) {
		var me = config.macros.Ticker;
		var now = new Date();
		var interval = me.getInterval(tiddler.fields.ticker_interval);
		var lastcalled;

		if (!isNaN(tiddler.fields.ticker_lastcalled)){
		    lastcalled = Date.convertFromYYYYMMDDHHMMSSMMM(tiddler.fields.ticker_lastcalled);
		}
		if (isNaN(lastcalled)){
		    lastcalled = 0;
		}
		if (isNaN(tiddler.fields.ticker_count)){
			tiddler.fields.ticker_count = 0;
		}
		//if (now <= (lastcalled+interval)){
			me.invokeTiddler(tiddler);
			tiddler.fields.ticker_lastcalled = now.convertToYYYYMMDDHHMMSSMMM();
			tiddler.fields.ticker_count++;
			return interval;
		//}
		return (interval + lastcalled - now);
	},

	invokeTiddler: function(tiddler) {
	    var s = story.refreshTiddler(tiddler.title,null,true);
	    if (!story.refreshTiddler(tiddler.title,null,true)) {
		    var me = config.macros.Ticker;
		    wikify(tiddler.text,null,null,null);
	    }
	}
};

} //# end of 'install only once'
//}}}
