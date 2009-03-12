/***
|''Name''|ListNavMacro|
|''Description''|letter-based navigation for lists|
|''Author''|FND|
|''Version''|0.2.0|
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
<list>
<<listnav>>
}}}
!!Parameters
<...>
!!Examples
* foo
* bar
* baz
<<listnav>>
!Revision History
!!v0.1 (2009-03-11)
* initial release
!!v0.2 (2009-03-12)
* refactored to make more generic (apply to any preceding list)
!To Do
* ignore preceding {{{BR}}} elements
!Code
***/
//{{{
(function($) { //# set up alias

config.macros.listnav = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		// get preceding list element
		var list = $(place).find("> :last");
		console.log("last element", list[0]);
		list = list.filter("ul, ol");
		console.log("last list", list[0]);
		// create pseudo-unique ID if necessary
		var id = list.attr("id") || new Date().formatString("YYYY0MM0DD0hh0mm0ss");
		// generate nav bar
		var nav = $("<div />").attr("id", id + "-nav").insertBefore(list);
		console.log("nav", nav[0]);
		// apply listnav
		list.attr("id", id).listnav();
	}
};

})(jQuery);
//}}}
