/***
|''Name''|DocumentPreviewPlugin|
|''Description''|Provides a TiddlyWiki based preview of the current active document|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|not in use or active development|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/DocumentPreviewPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/DocumentPreviewPlugin.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

Provides a macro <<docPreview>> which collects together the html sections of the currently active document.

!Usage
{{{

<<docPreview>>

}}}

!Code
***/

//{{{
	
config.macros.docPreview = {};
config.macros.docPreview.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyButton(place, "show preview", "click to see a preview of the current document.",  config.macros.docPreview.showWindow);
};

config.macros.docPreview.showWindow = function(){
		var spec = jQuery.parseJSON(store.getTiddlerText(window.activeDocument)).content;
		var html = config.macros.docPreview.recurse([], spec,  0, []).join("\n");
		var x = window.open('', '', 'scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
		x.document.write(html);
};

config.macros.docPreview.recurse = function(html, item, level, label) {
    level++;
    for (var e = 0; e < item.length; e++) {
        if (label[level] === undefined)
        	label[level] = 1;
       else
        	label[level]++;
        while (label.length > level + 1)
        	label.splice(level + 1);
		html.push("<h" + level + ">" + label.join(".").substr(1) + " : " + item[e].title+"</h" + level + ">");
        html.push(wikifyStatic(store.getTiddlerText(item[e].title)));
        if (item[e].children.length > 0)
			config.macros.docPreview.recurse(html, item[e].children, level, label);
    }
    return html;
};

//}}}