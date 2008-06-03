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
|<<option txtTickerMinInterval>>|<<message config.optionsDesc.txtTickerMinInterval>>|
|<<option chkTickerEval>>|<<message config.optionsDesc.chkTickerEval>>|
|<<option chkTickerRefresh>>|<<message config.optionsDesc.chkTickerRefresh>>|
|<<option chkTickerWikify>>|<<message config.optionsDesc.chkTickerWikify>>|

!!!Source Code
***/

//{{{
if(!version.extensions.TickerPlugin){
version.extensions.TickerPlugin = {installed:true};

config.options.txtTickerMinInterval = 1;
config.optionsDesc.txtTickerMinInterval = "Ticker minimum interval in seconds";
config.options.txtTickerInterval = 60;
config.optionsDesc.txtTickerInterval = "Ticker maximum interval in seconds";
config.options.chkTickerEval = true;
config.optionsDesc.chkTickerEval = "Ticker evaluates tiddlers tagged with 'javaScript'";
config.options.chkTickerRefresh = true;
config.optionsDesc.chkTickerRefresh = "Ticker refreshes visible tiddlers";
config.options.chkTickerWikify = true;
config.optionsDesc.chkTickerWikify = "Ticker refreshes hidden tiddlers";
            
config.macros.Ticker = {

	disabled: false,			// setting will stop the ticking, forever!
	hiddenPlace: null,			// element to wikify closed tiddlers
	editTemplate: 'EditTemplate',		// template value to detect if a tiddler is being edited
	tag : {
		ticker: "ticker",		// tag for finding tiddlers to refresh
		eval: "javaScript"		// tag for refreshed tiddlers to evaluate
	},

	init: function(){
		this.tick();
	},

	tick: function(){
		var me = config.macros.Ticker;
		if(me.disabled){
			return;
		}
		var tiddlers = store.getTaggedTiddlers(me.tag.ticker);
		var interval = config.macros.Ticker.getInterval();

		for(var i=0;i<tiddlers.length;i++){
			var remaining = me.checkTiddler(tiddlers[i], new Date());
			if(remaining > 0 && remaining < interval){
				interval = remaining;
			}
		}
		if(interval <= 0){
			interval = parseInt(config.options.txtTickerMinInterval,10);
		}
		window.setTimeout(arguments.callee, interval);
	},

	getInterval: function(interval){
		var me = config.macros.Ticker;
		if(isNaN(interval)){
			interval = parseInt(config.options.txtTickerInterval,10);
			if(isNaN(interval)){
				interval = 60;
			}
		}
		return interval * 1000;
	},

	checkTiddler: function(tiddler, now){
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

	invokeTiddler: function(tiddler){
		var me = config.macros.Ticker;
		var s = story.getTiddler(tiddler.title);
		if(s && me.editTemplate == s.getAttribute("template")){
			return;
		}
		if(config.options.chkTickerEval){
			if(tiddler.isTagged(me.tag.eval)){
				eval(tiddler.text);
				return;
			}
		}
		if(config.options.chkTickerRefresh){
			if(story.refreshTiddler(tiddler.title,null,true)){
				return;
			}
		}
		if(config.options.chkTickerWikify){
			wikify(tiddler.text,null,null,null);
		}
	}
};

} //# end of 'install only once'
//}}}
