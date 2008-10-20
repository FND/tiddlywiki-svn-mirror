/*

FILE: jquery.tiddlerStore.js
DATE: Oct 3rd 2008
AUTHORS: Phil Hawksworth. [http://hawksworx.com]
DESCRIPTION: Enable an html based data store and expose an API to CRUD items in that store.
NOTES: For a good breakdown of an excellent design pattern for jQuery plugins see http://www.learningjquery.com/2007/10/a-plugin-development-pattern

USAGE:

// Create a store object which in the context of a DOM element with the ID 'mystore'.
var mystore = $('#mystore').tiddlerStore();

// Create a store object and overwrite the default jQuery DOM queries which return our elements.
var mystore = $('#mystore').tiddlerStore({
	section : 'div.hentry',
	title : 'div.hentry h2.entry-title',
	text : 'div.hentry div.eintry-content'
});

// change a default setting for easier custom behavior.
$.fn.tiddlerStore.default.visible = true;

*/

(function($) {
	
	// plugin definition
	$.fn.tiddlerStore = function(options) {
	
		var opts = $.extend({}, $.fn.tiddlerStore.defaults, options);
		var qs = {};
		var store = $(this);

		// hide the store.
		if(opts.visible != true) {
			store.hide();			
		}
		
		// Get a tiddler by it's title.
		qs.getTiddler = function(name) {
			var t = store.find("#section__"+ IDfromName(name)); 
			t.title = function(){
				return $(this).find(opts.title);
			};
			t.text = function(){
				return $(this).find(opts.text);
			};
			t.tags = function(){
				var theTags = $(this).find(opts.tags);
				theTags.addTag = function(tag){
					// var theTags = $(this).find(opts.tags);
					console.log('adding', tag);
					theTags.append($("<a href='#"+tag+"' rel='tag'>"+tag+"</a>"));
					return theTags;
				};
				return theTags;
			};
			return t;
		};
		
		// Return all tiddles from a container
		qs.getAllTiddlers = function(container) {
			return store.find(opts.section);			
		};
		
		return qs;		
	};
	
	
	// plugin defaults.
	$.fn.tiddlerStore.defaults = {
		visible: false,
		display: '#story',
		section : 'div.hentry',
		title : 'h2.entry-title',
		text : 'div.entry-content',
		tags : 'a[rel=tag]'
	};
	
	
	
	//tiddler functions.
	// $.fn.tiddlerTitle = function(options) {
	// 	var opts = $.extend({}, $.fn.tiddlerStore.defaults, options);
	// 	return $(this).find(opts.title);
	// };
	
	
	//
	// Private functions.
	//
		
	function IDfromName(name) {
		return name.replace(/ /g, '_');
	}
	
	function NamefromID(id) {
		return id.replace(/_/g, ' ');
	}
	
	function log() {
		if (window.console && window.console.log)
			window.console.log(arguments);
	};


})(jQuery);