/***
|''Name:''|AsyncStartupPlugin|
|''Description:''|Asynchronous display of tiddlers at startup|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Source:''|http://martinwiki.com/#AsyncStartupPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/AsyncStartupPlugin.js|
|''Version:''|0.0.2|
|''Date:''|April 15, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2|
***/

/*{{{*/
// Ensure that the AsyncStartupPlugin is only installed once.
if(!version.extensions.AsyncStartupPlugin) {
version.extensions.AsyncStartupPlugin = {installed:true};

function restart()
{
	invokeParamifier(params,'onstart');
	if(anim && story.isEmpty()) {
		anim.startAnimating(new AsyncParamifier(store.getTiddlerText('DefaultTiddlers').parseParams('open',null,false),'onstart'));
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
	var i = this.index;
	if(i<this.params.length) {
		var p = config.paramifiers[this.params[i].name];
		if(p && p[this.handler] instanceof Function)
			p[this.handler](this.params[i].value,i);
		this.index++;
		return true;
	}
	return false;
};

config.paramifiers.open.onstart = function(v,i)
{
	story.displayTiddler(i == 1 ? null : 'bottom',v,null,false,null);
};
} // end of 'install only once'
/*}}}*/
