/***
|''Name''|GeoProximityMacro|
|''Description''|displays proximity between two pairs of latitude/longitude|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/GeoProximityMacro.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Usage
{{{
<<geoProx [distance]>>
}}}
optional {{{distance}}} parameter is the maximum distance in kilometers
!Revision History
!!v0.1 (2010-02-16)
* initial release
!To Do
* use "geo.{lat,l[o]ng}" as field names
!Code
***/
//{{{
(function() {

config.macros.geoProx = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		if(!(tiddler.fields.lat && tiddler.fields.lng)) {
			return false;
		}

		var maxDist = params.length ? parseFloat(params[0]) : null;

		var geoTiddlers = [];
		store.forEachTiddler(function(title, tiddler) {
			if(tiddler.fields.lat && tiddler.fields.lng) {
				geoTiddlers.push(tiddler);
			}
		});

		var template = "distance to [[%0]]: %1 km\n";
		for(var i = 0; i < geoTiddlers.length; i++) {
			var locations = [{
				lat: parseFloat(tiddler.fields.lat),
				lng: parseFloat(tiddler.fields.lng)
			}, {
				lat: parseFloat(geoTiddlers[i].fields.lat),
				lng: parseFloat(geoTiddlers[i].fields.lng)
			}];
			var distance = geoDistance(locations[0], locations[1]);
			if(!maxDist || distance <= maxDist) {
				wikify(template.format([geoTiddlers[i].title, distance]), place);
			}
		}
	}
};

// adapted from http://www.movable-type.co.uk/scripts/latlong.html
var geoDistance = function(loc1, loc2) {
	var R = 6371; // km
	var dLat = toRad(loc2.lat - loc1.lat);
	var dLon = toRad(loc2.lng - loc1.lng);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

var toRad = function(val) {
	return val * Math.PI / 180;
};

})();
//}}}
