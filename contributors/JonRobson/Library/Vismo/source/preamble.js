/***
|''Name:''|Jon Robson's VismoLibrary|
|''Description:''|An opensource library of javascript code designed to create clickable graphics in canvas with VML alternative for Internet Explorer browsers. The purpose of this is to provide hackable, extendable graphics based plugins without being locked in to consumer products such as Flash.|
|''Author:''|JonRobson (http://www.jonrobson.me.uk/Vismo)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/Library/Vismo/|
|''Version:''|0.95 |
|''Dependencies:''| Requires jQuery|
|''Comments:''|Please raise questions and make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Contributors:''"|
Graph algorithms for VismoGraphs come from uses code from ECO Tree http://www.codeproject.com/KB/scripting/graphic_javascript_tree.aspx#quick|
and Nicolas Belmonte's JIT library (http://thejit.org/)
|
"|''Usage:''|
Not much good on it's own - it provides some nice functions to create graphicsy plugins.
Currently provides horsepower to the following plugins amongst others:
GeoTiddlyWiki (http://www.jonrobson.me.uk/workspaces/tiddlers/GeoTiddlyWiki/), ImageTaggingPlugin, TiddlyTagMindMap (http://tiddlytagmindmap.tiddlyspot.com)
!Wouldn't have been possible without..
http://spatialreference.org/ref/sr-org/google-projection/ for help with google projection hack
***/
String.prototype.toJSON = function(){var namedprms = this.parseParams(null, null, true);var options ={};for(var i=0; i < namedprms.length;i++){var nameval = namedprms[i];if(nameval.name)options[nameval.name] = nameval.value;}return options;};
