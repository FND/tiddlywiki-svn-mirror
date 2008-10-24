/***
|''Name:''|CodeRunnerPlugin |
|''Description:''|Enable quick inline execution of jacascript code in a tiddler without the need to reload the page.|
|''Author:''|Phil Hawksworth|
|''Version:''|0.1|
|''Date:''|Tue 21 Oct 2008 10:13:55 BST|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4.1|
***/


//{{{
	
if(!version.extensions.CodeRunnerPlugin) {
version.extensions.CodeRunnerPlugin = {installed:true};
	
	//
	// Extend the commands so that we can use our own commands on tiddlers.
	//
	config.commands.codeRunner = {
		text: "run",
		tooltip: "execute the javascript in this tiddler",
		handler : function(event,src,title) {
			var sourceTiddler = store.getTiddler(title);
			try {
				(new Function( sourceTiddler.text ))();
			} catch(e){
				alert(e.message);
			}
		}
	};

}
	
//}}}
