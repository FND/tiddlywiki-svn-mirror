/***
|''Name:''|AsyncStartupPlugin|
|''Description:''|Asynchronous display of tiddlers at startup|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Source:''|http://martinwiki.com/#AsyncStartupPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/AsyncStartupPlugin.js|
|''Version:''|0.0.1|
|''Date:''|April 15, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2|
***/

/*{{{*/
function restart()
{
	invokeParamifier(params,"onstart");
	if(story.isEmpty()) {
		invokeParamifierAsync(store.getTiddlerText("DefaultTiddlers").parseParams("open",null,false),"onstart");
	}
	window.scrollTo(0,0);
}

function AsyncParamifier(p,h)
{
	this.params = p;
	this.handler = h;
	//# p[0] is not used
	this.index = 1;
	if(!p || p.length == undefined || p.length <= 1)
		this.params.length = 0;
	return this;
}

AsyncParamifier.prototype.tick = function()
{
	if(this.index<this.params.length) {
		var p = config.paramifiers[this.params[this.index].name];
		if(p && p[this.handler] instanceof Function)
			p[this.handler](this.params[this.index].value,this.index);
		this.index++;
		return true;
	}
	return false;
};

function invokeParamifierAsync(params,handler)
{
	anim.startAnimating(new AsyncParamifier(params,handler));
}

config.paramifiers.open.onstart = function(v,i)
{
	story.displayTiddler(i == 1 ? null : "bottom",v,null,false,null);
};
/*}}}*/
