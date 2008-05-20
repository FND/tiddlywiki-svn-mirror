/***
|Name|TaggedTemplateTweak|
|Source|http://www.TiddlyTools.com/#TaggedTemplateTweak|
|Documentation|http://www.TiddlyTools.com/#TaggedTemplateTweakInfo|
|Version|1.2.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.chooseTemplateForTiddler()|
|Description|use alternative ViewTemplate/EditTemplate for tiddler's tagged with specific tag values|
This tweak extends story.chooseTemplateForTiddler() so that ''whenever a tiddler is marked with a specific tag value, it can be viewed and/or edited using alternatives to the standard tiddler templates.'' 
!!!!!Documentation
>see [[TaggedTemplateTweakInfo]]
!!!!!Revisions
<<<
2008.04.01 [1.2.0] added support for using systemTheme section-based template definitions (requested by Phil Hawksworth)
2008.01.22 [*.*.*] plugin size reduction - documentation moved to [[TaggedTemplateTweakInfo]]
2007.06.23 [1.1.0] re-written to use automatic 'tag prefix' search instead of hard coded check for each tag.  Allows new custom tags to be used without requiring code changes to this plugin.
| please see [[TaggedTemplateTweakInfo]] for previous revision details |
2007.06.11 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.taggedTemplate= {major: 1, minor: 2, revision: 0, date: new Date(2008,4,1)};
Story.prototype.taggedTemplate_chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	// get default template from core
	var template=this.taggedTemplate_chooseTemplateForTiddler.apply(this,arguments);
	
	// if the tiddler to be rendered doesn't exist yet, just return core result
	var tiddler=store.getTiddler(title); if (!tiddler) return template;

	// look for template whose prefix matches a tag on this tiddler
	for (i=0; i<tiddler.tags.length; i++) {
				
		var t=tiddler.tags[i]+template; // add tag prefix
		var c=t.substr(0,1).toUpperCase()+t.substr(1); // capitalized for WikiWord title

		// add support for templates in systemThemes
		var skin = config.options.txtTheme;
		if(skin && store.tiddlerExists(skin)) {
			tag = tiddler.tags[i];
			s = template.replace('##','##'+tag.substr(0,1).toLowerCase()+tag.substr(1)); //lowercase tag
			S = template.replace('##','##'+tag.substr(0,1).toUpperCase()+tag.substr(1)); //uppercase tag
		}

		if (store.tiddlerExists(t)) { template=t; console.log("t: " + template); break; }
		if (store.tiddlerExists(c)) { template=c; console.log("c: " + template); break; }
		if (store.getTiddlerText(s)) { template=s; console.log("s: " + template); break; }
		if (store.getTiddlerText(S)) { template=s; console.log("s: " + template); break; }
	}
	
	return template;
};
//}}}