/***
|''Name''|SamplePlugin|
|''Description''|<...>|
|''Icon''|<...>|
|''Author''|<...>|
|''Contributors''|<...>|
|''Version''|<...>|
|''Date''|<...>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<sampleMacro>>
}}}
!!Parameters
<...>
!!Examples
<<sampleMacro>>
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
if(!version.extensions.SamplePlugin) { //# ensure that the plugin is only installed once
version.extensions.SamplePlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.4.2

config.extensions.SamplePlugin = {
	sampleFunction: function() {
		/* ... */
	}
};

config.macros.sampleMacro = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		/* ... */
	}
};

} //# end of "install only once"
//}}}
