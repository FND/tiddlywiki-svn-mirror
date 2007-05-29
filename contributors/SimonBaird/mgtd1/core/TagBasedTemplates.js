/***
| Name:|TagBasedTemplates|
| Source:|http://simonbaird.com/mptw/#TagBasedTemplates|
| Version:|1.0.1 (8-Mar-2006)|
| Usage:|See [[FlipMeOver!]] for an example|

!Notes
If there is more than one match the first one wins...

!History
* 1.0.1 (8-Mar-2006)
** added format string
* 1.0.0 (8-Mar-2006)
** simplified to just look for existence of "~TagNameViewTemplate" as suggested by tomo on TiddlyWikiDev
* Prototype (12-Jan-2006)

***/
//{{{

version.extensions.TagBasedTemplates = { major: 1, minor: 0, revision: 1, date: new Date(2006,3,8),
	source: "http://simonbaird.com/mptw/#TagBasedTemplates"
};

config.TagBasedTemplates = { templateFormat: "%0ViewTemplate" }; // in case you want to tweak it

story.chooseTemplateForTiddler = function(title,template) {
	if (!template) {
		var tiddler = store.getTiddler(title);
		if (tiddler)
			for (var j=0; j<tiddler.tags.length; j++) {
				var lookFor = config.TagBasedTemplates.templateFormat.format([tiddler.tags[j]]);
				if (store.tiddlerExists(lookFor))
					return lookFor;
		}
		return config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE];
	}
	return config.tiddlerTemplates[template];
};

//}}}
