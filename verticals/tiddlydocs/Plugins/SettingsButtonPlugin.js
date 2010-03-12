/***
|''Name''|Settings Button plugin|
|''Description''|Provides the button to link to the tiddlydocs settings tiddler|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/SettingsButtonPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/SettingsButtonPlugin.js |
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''||

!Usage
{{{

<<settingsButton>>

}}}

!Code
***/

//{{{

config.macros.settingsButton = {};
config.macros.settingsButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var settingsClick = function() {
		story.displayTiddler(null, "Settings");
		return false;
	}
	createTiddlyButton(place, 'Settings', 'Click here to change your settings', settingsClick,"settingsButton button");
}

//}}}