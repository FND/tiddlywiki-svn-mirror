/***
|''Name''|<...>|
|''Description''|<...>|
|''Author''|FND|
|''Version''|<#.#.#>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|http://fnd.tiddlyspot.com/#<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Requires''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<...>>
}}}
!!Parameters
<...>
!!Examples
<<...>>
!Configuration Options
<...>
!Revision History
!!v<#.#> (<yyyy-mm-dd>)
* <...>
!To Do
<...>
!Code
***/
//{{{
(function($) { //# set up local scope

if(!window.<...>) {
	throw "Missing dependency: <...>";
}

// plugin namespace
$.tw.<...> = {
	sampleFunction: function() {
		/* ... */
	}
};

// macro
$.tw.fn.extend({
	<...>: function(args) {
		/* ... */
		return this;
	}
});

})(jQuery); //# end of local scope
//}}}
