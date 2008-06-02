/***
|''Name:''|TickerPlugin|
|''Description:''|Periodically Refresh Tiddlers tagged with 'ticker', evaluating those tagged with 'javaScript'|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TickerPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|

!!!Dependencies
This code epends upon a number of bug fixes to the Date routines supplied in the [[YYYYMMDDHHMMSSMMMPlugin]] 

!!!Options
|<<option txtTickerInterval>>|<<message config.optionsDesc.txtTickerInterval>>|
|<<option chkTickerEval>>|<<message config.optionsDesc.chkTickerEval>>|
|<<option chkTickerRefresh>>|<<message config.optionsDesc.chkTickerRefresh>>|

!!!Source Code
***/

//{{{
if(!version.extensions.TickerPlugin){
version.extensions.TickerPlugin = {installed:true};

config.options.txtTickerInterval = 60;
config.optionsDesc.txtTickerInterval = "Ticker interval in seconds";

config.options.chkTickerEval = true;
config.optionsDesc.chkTickerEval = "Ticker enable evaluation of JavaScript tiddlers";
            
config.options.chkTickerRefresh = true;
config.optionsDesc.chkTickerRefresh = "Ticker enable refreshing of tiddlers";
            
config.macros.Ticker = {

	hiddenPlace: null,	// element to wikify closed tiddlers
	tag : {
		ticker: "ticker",		// tag for finding tiddlers to refresh
		eval: "javaScript"		// tag for refreshed tiddlers to evaluate
	},
	enabled: true,		// disabling will still tick, but won't invoke tiddlers
	disabled: false,	// setting will stop the ticking, forever!
	minInterval: 1,		// minimum interval between ticks in seconds

	init: function() {
		this.tick();
	},

	tick: function() {
		var me = config.macros.Ticker;
		if(me.disabled){
			return;
		}
		var tiddlers = store.getTaggedTiddlers(me.tag.ticker);
		var interval = config.macros.Ticker.getInterval();

		for(var i=0;i<tiddlers.length;i++){
			var remaining = me.checkTiddler(tiddlers[i], new Date());
			if(remaining > 0 && remaining < interval) {
				interval = remaining;
			}
		}
		if(interval <= 0) {
			interval = me.getInterval(me.minInterval);
		}
		window.setTimeout(arguments.callee, interval);
	},

	getInterval: function(interval) {
		var me = config.macros.Ticker;
		if(isNaN(interval)) {
			interval = parseInt(config.options.txtTickerInterval,10);
			if(isNaN(interval)) {
				interval = 60;
			}
		}
		return interval * 1000;
	},

	checkTiddler: function(tiddler, now) {
		var me = config.macros.Ticker;
		var interval = me.getInterval(tiddler.fields.ticker_interval);
		var lastcalled;

		if(isNaN(tiddler.fields.ticker_count)){
			tiddler.fields.ticker_count = 0;
		}
		if(!isNaN(tiddler.fields.ticker_lastcalled)){
			lastcalled = Number(Date.convertFromYYYYMMDDHHMMSSMMM(tiddler.fields.ticker_lastcalled));
		}
		if(isNaN(lastcalled)){
			lastcalled = 0;
		}
		if(Number(now) >= (lastcalled+interval)){
			me.invokeTiddler(tiddler);
			tiddler.fields.ticker_lastcalled = now.convertToYYYYMMDDHHMMSSMMM();
			tiddler.fields.ticker_count++;
			return interval;
		}
		return (interval + lastcalled - Number(now));
	},

	invokeTiddler: function(tiddler) {
		var me = config.macros.Ticker;
		var s = story.getTiddler(tiddler.title);
		if(s && "EditTemplate" == s.getAttribute("template")){
			return;
		}
		if(config.options.chkTickerEval){
			if(tiddler.isTagged(me.tag.eval)) {
				eval(tiddler.text);
				return;
			}
		}
		if(config.options.chkTickerRefresh){
			if(!story.refreshTiddler(tiddler.title,null,true)){
				var me = config.macros.Ticker;
				wikify(tiddler.text,null,null,null);
			}
		}
	}
};

} //# end of 'install only once'
//}}}
