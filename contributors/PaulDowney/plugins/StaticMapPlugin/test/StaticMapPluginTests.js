/*global story, jQuery, document, module, test, same */
(function ($) {
	jQuery(document).ready(function () {
		module("StaticMapPlugin");

		test("Brooklyn Bridge map", function () {
			var map = $('img.brooklyn');
			ok($(map).parent().hasClass('externalLink'), "is an externalLink");
			strictEqual($(map).parent().attr('href'), "http://en.wikipedia.org/wiki/Brooklyn_Bridge", "links to Wikipedia");
			strictEqual($(map).attr('src'), "http://maps.google.com/maps/api/staticmap?center=Brooklyn+Bridge%2CNew+York%2CNY&zoom=14&size=512x512&maptype=hybrid&markers=color:blue|label:S|40.702147,-74.015794&markers=color:green|label:G|40.711614,-74.012318&markers=color:red|color:red|label:C|40.718217,-73.998284&sensor=false", "Google static map");
			strictEqual($(map).attr('alt'), "Hybrod map of New York centred above Brooklyn Bridge", "alt link");
		});

		test("Osmosoft tiddlylink  map", function () {
			var map = $('img.staticmap')[0];
			var link = $(map).parent();
			ok($(link).hasClass("tiddlyLink"), "is a tiddlyLink");
			ok($(link).attr("tiddlylink"), "Osmosoft");
			strictEqual($(map).attr('src'), "http://maps.google.com/maps/api/staticmap?center=&zoom=16&size=160x160&maptype=roadmap&markers=51.498289%2C-0.134226&sensor=false", "Google static map");
			strictEqual($(map).attr('alt'), "Map", "alt link");
		});

		test("Default map", function () {
			var map = $('img.staticmap')[1];
			strictEqual($(map).attr('src'), "http://maps.google.com/maps/api/staticmap?center=&zoom=16&size=160x160&maptype=roadmap&markers=51.498289%2C-0.134226&sensor=false", "Google static map");
			strictEqual($(map).attr('alt'), "Map", "alt link");
		});

	});
}(jQuery));
