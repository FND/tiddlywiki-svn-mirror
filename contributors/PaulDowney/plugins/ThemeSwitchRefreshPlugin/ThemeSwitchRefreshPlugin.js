/***
|''Name:''|ThemeSwitchRefreshPlugin|
|''Description:''|Force a refresh on switching a theme, even when the default View or Edit template hasn't been changed |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ThemeSwitchRefreshPlugin |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides''|Story.prototype.swtichTheme() |
!!Documentation
The core Story.themeSwitch function has an optimization to avoid refreshing the story when the View or Edit templates haven't been altered. This causes issues with plugins which extend the chooseTemplateForTiddler functionality, such as the TaggedTemplateTweak and TaggedTemplatePlugin.
This plugin refreshes the page and story on a theme switch, regardless of the templates defined.
!!Code
***/
//{{{
if(!version.extensions.ThemeSwitchRefreshPlugin) {
version.extensions.ThemeSwitchRefreshPlugin = {installed:true};

Story.prototype._themeSwitchRefresh_switchTheme = Story.prototype.switchTheme;
Story.prototype.switchTheme = function(theme)
{
	this._themeSwitchRefresh_switchTheme.apply(this,arguments);
	//TBD: be canny to see if the theme contained a View or Edit template and avoid this:
	refreshAll();
	this.refreshAllTiddlers(true);
};
}
//}}}
