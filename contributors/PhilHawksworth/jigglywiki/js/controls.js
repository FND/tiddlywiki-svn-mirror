//jw.controls = {


(function($) {

	$.fn.extend({
		jw_controls_edit: function(args) {
			var tiddler = args.tiddler;
			var container = $(tiddler).parents('div.story')[0].id;
			var name = jw.getTiddlerNameFromStory(tiddler);
			jw.displayTiddler(name, { 
				relative:tiddler, 
				position:'replace', 
				container: container,
				template: 'EditTemplate',
				overflow: true,
				animate: false
			});
			// jw.getTiddler(name,container).find('div.text textarea').wysiwyg();
		},

		jw_controls_save: function(args) {
			console.log("saving");
			jw.saveToFile();
		},

		jw_controls_save_tiddler: function(args) { 
			var tiddler = args.tiddler;
			var n = jw.getTiddlerNameFromStory(tiddler);
			var t = jw.getTiddler(n,'store');

			// text
			var text = tiddler.find("div.text textarea")[0].value;
			storedTextDiv = t.find('div.text');
			storedTextDiv.html(text);

			// tags

			// meta

			// name
			var name = tiddler.find("input.tiddlerName")[0].value;
			tiddlerTitle = t.find('h1.tiddlerName');
			tiddlerTitle.text(name);	
			tiddlerTitleAnchor = t.find('a.tiddlerName');
			tiddlerTitleAnchor.attr('name','tiddler:'+ name);

			//replace this tiddler in the story
			var container = $(tiddler).parents('div.story')[0].id;
			jw.displayTiddler(name, {
				relative:tiddler, 
				position:'replace', 
				container:container,
				overflow: true,
				animate:false
			});
		},

		jw_controls_cancel: function(args) { 
			var tiddler = args.tiddler;
			var container = $(tiddler).parents('div.story')[0].id;
			var name = jw.getTiddlerNameFromStory(tiddler);
			jw.displayTiddler(name, { 
				relative:tiddler, 
				position:'replace', 
				container: container,
				overflow: true,
				animate: false
			}); 
		},

		jw_controls_close: function(args) {
			jw.log('jw_controls_close',args);
			return;
			/*var tiddler = args.tiddler;
			tiddler.slideUp( function(){
			 	tiddler.remove();
				jw.pagemap.refresh();
			});*/	
		},

		jw_controls_close_all: function(args) {
			$('div.story div.tiddler').each(function(){
				jw.controls['close'].handler($(this));
			});
		},

		jw_controls_jiggle: function(args) { 
			// jiggle the tiddlers in the store to echo the order in which they are displayed in the story(ies).
			$('div.story > div.tiddler').reverse().each(function(t){
				n = jw.getTiddlerNameFromStory(this);
				t = jw.getTiddler(n,"store");
				t.remove();
				t.prependTo($('#store'));
			});
			jw.log('jiggled');
		}
	});
	
})(jQuery);

