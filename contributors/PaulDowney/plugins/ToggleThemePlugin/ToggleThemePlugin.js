/***
|''Name:''|ToggleThemePlugin|
|''Description:''|Button to toggle/cycle through themes |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ToggleThemePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ToggleThemePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
<<toggleThemeButton>>
<<toggleThemeButton "SlideShow" "toggle slide show">>
!!Options
!!!Initial Theme:
|<<option txtTheme>>|<<message config.optionsDesc.txtTheme>>|
!!!Themes:
<<tagging systemTheme>>
!!Code
***/
//{{{
if(!version.extensions.ToggleThemePlugin) {
version.extensions.ToggleThemePlugin = {installed:true};

config.macros.toggleThemeButton = {
	label: "Toggle Theme",
	prompt: "toggle theme"
};

config.macros.toggleThemeButton.handler = function(place,macroName,params)
{
	createTiddlyButton(place, params[0]||this.label,params[1]||this.prompt,this.onClick);
};

config.macros.toggleThemeButton.onClick = function(ev)
{
	var e = ev ? ev : window.event;

	var themes = store.getTaggedTiddlers('systemTheme');
    var len = themes.length;
    if (!len) { 
        return false;
    }
    for (var i=0; i<len; i++) {
        if(themes[i].title == config.options.txtTheme) {
            i++;
            break;
        }
    }
    if (i >= len) {
        i = 0;
    }
	story.switchTheme(themes[i].title);
    return false;
};

}
//}}}
