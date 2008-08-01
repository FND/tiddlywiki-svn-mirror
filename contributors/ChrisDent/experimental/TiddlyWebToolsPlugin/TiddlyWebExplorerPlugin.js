modifier: ChrisDent
created: 
modified: 200805281204
tags: systemConfig excludeLists excludeSearch

/***
|''Name:''|TiddlyWebExploerPlugin|
|''Description:''|Browse a tiddlyweb to list all the recipes and their content.|
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
if(!version.extensions.TiddlyWebExplorerPlugin) {
version.extensions.TiddlyWebExplorerPlugin = {installed:true};

TiddlyWebExplorer = {};

config.macros.tw_explore = {};
config.macros.tw_explore.handler = function(place, macroName, params)
{
    var server = params[0];
    if (!server)
        server = '';
    var context = {'server':server, 'place':place};
    var recipes = new TiddlyWebTools.Recipes(server);
    recipes.getRepresentation(TiddlyWebExplorer.getRecipesCallback, context);
};

TiddlyWebExplorer.getRecipe = function(place, server, recipe_name) {
    var recipe = new TiddlyWebTools.Recipe(server, recipe_name);
    var context = {'server':server, 'place': place, 'recipe_name': recipe_name};
    recipe.getRepresentation(TiddlyWebExplorer.getRecipeCallback, context);
};

TiddlyWebExplorer.getRecipesTiddlers = function(place, server, recipe_name) {
    var tiddlers = new TiddlyWebTools.Tiddlers(server, 'recipes', recipe_name);
    var context = {'server':server, 'place': place, 'recipe_name': recipe_name};
    tiddlers.getRepresentation(TiddlyWebExplorer.getTiddlersCallback, context);
}

TiddlyWebExplorer.getRecipesCallback = function(status, context, responseText, uri, xhr) {
    var recipes = [];
    if(status) {
        try {
            eval('recipes=' + responseText);
        } catch (ex) {
            alert('error ' + ex);
        }
    } else {
        alert(uri + xhr.status);
        return false;
    }
    var recipelist = createTiddlyElement(context['place'],"ul");
    for (var i=0; i < recipes.length; i++) {
        elem = createTiddlyElement(recipelist, "li", null, null, recipes[i]);
        TiddlyWebExplorer.getRecipe(elem, context['server'], recipes[i]);
    }
};

TiddlyWebExplorer.getRecipeCallback = function(status, context, responseText, uri, xhr) {
    var recipe = [];
    if(status) {
        try {
            eval('recipe=' + responseText);
        } catch (ex) {
            alert('error ' + ex);
        }
    } else {
        alert(uri + xhr.status);
        return false;
    }
    var recipe_info = createTiddlyElement(context['place'], "ul");
    for (var i=0; i < recipe.length; i++) {
        elem = createTiddlyElement(recipe_info, "li", null, null, recipe[i][0] + ':' + recipe[i][1]);
    }
    tiddler = createTiddlyElement(recipe_info, "li", null, null, 'Tiddlers');
    tiddler_list = createTiddlyElement(tiddler, "ul");
    TiddlyWebExplorer.getRecipesTiddlers(tiddler_list, context['server'], context['recipe_name']);
}

TiddlyWebExplorer.getTiddlersCallback = function(status, context, responseText, uri, xhr) {
    var tiddlers = [];
    if(status) {
        try {
            eval('tiddlers=' + responseText);
        } catch (ex) {
            alert('error ' + ex);
        }
    } else {
        alert(uri + xhr.start);
        return false;
    }
    for (var i=0; i < tiddlers.length; i++) {
        createTiddlyElement(createTiddlyElement(context['place'], "li"), 'a', null, null,
            tiddlers[i]['title'], {'href': '/bags/' + encodeURIComponent(tiddlers[i]['bag'])
            + '/tiddlers/' + encodeURIComponent(tiddlers[i]['title'])});
    }
}

} //# end of 'install only once'
//}}}
