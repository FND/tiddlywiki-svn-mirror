/***
|''Name:''|TiddlySpaceLinkPlugin|
|''Description:''|Formatter to reference other spaces from wikitext |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TiddlySpaceLinkPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TiddlySpaceLinkPlugin/ |
|''Version:''|0.9|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin provides wikitext formatters for referencing another [[space|Space]] on the same TiddlySpace server, as in the following examples:
<<<
  {{{@space}}} -- @space 
  {{{~@space}}} -- ~@space 
  {{{Tiddler@space}}} -- Tiddler@space
  {{{[[Tiddler Title]]@space}}} -- [[Tiddler Title]]@space 
  {{{[[Link text|Tiddler Title]]@space}}} -- [[Link text|Tiddler Title]]@space
<<<
Links to tiddlers with a title begining with an "@" remain as tiddlyLinks:
<<<
  {{{[[@tiddler]]}}} -- [[@tiddler]]
<<<
and these may be changed into a space link using {{{@@}}}:
<<<
  {{{[[@@space]]}}} -- [[@@space]]
  {{{[[Link to an another space|@@space]]}}} -- [[Link to another space|@@space]]
  {{{[[@space|@@space]]}}} -- [[@space|@@space]]
<<<
TiddlySpace includes the [[TiddlySpaceLinkPlugin]] which provides WikiText markup for linking to other spaces on the same server. For example @glossary is a link to the {{{glossary}}} space and [[Small Trusted Group]]@glossary a link to an individual tiddler in the @glossary space. Prefixing the link with a tilde escapes the link, for example {{{~@space}}}.
Email addresses, for example joe.bloggs@example.com and mary@had.a.little.lamb.org should be unaffected.
!!Features
A bare {{{@space}}} link followed by a period is ignored e.g. @space. Use {{{[[@@space]]}}} as a workaround: [[@@space]].
The plugin provides external links decorated so that other plugins may be inclided to add features such as the ability to dynamically pull externally linked tiddlers into the current TiddlyWiki.
Wikitext linking to a space on another server, for example from a tiddler in a space on tiddlyspace.com to a tiddler or a space on example.com, isn't supported. 
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config createTiddlyText createExternalLink createTiddlyLink */

function createSpaceLink(place, spaceName, title, alt) {
	var link, a, currentSpaceName;
	try {
		// seems safe to expect this to have been initialised within TiddlySpace
		link = config.extensions.tiddlyweb.status.server_host.url;
	} catch (ex) {
		link = "http://tiddlyspace.com";
	}
	try {
		if (spaceName === config.extensions.tiddlyspace.currentSpace.name) {
			title = title || spaceName;
			a = createTiddlyLink(place, title, false);
			jQuery(a).text(alt || title);
			return a;
		}
	} catch (ex1) {
		currentSpaceName = false;
	}

	// assumes a http URI without user:pass@ prefix
	link = link.replace("http://", "http://" + spaceName.toLowerCase() + ".");

	if (title) {
		a = createExternalLink(place, link + "#" + encodeURIComponent(String.encodeTiddlyLink(title)), alt || title);
	} else {
		a = createExternalLink(place, link, alt || spaceName);
	}
	jQuery(a).addClass('tiddlySpaceLink').attr('tiddlyspace', spaceName).attr('tiddler', title);
	return a;
}

(function ($) {
	version.extensions.TiddlySpaceLinkPlugin = {installed: true};

	config.textPrimitives.spaceName = "[a-zA-Z][a-zA-Z0-9-]*";
	config.textPrimitives.spaceNameStrict = "[a-z][a-z0-9-]*";

	config.formatters.splice(0, 0, {
		name: "spacenameLink",
		match: config.textPrimitives.unWikiLink + "?" + config.textPrimitives.anyLetter + "*@" + config.textPrimitives.spaceName + ".?",
		lookaheadRegExp: new RegExp(config.textPrimitives.unWikiLink + "?(" + config.textPrimitives.anyLetter + "*)@(" + config.textPrimitives.spaceName + ")", "mg"),
		handler: function (w) {
			if (w.matchText.substr(w.matchText.length - 1, 1) === '.') {
				w.outputText(w.output, w.matchStart, w.nextMatch);
				return;
			}
			if (w.matchText.substr(0, 1) === config.textPrimitives.unWikiLink) {
				w.outputText(w.output, w.matchStart + 1, w.nextMatch);
				return;
			}
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				createSpaceLink(w.output, lookaheadMatch[2], lookaheadMatch[1]);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},
	{
		name: "tiddlySpaceLink",
		match: "\\[\\[[^\\|]*\\|*@@" + config.textPrimitives.spaceName + "\\]",
		lookaheadRegExp: new RegExp("\\[\\[(.*?)(?:\\|@@(.*?))?\\]\\]", "mg"),
		handler: function (w) {
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				var alt = lookaheadMatch[2] ? lookaheadMatch[1] : lookaheadMatch[1].replace(/^@@/, "");
				var space = lookaheadMatch[2] || alt;
				createSpaceLink(w.output, space, "", alt);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},
	{
		name: "tiddlyLinkSpacenameLink",
		match: "\\[\\[[^\\[]*\\]\\]@",
		lookaheadRegExp: new RegExp("\\[\\[(.*?)(?:\\|(.*?))?\\]\\]@(" + config.textPrimitives.spaceName + ")", "mg"),
		handler: function (w) {
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				var title = lookaheadMatch[2] || lookaheadMatch[1];
				var alt = lookaheadMatch[1] || lookaheadMatch[2];
				createSpaceLink(w.output, lookaheadMatch[3], title, alt);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	});
}(jQuery));
//}}}
