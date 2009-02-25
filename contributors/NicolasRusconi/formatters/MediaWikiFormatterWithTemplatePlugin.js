/***
|''Name:''|MediaWikiFormatterForTemplatesPlugin|
|''Description:''|renders templates user from mediawikis|
|''Author:''|Nicolas Rusconi (nrusconi (at) globant (dot) com)|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/NicolasRusconi/formatters/MediaWikiFormatterPlugin.js |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/NicolasRusconi/formatters/MediaWikiFormatterPlugin.js |
|''Version:''|0.1|
|''Date:''|Feb 24, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|

***/
//{{{
var formatters = config.parsers.mediawikiFormatter.formatters;
formatters.push({
	//# render templates parameter
	name: 'mediaWikiTemplateParam',
	match: '\\{\\{\\{',
	handler: function(w) {
		var end = MediaWikiTemplate.findTBP(w.source,w.matchStart);
		if (end.end == -1) {
			createTiddlyText(w.output, "{{{");
			w.nextMatch = w.matchStart + 3;
			return;
		}
		var call = w.source.substring(w.matchStart + 3, end.end);
		if (w.tiddler.params) {
			var index = parseInt(call);
			if (isNaN(index)) {
				var paramIndex = w.tiddler.params.findByField('name', call);
				if (paramIndex != null) {
					createTiddlyText(w.output, w.tiddler.params[paramIndex].value);
				}
			} else {
				var param = w.tiddler.params[index -1];
				if (param) {
					createTiddlyText(w.output, param);
				}
			}

		} else {
			createTiddlyElement(w.output, "span", "",
				"tiddlyLinkNonExisting", w.source.substring(w.matchStart, end.end + 3));
		}
		w.nextMatch = end.end + 3;
	}
});

formatters.push({
	//# render templates used inside tiddlers
	name: 'mediaWikiTemplate',
	match: '\\{\\{',
	handler: function(w) {
		var end = MediaWikiTemplate.findDBP(w.source,w.matchStart);
		if (end.end == -1) {
			createTiddlyText(w.output, "{{");
			w.nextMatch = w.matchStart + 2;
			return;
		}
		var call = w.source.substring(w.matchStart + 2, end.end);
		var templateName = config.parsers.mediawikiFormatter.getTemplateName(call);
		var tiddler = store.getTiddler(templateName);
		if (!tiddler) {
			createTiddlyElement(w.output, "div", templateName,
				"tiddlyLinkNonExisting", "Could not found template " + templateName);
		} else {
			tiddler.params = config.parsers.mediawikiFormatter.getTemplateParams(call);
			wikify(tiddler.text, w.output, highlightHack, tiddler);
			tiddler.params = null;
		}
		w.nextMatch = end.end + 2;
	}
});

var hijackedFormater = config.parsers.mediawikiFormatter;
config.parsers.mediawikiFormatter = new Formatter(formatters);
merge(config.parsers.mediawikiFormatter,hijackedFormater, true);
config.parsers.mediawikiFormatter.getTemplateParams = function(templateCall) {
		var pipeIndex = templateCall.indexOf("|");
		var params = [];
		while (pipeIndex != -1) {
			var nextPipeIndex = templateCall.indexOf("|", pipeIndex + 1);
			var paramString = templateCall.substring(pipeIndex + 1, nextPipeIndex != -1? nextPipeIndex : templateCall.length);
			var equalsIndex = paramString.indexOf("=");
			if (equalsIndex != -1) {
				var key = paramString.substring(0, equalsIndex );
				var value = paramString.substring(equalsIndex + 1);
				var intKey = parseInt(key);
				if (isNaN(intKey)) {
					params.push({
						name: key,
						value: value
					});
				} else {
					if (!params[intKey - 1]) {
						params[intKey - 1] = value;
					}
				}
			}else {
				params.push(paramString);
			}
			pipeIndex = nextPipeIndex;
		}
		return params;
}
config.parsers.mediawikiFormatter.getTemplateName = function(templateCall) {
	var templateName = templateCall;
	var pipeIndex = templateCall.indexOf("|");
	if (pipeIndex != -1) {
		templateName = templateCall.substring(0, pipeIndex);
	}
	var colonIndex = templateName.indexOf(":")
	if (colonIndex == -1) {
		templateName = "Template:" + templateName;
	} else if (colonIndex == 0) {
		templateName = templateName.substring(1);
	}
	return templateName;
}

//}}}
