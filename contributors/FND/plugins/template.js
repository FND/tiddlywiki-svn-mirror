/***
|''Name''|<...>|
|''Description''|<...>|
|''Author''|FND|
|''Version''|<#.#.#>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|http://devpad.tiddlyspot.com/#<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|<...>|
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
(function() { //# set up local scope

if(!window.<...>) {
	throw "Missing dependency: <...>";
}

if(!version.extensions.<...>) { //# ensure that the plugin is only installed once
version.extensions.<...> = { installed: true };

if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.4.2

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

} //# end of "install only once"

})(); //# end of local scope
//}}}