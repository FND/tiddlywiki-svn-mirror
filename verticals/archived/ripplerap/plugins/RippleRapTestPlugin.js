/***
|''Name:''|rippleRapTestPlugin|
|''Description:''|RippleRap test harness|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RippleRapTestPlugin.js |
|''Version:''|0.0.6|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RippleRapTestPlugin) {
version.extensions.RippleRapTestPlugin = {installed:true};

//rssSynchronizer = null;

config.macros.rippleRapTest = {};

config.macros.rippleRapTest.init = function()
{
	//rssSynchronizer = new RssSynchronizer();
	//rssSynchronizer.init();
};

config.macros.rippleRapTest.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	createTiddlyButton(place,"Start RSS synch","Start RSS synch",config.macros.rippleRapTest.onClick);
};


config.macros.rippleRapTest.onClick = function()
{
	rssSynchronizer.makeRequest();
	//rssSynchronizer.doPut();
	//var t = new Timer();
	//t.set(rssSynchronizer,RssSynchronizer.prototype.doSync,10000);
	//t.start();
};

function Timer()
{
	this.tickObj = null;
	this.tickFn = null;
	this.timerID = null;
	this.interval = 0;
	this.isActive = false;
}

Timer.prototype.set = function(tickObj,tickFn,duration)
{
	if(tickObj)
		this.tickObj = tickObj;
	if(tickFn)
		this.tickFn = tickFn;
	if(duration)
		this.duration = duration;
};

Timer.prototype.start = function()
{
	this.isActive = true;
	this.tick();
	var me = this;
	this.timerID = window.setInterval(function() {me.tick.call(me);},this.interval);
};

Timer.prototype.stop = function()
{
	this.isActive = false;
	window.clearInterval(this.timerID);
	this.timerID = null;
};

Timer.prototype.tick = function()
{
	if(this.isActive) {
		if(this.tickObj && this.tickFn) {
			this.tickFn.call(this.tickObj);
		}
	}
};


} //# end of 'install only once'
//}}}
