/***
|''Name:''|GeoRSSPlugin|
|''Description:''| add georss to TiddlyWiki's RSS feed for tiddlers with longitude and latitude fields |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/GeoRSSPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/GeoRSSPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
!!Code
***/
//{{{
if(!version.extensions.GeoRSSPlugin) {
version.extensions.GeoRSSPlugin = {installed:true};

	if(!config.extensions){
                config.extensions = {};
        }

        config.extensions.geoRSS = {

		geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
		georss: "http://www.georss.org/georss",

                _tiddlerToRssItem: tiddlerToRssItem,
		tiddlerToRssItem: function(tiddler,uri)
		{
			var me = config.extensions.geoRSS;
			var s = me._tiddlerToRssItem(tiddler,uri);
			var lat = store.getValue(tiddler.title,"latitude");
			var long = store.getValue(tiddler.title,"longitude");
			if(lat&&long){
				lat=lat.htmlEncode();
				long=long.htmlEncode();
				s = s + "<georss:point>"+lat+" "+long+"</georss:point>"+"<geo:lat>"+lat+"</geo:lat>"+"<geo:long>"+long+"</geo:long>";
			}
			return s;
		},

                _generateRss: generateRss,
		generateRss: function()
		{
			var me = config.extensions.geoRSS;
			var s = me._generateRss();
			return s.replace(/">/, '" xmlns:geo="'+me.geo+'" xmlns:georss="'+me.georss+'">');
		}
	};

        tiddlerToRssItem = config.extensions.geoRSS.tiddlerToRssItem;
        generateRss = config.extensions.geoRSS.generateRss;

}
//}}}
