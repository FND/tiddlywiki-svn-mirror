/*

FILE: jquery.contentStore.js
DATE: Oct 3rd 2008
AUTHORS: Phil Hawksworth. [http://hawksworx.com]
DESCRIPTION: Enable an html based data store and expose an API to CRUD items in that store.
NOTES: For a good breakdown of an excellent design pattern for jQuery plugins see http://www.learningjquery.com/2007/10/a-plugin-development-pattern

USAGE:

// Create a store object which in the context of a DOM element with the ID 'mystore'.
var mystore = $('#mystore').contentStore();

// Create a store object and overwrite the default jQuery DOM queries which return our elements.
var mystore = $('#mystore').contentStore({
	section : 'div.hentry',
	title : 'div.hentry h2.entry-title',
	text : 'div.hentry div.eintry-content'
});

// change a default setting for easier custom behavior.
$.fn.contentStore.default.visible = true;

*/

(function($) {
	
	// plugin definition
	$.fn.contentStore = function(options) {
	
		var opts = $.extend({}, $.fn.contentStore.defaults, options);
		var qs = {};
		var store = $(this);

		// hide the store.
		if(opts.visible != true) {
			store.hide();			
		}
		
		// Get a tiddler by it's title.
		qs.getTiddler = function(name) {
			
			var id = IDfromName(name);
			console.log('id', id, name);
			
			var t = store.find("#section__"+ IDfromName(name)); 
			
			t.title = function(){
				return $(this).find(opts.title);
			};
			t.tiddlerLink = function(){
				title = $(this).find(opts.title).text();
				var h =  "<a href='#section__" + IDfromName(title) + "'>"+ title +"</a>";
				var link = $(h);
				link.html = function() {
					return h;
				};
				link.text = function() {
					return title;
				};
				return link;
			};
			t.tiddlerText = function(){
				return $(this).find(opts.text);
			};
			t.tags = function(){
				var theTags = $(this).find(opts.tags);
				theTags.addTag = function(tag){
					// var theTags = $(this).find(opts.tags);
					// console.log('adding', tag);
					theTags.append($("<a href='#"+tag+"' rel='tag'>"+tag+"</a>"));
					return theTags;
				};
				return theTags;
			};
			return t;
		};
		
		// Return all tiddlers.
		qs.getAllTiddlers = function(options) {
			// var defaults = {
			// 			tags: null
			// 		};
			// 		var opts = $.extend({}, defaults, options);
		
			var tiddlers =  [];
			$('#store').find(opts.section).each(function(i, el){
				title = $(el).find(opts.title).text();
				tiddlers.push(qs.getTiddler(title));
			});
			return $(tiddlers);
		};
		
		return qs;		
	};
	
	
	// plugin defaults.
	$.fn.contentStore.defaults = {
		visible: false,
		display: '#story',
		section : 'div.hentry',
		title : 'h2.entry-title',
		text : 'div.entry-content',
		tags : 'a[rel=tag]'
	};
	
	

	
	//
	// Private functions.
	//
		
	function IDfromName(name) {
		name = name.replace(/ /g, '_');
		return name;
		// return escape(name);
	}
	
	function NamefromID(id) {
		id = unescape(id);
		// return id.replace(/_/g, ' ');		
		return id;
	}
	
	function log() {
		if (window.console && window.console.log)
			window.console.log(arguments);
	};


})(jQuery);