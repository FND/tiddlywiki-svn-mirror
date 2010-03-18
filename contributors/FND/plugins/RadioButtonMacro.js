/***
|''Name''|RadioButtonMacro|
|''Description''|macro to generate radio button elements|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/RadioButtonMacro.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Keywords''|forms|
!Usage
{{{
<<radio label value1 value2 [value3 value4 ... ]>>
}}}
!!Examples
<<radio "Sample Selection" foo bar baz>>
!Revision History
!!v0.1 (2010-03-18)
* initial release
!To Do
* persistence
* selection initialization
!Code
***/
//{{{
(function($) {

config.macros.radio = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var label = params.shift();
		var group = label.replace(/\s/g, "_");
		var container = $("<fieldset />");
		$("<legend />").text(label).appendTo(container);
		$.each(params, function(i, item) {
			var radio = $('<input type="radio" />').
				attr("name", group).val(item);
			container.append(radio).append(item);
		});
		$("<form />").append(container).appendTo(place);
	}
};

})(jQuery);
//}}}
