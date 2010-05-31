/***
|''Name''|<...>|
|''Description''|<...>|
|''Author''|FND|
|''Version''|<#.#.#>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|http://devpad.tiddlyspot.com/#<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
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
!TODO
<...>
!Code
***/
//{{{
(function($) {

if(!window.<...>) {
	throw "Missing dependency: <...>";
}

config.extensions.<...> = {
	sampleFunction: function() {
		/* ... */
	}
};

config.macros.<...> = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		/* ... */
	}
};

})(jQuery);
//}}}
