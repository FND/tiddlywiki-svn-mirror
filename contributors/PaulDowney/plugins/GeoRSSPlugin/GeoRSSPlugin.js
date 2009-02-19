/***
|''Name:''|GeoRSSPlugin|
|''Description:''| add georss to TiddlyWiki's RSS feed for tiddlers with longitude and latitude fields |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/GeoRSSPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/GeoRSSPlugin/ |
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin extends the core RSS saving to include [[W3C GeoRSS|http://en.wikipedia.org/wiki/GeoRSS]] values for tiddlers with latitude and longitude values as [[extended fields|http://www.tiddlywiki.org/wiki/Extended_fields]].  Coordinates are taken to be in the [[WGS|http://en.wikipedia.org/wiki/World_Geodetic_System]].  For example output see [[index.xml|http://whatfettle.com/2008/07/GeoRSSPlugin/index.xml]], and the result on [[Google Maps|http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=http:%2F%2Fwhatfettle.com%2F2008%2F07%2FGeoRSSPlugin%2Findex.xml&ie=UTF8&t=h&z=14]].

For more examples on using geo data in TiddlyWiki, see [[Jon Robson|http://www.jonrobson.me.uk/]]'s [[The Web is Your Oyster|http://www.jonrobson.me.uk/workspaces//tiddlers/The%20Web%20Is%20Your%20Oyster%20-%20create%20and%20tweak%20travel%20itineraries%20for%20your%20trip%20through%20the%20web/]].
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

                _tiddlerToRssItem: tiddlerToRssItem,
		tiddlerToRssItem: function(tiddler,uri)
		{
			var me = config.extensions.geoRSS;
			var s = me._tiddlerToRssItem(tiddler,uri);
			var lat = store.getValue(tiddler.title,"latitude");
			if(lat){
				var long = store.getValue(tiddler.title,"longitude");
				if(long){
					s = s + "<geo:lat>"+lat.htmlEncode()+"</geo:lat>"+"<geo:long>"+long.htmlEncode()+"</geo:long>";
				}
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
