/*
SmmNestedSortables Text Serializer

Calling $.fn.smmNestedSortable.textSerializer.buildSpec() will return a serialized string of the first ul.sortable on the page.

smmNestedSortables can automatically calls buildSpec when the spec is changed. This is how you would do it: 

$('.sortable').smmNestedSortable({
	'serializer':function() {
		var spec = $.fn.smmNestedSortable.textSerializer.buildSpec();
		$("#spec").html("<b>text output</b><br /><br />"+ spec);
	}
});

*/

 	
	
(function($) {
	$.fn.smmNestedSortable.textSerializer = {
		newLine:"<br />",
		indent:"*", 
		buildSpec: function() {
			var spec = [];
			var level = 0;
			jQuery("ul.sortable:first").children().each(function() {
				spec.push($.fn.smmNestedSortable.textSerializer._buildSpec($(this), level));
			});
			return spec.join('');			
		}, 
		_buildSpec: function(liList, level) {
			var spec = [];
			level++;
			liList.each(function() {		
				spec.push($.fn.smmNestedSortable.textSerializer.makeIndent(level)+" "+this.id+$.fn.smmNestedSortable.textSerializer.newLine);
				spec.push($.fn.smmNestedSortable.textSerializer._buildSpec(jQuery(this).children("ul").children("li"), level));
		 	});
		  return spec.join('');
		}, 
		makeIndent: function(number) {
			var i = [];
			for (c=0;c<number;c++){
				i.push(this.indent);
			}
			return i.join('')+" ";
		},
		countIndent: function(line) {
			if(line == undefined) 
				return 0;
			return line.substring(0, line.indexOf(" ")).length; // count chars before the first space
		},
		getSpec: function(tiddler) {
		//	console.log('getSpec', jQuery.parseJSON(store.getTiddlerText(docTiddler)).content);
			var spec = "* item1\n* item1.\n** item2\n** item21\n*** item3\n** item23";
			var specItems = spec.split("\n");
			var newSpec = [];
			for (c=0;c<=specItems.length;c++) {
				console.log("----",specItems[c],"---");
				var lastIndent = this.countIndent(specItems[c-1]);
				var thisIndent = this.countIndent(specItems[c])			
				if(newSpec.length < 1) { //first item 
					console.log('firsttime');
					newSpec = [{ title : specItems[c], children: []}];
					var last = newSpec[0];
				}else if(thisIndent == lastIndent) { // same level
					console.log("same lebel");
					newSpec.push({ title : specItems[c], children: []});
					console.log(newSpec);
					var last = newSpec[newSpec.length-1];
					console.log(last);
				}else if (thisIndent > lastIndent) {// sub item
					console.log(';ast', last);
					last.children.push( { title : specItems[c], children: []} );
					var last = last.children[last.children.length-1];
					console.log(';ast', last);
				}else if (this.countIndent(specItems[c]) < this.countIndent(specItems[c-1])) { // up a level. 
					console.log('up a level');
				}
			}
			console.log('out', newSpec);
		}
	};
})(jQuery);

	
	
