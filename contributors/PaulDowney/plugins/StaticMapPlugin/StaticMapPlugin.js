/***
|''Name:''|StaticMapPlugin |
|''Description:''|Google static map macro |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/StaticMapPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/StaticMapPlugin/ |
|''Version:''|0.1 |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4 |
!!Documentation
Macro to insert a [[Google Static Map|http://code.google.com/apis/maps/documentation/staticmaps/]].
{{{
<<staticMap 
	href:'http://en.wikipedia.org/wiki/Brooklyn_Bridge'
	class:brooklyn
	alt:'Hybrod map of New York centred above Brooklyn Bridge'
	center:Brooklyn+Bridge,New+York,NY
	zoom:14
	size:512x512
	maptype:hybrid
	markers:'color:blue|label:S|40.702147,-74.015794'
	markers:'color:green|label:G|40.711614,-74.012318'
	markers:'color:red|color:red|label:C|40.718217,-73.998284'
	sensor:false
>>
}}}
<<staticMap 
	href:'http://en.wikipedia.org/wiki/Brooklyn_Bridge'
	class:brooklyn
	alt:'Hybrod map of New York centred above Brooklyn Bridge'
	center:Brooklyn+Bridge,New+York,NY
	zoom:14
	size:512x512
	maptype:hybrid
	markers:'color:blue|label:S|40.702147,-74.015794'
	markers:'color:green|label:G|40.711614,-74.012318'
	markers:'color:red|color:red|label:C|40.718217,-73.998284'
	sensor:false
>>
{{{
<<staticMap title:'Osmosoft'>>
}}}
<<staticMap title:'Osmosoft'>>
The default marker is taken from the tiddler {{{geo.lat}}} and {{{geo.long}}} fields:
{{{
<<staticMap>>
}}}
<<staticMap>>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config escape store */
(function ($) {
	version.extensions.StaticMapPlugin = {installed: true};
	config.macros.staticMap = {
		handler: function (place, macroName, params, wikifier, paramString, tiddler) {
			params = paramString.parseParams()[0];
			var markers = params.markers ? params.markers.join("&markers=") :
				escape(store.getValue(tiddler, 'geo.lat') + "," + store.getValue(tiddler, 'geo.long'));
			var _class = params['class'] || "staticmap";
			var alt = params.alt || "Map";
			var url = 'http://maps.google.com/maps/api/staticmap' +
				'?center=' + escape(params.center || "") +
				'&zoom=' + escape(params.zoom || "16") +
				'&size=' + escape(params.size || "160x160") +
				'&maptype=' + escape(params.maptype || "roadmap") +
				'&markers=' + markers +
				'&sensor=' + escape(params.sensor || 'false');
			if (params.href) {
				place = createExternalLink(place, params.href);
			} else if (params.title) {
				place = createTiddlyLink(place, params.title, false, _class);
			}
			$(place).append('<img class="' + _class + '" src="' + url + '" alt="' + alt + '"/>');
		}
	};
}(jQuery));
//}}}
