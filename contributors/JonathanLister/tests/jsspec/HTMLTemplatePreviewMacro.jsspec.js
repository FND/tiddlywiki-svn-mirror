// <![CDATA[
	
describe('HTMLTemplatePreview : handler()', {

	before_each: function(){
		place = document.body.appendChild(document.createElement("div"));
		place.style.display = "none";
		params = ["testTemplate"];
	},

	'it should call the expandTemplate function': function() {
		var called = false;
		expandTemplate = function(html) {
			called = true;
			return html;
		};
		var actual = config.macros.HTMLTemplatePreview.handler(place,null,params);
		value_of(called).should_be(true);
	}	
});

// ]]>