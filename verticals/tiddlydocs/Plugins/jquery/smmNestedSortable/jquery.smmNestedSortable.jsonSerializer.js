/*
SmmNestedSortables JSON Serializer

Calling $.fn.smmNestedSortable.jsonSerializer.buildSpec() will return a serialized string of the first ul.sortable on the page.

smmNestedSortables can automatically calls buildSpec when the spec is changed. This is how you would do it: 

$('.sortable').smmNestedSortable({
	'serializer':function() {
		var spec = $.fn.smmNestedSortable.jsonSerializer.buildSpec();
		$("#spec").html("<b>text output</b><br /><br />"+ spec);
	}
});

*/

jQuery.fn.smmNestedSortable.jsonSerializer = {
	'buildSpec': function() {
		var newSpec = this._buildSpec(jQuery("ul.sortable:first").children('li'));
		var spec = { format: { name: 'smmNestedSortablesJSONSpec', majorVersion:'0', minorVersion:'1' }, content: newSpec}; 
		return jQuery.toJSON(spec);
	},
	'_buildSpec': function(liList) {
		var spec = [];
		liList.each(function() {
			var li=this;
			var node = {
				title: li.id
			};
			node.children = jQuery.fn.smmNestedSortable.jsonSerializer._buildSpec(jQuery(li).children("ul").children("li"));
			spec.push(node);
	 	});
	  return spec;
	},
	getSpec: function(tiddler) {
		return jQuery.parseJSON(store.getTiddlerText(docTiddler)).content;
	}
};