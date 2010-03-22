/***
|''Name:''|gmap|
|''Description:''|set preferences|
|''~CoreVersion:''|2.6.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.GMapPlugin) {
version.extensions.GMapPlugin = {installed:true};

config.macros.gmap = {};
config.macros.gmap.createMarker = function(point,html)
{
	var marker = new GMarker(point);
	GEvent.addListener(marker, "click", function() {marker.openInfoWindowHtml(html);});
	return marker;
}

config.macros.gmap.addTiddler = function(map,tiddler)
{
	if(tiddler.fields['geo.lat'] && tiddler.fields['geo.long']) {
		var lat = parseFloat(tiddler.fields['geo.lat']);
		var lng = parseFloat(tiddler.fields['geo.long']);
		var html = tiddler.title;
		var point = new GLatLng(lat,lng);
		var marker = config.macros.gmap.createMarker(point,html);
		map.addOverlay(marker);
	}
};

config.macros.gmap.handler = function(place,macroName,params)
{
	var map = new GMap2(place);
	map.setCenter(new GLatLng(51.51,-0.1), 12);
	map.setUIToDefault();
	filter = params[0];
	if(filter) {
		tiddlers = store.filterTiddlers(filter);
		for(var i=0;i<tiddlers.length;i++) {
			this.addTiddler(map,tiddlers[i]);
		}
	}
};

} //# end of 'install only once'
//}}}
