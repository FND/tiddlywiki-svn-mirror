/***
|''Name:''|RippleRapTestPlugin|
|''Description:''|RippleRap test harness|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RippleRapTestPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RippleRapTestPlugin) {
version.extensions.RippleRapTestPlugin = {installed:true};

config.macros.rippleRapTest = {};
config.macros.rippleRapTest.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	createTiddlyButton(place,"Get notes from RSS","Get notes from RSS",config.macros.rippleRapTest.onClick);
};


config.macros.rippleRapTest.onClick = function()
{
	// the ripplerap notes feed is tagged systemServer, ripplerap and notes
	var r = new RssSynchronizer();
	store.forEachTiddler(function(title,t) {
		if(t.isTagged('systemServer') && t.isTagged('ripplerap') && t.isTagged('notes')) {
			var type = store.getTiddlerSlice(t.title,'Type');
			var uri = store.getTiddlerSlice(t.title,'URL');
			displayMessage("getNotes:"+t.title+" t:"+type+" u:"+uri);
			if(uri && type=='rss')
				r.getNotesTiddlersFromRss(uri);
		}
		if(t.isTagged('systemServer') && t.isTagged('ripplerap') && t.isTagged('upload')) {
			var type = store.getTiddlerSlice(t.title,'Type');
			var uri = store.getTiddlerSlice(t.title,'URL') + '/MartinBudden/index.xml';
			displayMessage("putTiddlers:"+t.title+" t:"+type+" u:"+uri);
			var tiddlers = store.getTaggedTiddlers('comment');
			if(uri && type=='rss')
				r.putTiddlersToRss(uri,tiddlers);
		}
	});
};

} //# end of 'install only once'
//}}}
