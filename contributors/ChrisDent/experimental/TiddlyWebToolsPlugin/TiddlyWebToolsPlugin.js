modifier: ChrisDent
modified: 200807270001
created: 200807270000
tags: systemConfig

/***
|''Name:''|TiddlyWebToolsPlugin|
|''Description:''|Library of methods for accessing a TiddlyWeb server.|
|''Author:''|Chris Dent (cdent (at) peermore (dot) com)|
|''Source:''|n/a|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/ChrisDent/expiremental/TiddlyWebToolsPlugin|
|''Version:''|0.0.1|
|''Status:''|Under Development|
|''Date:''|Jul 29, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''||
|''~CoreVersion:''||
***/

//{{{
// Ensure the plugin is installed only once.
if(!version.extensions.TiddlyWebAutoSavePlugin) {
    version.extensions.TiddlyWebAutoSavePlugin = {installed:true};
}

var TiddlyWebTools = {};

// Make an inheritable class function
TiddlyWebTools.extend = function(subClass, baseClass) {
    function inheritance() {}
    inheritance.prototype = baseClass.prototype;
    subClass.prototype = new inheritance();
    subClass.prototype.constructor = subClass;
    subClass.baseConstructor = baseClass;
    subClass.superClass = baseClass.prototype;
}

// START Resources base class
TiddlyWebTools.Resource = function(server) {
    this.server = server;
}

TiddlyWebTools.Resource.prototype.route = function() {
    return this.server + this.route_map;
}

TiddlyWebTools.Resource.prototype.getRepresentation = function(callback) {
    alert('get ' + this.route());
    return doHttp('GET', this.route(), null, null, null, null, callback, null, {"Accept":"application/json"}, 1);
}
// END Resources base class

// START Collection
TiddlyWebTools.Collection = function(server) {
    TiddlyWebTools.Collection.baseConstructor.call(this, server);
}

TiddlyWebTools.extend(TiddlyWebTools.Collection, TiddlyWebTools.Resource);
// END Collection

// START Entity
TiddlyWebTools.Entity = function(server) {
    TiddlyWebTools.Entity.baseConstructor.call(this, server);
}

TiddlyWebTools.extend(TiddlyWebTools.Entity, TiddlyWebTools.Resource);
// END Entity

// START recipes collection
TiddlyWebTools.Recipes = function(server) {
    TiddlyWebTools.Recipes.baseConstructor.call(this, server);
    this.route_map = '/recipes';
}

TiddlyWebTools.extend(TiddlyWebTools.Recipes, TiddlyWebTools.Collection);
// END recipes collection

// START bags collection
TiddlyWebTools.Bags = function(server) {
    TiddlyWebTools.Bags.baseConstructor.call(this, server);
    this.route_map = '/bags';
}

TiddlyWebTools.extend(TiddlyWebTools.Bags, TiddlyWebTools.Collection);
// END bags collection

// START tiddlers collection
TiddlyWebTools.Tiddlers = function(server, container, container_name) {
    TiddlyWebTools.Tiddlers.baseConstructor.call(this, server);
    this.route_map = '/' + container + '/' + encodeURIComponent(container_name) + '/tiddlers';
}

TiddlyWebTools.extend(TiddlyWebTools.Tiddlers, TiddlyWebTools.Collection);
// END tiddlers collection

// START search collection
TiddlyWebTools.Search = function(server, query) {
    TiddlyWebTools.Search.baseConstructor.call(this, server);
    this.route_map = '/search?q=' + encodeURIComponent(query);
}

TiddlyWebTools.extend(TiddlyWebTools.Search, TiddlyWebTools.Tiddlers);
// END search collection

// START bag entity
TiddlyWebTools.Bag = function(server, name) {
    TiddlyWebTools.Bag.baseConstructor.call(this, server);
    this.route_map = '/' + bags + '/' + encodeURIComponent(name);
}

TiddlyWebTools.extend(TiddlyWebTools.Bag, TiddlyWebTools.Entity);
// END bag entity

// START recipe entity
TiddlyWebTools.Recipe = function(server, name) {
    TiddlyWebTools.Recipe.baseConstructor.call(this, server);
    this.route_map = '/' + recipes + '/' + encodeURIComponent(name);
}

TiddlyWebTools.extend(TiddlyWebTools.Recipe, TiddlyWebTools.Entity);
// END bag entity

// START tiddler entity
TiddlyWebTools.Tiddler = function(server, container, container_name, name) {
    TiddlyWebTools.Tiddler.baseConstructor.call(this, server);
    this.route_map = '/' + container + '/'
        + encodeURIComponent(container_name)
        + '/tiddlers/' + encodeURIComponent(name);
}

TiddlyWebTools.extend(TiddlyWebTools.Tiddler, TiddlyWebTools.Entity);
// END tiddler entity

// Function for adding Tiddlers
TiddlyWebTools.addTiddlers = function(host, tiddlers) {
    for (var i=0; i < tiddlers.length; i++) {
        tiddler = tiddlers[i];
        fields = {'server.workspace': tiddler.fields['server.workspace'],
                  'server.bag': tiddler.fields['server.bag'],
                  'server.page.revision': tiddler.fields['server.page.revision'],
                  'server.host': host,
                  'server.type': 'tiddlyweb'
        };
        store.saveTiddler(tiddler.title, tiddler.title, '', 'ParsonBrown', null, [], fields, 1);
    }
}

// simple test
var tw = new TiddlyWebTools.Tiddlers('', 'recipes', 'long');
tw_func = function(status, params, responseText, url, x) {
    if (status) {
        var tiddler_list = eval(responseText);
        nascent_tiddlers = []
        for (var i=0; i < tiddler_list.length; i++) {
            var tiddler = new Tiddler(tiddler_list[i]['title']);
            tiddler.fields['server.workspace'] = 'long';
            tiddler.fields['server.bag'] = tiddler_list[i]['bag'];
            tiddler.fields['server.page.revision'] = tiddler_list[i]['revision'];
            nascent_tiddlers.push(tiddler);
        }
        TiddlyWebTools.addTiddlers('', nascent_tiddlers);
    } else {
        alert(x.status);
    }
}
tw.getRepresentation(tw_func);

//}}}
