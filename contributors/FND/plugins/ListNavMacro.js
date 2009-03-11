/***
|''Name''|ListNavMacro|
|''Description''|letter-based navigation for lists|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Requires''|[[jquery.listnav|http://www.ihwy.com/Labs/jquery-listnav-plugin.aspx]]|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<listnav [options]>>
}}}
!!Parameters
<...>
!!Examples
<<listnav all>>
!Revision History
!!v0.1 (2009-03-11)
* initial release
!To Do
* make macro work on preceding element to be more generic
!Code
***/
//{{{
(function($) { //# set up alias

config.macros.listnav = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var id = new Date().formatString("YYYY0MM0DD0hh0mm0ss"); // create pseudo-unique ID
		$("<div />").attr("id", id + "-nav").appendTo(place);
		var el = $("<div class='listnav' />").appendTo(place);
		invokeMacro(el[0], "list", paramString, wikifier, tiddler);
		el.find("ul").attr("id", id).listnav();
	}
};

})(jQuery);
//}}}
