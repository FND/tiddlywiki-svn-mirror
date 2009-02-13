/***
|''Name:''|easyGraphs |
|''Description:''|An attempt to bring nice easy to use maps to tiddlywiki using geojson|
|''Author:''|JonRobson |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/verticals/GeoTiddlyWiki|
|''Version:''|0.0.5 |
|''Date:''|4/11/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
|''Dependencies:''|This plugin requires a tiddler geojson containing geojson data eg.[[geojson]]|
***/

//{{{

var mygraph;
config.macros.TiddlyDiagram = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		
		
		var x = new EasyGraph();
		
		var json = {};
		if(tiddler.fields.tiddlydiagram){
			json =eval(tiddler.fields.tiddlydiagram);
			try{
				x.loadfromjson(json);
			}catch(e){}
		}
		

		var controller = {
			saveHandler: function(easyDiagram,json){
				var t = easyDiagram.getTransformation();
				json.transformation = t;
				console.log(json);
				var title = tiddler.title;
				var text = tiddler.text;
				var tags = tiddler.tags;
				var fields = tiddler.fields;
				fields.tiddlydiagram = json.toSource();
				store.saveTiddler(title,title,text,null,null,tags,fields);
			}
			,renderLabel: function(domElement,value){
				domElement.innerHTML = "";
				wikify(value,domElement);
			}
		};
		var mydiagram = new EasyDiagram(place,x,controller);
		if(json.transformation)mydiagram.setTransformation(json.transformation);
		mygraph = mydiagram;
		mygraph.render();
		
	}
};

