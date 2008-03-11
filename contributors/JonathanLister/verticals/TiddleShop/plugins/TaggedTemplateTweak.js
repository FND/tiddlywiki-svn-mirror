/***
|Name|TaggedTemplateTweak|
|Source|http://www.TiddlyTools.com/#TaggedTemplateTweak|
|Version|1.1.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.chooseTemplateForTiddler()|
|Description|use alternative ViewTemplate/EditTemplate for tiddler's tagged with specific tag values|
The core function, "story.chooseTemplateForTiddler(title,template)" is essentially a "pass-thru" that returns the same template it was given, and is provided by the core so that plugins can customize the template selection logic to select alternative templates, based on whatever programmatic criteria is appropriate.  This tweak extends story.chooseTemplateForTiddler() so that ''whenever a tiddler is marked with a specific tag value, it can be viewed and/or edited using alternatives to the standard tiddler templates.'' 
!!!!!Usage
<<<
Each alternative template is associated with a specific tiddler tag value by using that tag value as a prefix added to the standard TiddlyWiki template titles, [[ViewTemplate]] and [[EditTemplate]].

For example, any tiddlers that are tagged with ''<<tag media>>'' will look for alternative templates named [[mediaViewTemplate]] and [[mediaEditTemplate]].  Additionally, in order to find templates that have proper WikiWord tiddler titles (e.g., [[MediaViewTemplate]] and [[MediaEditTemplate]]), the plugin will also attempt to use a capitalized form of the tag value (e.g., ''Media'') as a prefix.  //This capitalization is for comparison purposes only and will not alter the actual tag values that are stored in the tiddler.//

If no matching alternative template can be found by using //any// of the tiddler's tags (either "as-is" or capitalized), the tiddler defaults to using the appropriate standard [[ViewTemplate]] or [[EditTemplate]] definition.

''To add your own custom templates:''
>First, decide upon a suitable tag keyword to uniquely identify your custom templates and create custom view and/or edit templates using that keyword as a prefix (e.g., "KeywordViewTemplate" and "KeywordEditTemplate").  Then, simply create a tiddler and tag it with your chosen keyword... that's it!  As long as the tiddler is tagged with your keyword, it will be displayed using the corresponding alternative templates.  If you remove the tag or rename/delete the alternative templates, the tiddler will revert to using the standard viewing and editing templates.
<<<
!!!!!Examples
<<<
|Sample tiddler| tag | view template | edit template |
|[[MediaSample - QuickTime]]| <<tag media>> | [[MediaViewTemplate]] | [[MediaEditTemplate]] |
|[[MediaSample - Windows]]| <<tag media>> | [[MediaViewTemplate]] | [[MediaEditTemplate]] |
|[[CDSample]]| <<tag CD>> | [[CDViewTemplate]] | [[CDEditTemplate]] |
|<<newTiddler label:"create new task..." title:SampleTask tag:task text:"Type some text and then press DONE to view the task controls">> | <<tag task>> | [[TaskViewTemplate]] | [[EditTemplate]] |

//(note: if these samples are not present in your document, please visit// http://www.TiddlyTools.com/ //to view these sample tiddlers on-line)//
<<<
!!!!!Revisions
<<<
2007.06.23 [1.1.0] re-written to use automatic 'tag prefix' search instead of hard coded check for each tag.  Allows new custom tags to be used without requiring code changes to this plugin.
2007.06.11 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.taggedTemplate= {major: 1, minor: 1, revision: 0, date: new Date(2007,6,18)};
Story.prototype.taggedTemplate_chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler
Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	// get default template from core
	var template=this.taggedTemplate_chooseTemplateForTiddler.apply(this,arguments);

	// if the tiddler to be rendered doesn't exist yet, just return core result
	var tiddler=store.getTiddler(title); if (!tiddler) return template;

	// look for template whose prefix matches a tag on this tiddler
	for (t=0; t<tiddler.tags.length; t++) {
		var tag=tiddler.tags[t];
		if (store.tiddlerExists(tag+template)) { template=tag+template; break; }
		// try capitalized tag (to match WikiWord template titles)
		var cap=tag.substr(0,1).toUpperCase()+tag.substr(1);
		if (store.tiddlerExists(cap+template)) { template=cap+template; break; }
	}

	return template;
}
//}}}