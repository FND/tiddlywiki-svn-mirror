// <![CDATA[
	
describe('HTMLTemplatePreview : handler()', {

	before_each: function(){
		place = document.body.appendChild(document.createElement("div"));
		place.style.display = "none";
		params = ["testTemplate"];
	},

	'it should return false if no template parameter is provided': function() {
		params = [];
		var actual = config.macros.HTMLTemplatePreview.handler(place,null,params);
		value_of(actual).should_be_false();
		displayMessage = function() {
			return;
		};
	},
	
	'it should not call expandTemplate if no template parameter is provided': function() {
		var called = false;
		expandTemplate = function(html) {
			called = true;
			return html;
		};
		displayMessage = function() {
			return;
		};
		params = [];
		var actual = config.macros.HTMLTemplatePreview.handler(place,null,params);
		value_of(called).should_be(false);
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