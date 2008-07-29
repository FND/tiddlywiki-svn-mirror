modifier: Base
created: 
modified: 200805281204
tags: systemConfig excludeLists excludeSearch

/***
|''Name:''|TiddlyWebBagTiddlersPlugin|
|''Description:''|List all the tiddlers in a named bag.|
|''Author:''|Chris Dent (cdent (at) peermore (dot) com)|
|''Source:''|n/a|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/ChrisDent/....|
|''Version:''|0.0.1|
|''Status:''|Under Development|
|''Date:''|Mar 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''||
|''~CoreVersion:''||
***/

//{{{
if(!version.extensions.TiddlyWebBagTiddlersPlugin) {
version.extensions.TiddlyWebBagTiddlersPlugin = {installed:true};

TiddlyWebBagTiddlers = {};

config.macros.bagtiddlers = {};
config.macros.bagtiddlers.handler = function(place, macroName, params)
{
    var bag = params[0];
    var title = params[1];
    var tiddler = store.fetchTiddler(title);
    if (!tiddler) {
        createTiddlyText(place, 'no tiddler named ' + title);
        return;
    }
    var host = tiddler.fields['server.host'];
    var uriTemplate = '%0bags/%1/tiddlers';
    var uri = uriTemplate.format([host, bag]);

    var context = {'place':place};
    var baglist = new TiddlyWebTools.Tiddlers('', 'bags', bag);
    baglist.getRepresentation(TiddlyWebBagTiddlers.getTiddlersCallback, context);
};

TiddlyWebBagTiddlers.getTiddlersCallback = function(status, context, responseText, uri, xhr) {
    alert(context);
    var tiddlers = [];
    var titles = [];
    if(status) {
        try {
            eval('var tiddlers=' + responseText);
        } catch (ex) {
            alert('error ' + ex);
        }
        for (var i=0; i < tiddlers.length; i++) {
            titles.push(tiddlers[i]['title']);
        }
    } else {
        alert('weird no status in getTiddlersCallback for '+uri);
        return false;
    }
    var baglist = createTiddlyElement(context['place'],"ul");
    for (var i=0; i < titles.length; i++) {
        createTiddlyLink(createTiddlyElement(baglist, "li"), titles[i], true);
    }
};

} //# end of 'install only once'
//}}}
