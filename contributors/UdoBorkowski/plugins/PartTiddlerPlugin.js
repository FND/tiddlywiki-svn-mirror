/***
|<html><a name="Top"/></html>''Name:''|PartTiddlerPlugin|
|''Version:''|1.0.6 (2006-11-07)|
|''Source:''|http://tiddlywiki.abego-software.de/#PartTiddlerPlugin|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''Licence:''|[[BSD open source license]]|
|''TiddlyWiki:''|2.0|
|''Browser:''|Firefox 1.0.4+; InternetExplorer 6.0|
!Table of Content<html><a name="TOC"/></html>
* <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Description',null, event)">Description, Syntax</a></html>
* <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Applications',null, event)">Applications</a></html>
** <html><a href="javascript:;" onclick="window.scrollAnchorVisible('LongTiddler',null, event)">Refering to Paragraphs of a Longer Tiddler</a></html>
** <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Citation',null, event)">Citation Index</a></html>
** <html><a href="javascript:;" onclick="window.scrollAnchorVisible('TableCells',null, event)">Creating "multi-line" Table Cells</a></html>
** <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Tabs',null, event)">Creating Tabs</a></html>
** <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Sliders',null, event)">Using Sliders</a></html>
* <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Revisions',null, event)">Revision History</a></html>
* <html><a href="javascript:;" onclick="window.scrollAnchorVisible('Code',null, event)">Code</a></html>
!Description<html><a name="Description"/></html>
With the {{{<part aPartName> ... </part>}}} feature you can structure your tiddler text into separate (named) parts. 
Each part can be referenced as a "normal" tiddler, using the "//tiddlerName//''/''//partName//" syntax (e.g. "About/Features"). E.g. you may create links to the parts, use it in {{{<<tiddler...>>}}} or {{{<<tabs...>>}}} macros etc.

''Syntax:'' 
|>|''<part'' //partName// [''hidden''] ''>'' //any tiddler content// ''</part>''|
|//partName//|The name of the part. You may reference a part tiddler with the combined tiddler name "//nameOfContainerTidder//''/''//partName//.|
|''hidden''|When defined the content of the part is not displayed in the container tiddler. But when the part is explicitly referenced (e.g. in a {{{<<tiddler...>>}}} macro or in a link) the part's content is displayed.|
|<html><i>any&nbsp;tiddler&nbsp;content</i></html>|<html>The content of the part.<br>A part can have any content that a "normal" tiddler may have, e.g. you may use all the formattings and macros defined.</html>|
|>|~~Syntax formatting: Keywords in ''bold'', optional parts in [...]. 'or' means that exactly one of the two alternatives must exist.~~|
<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!Applications<html><a name="Applications"/></html>
!!Refering to Paragraphs of a Longer Tiddler<html><a name="LongTiddler"/></html>
Assume you have written a long description in a tiddler and now you want to refer to the content of a certain paragraph in that tiddler (e.g. some definition.) Just wrap the text with a ''part'' block, give it a nice name, create a "pretty link" (like {{{[[Discussion Groups|Introduction/DiscussionGroups]]}}}) and you are done.

Notice this complements the approach to first writing a lot of small tiddlers and combine these tiddlers to one larger tiddler in a second step (e.g. using the {{{<<tiddler...>>}}} macro). Using the ''part'' feature you can first write a "classic" (longer) text that can be read "from top to bottom" and later "reuse" parts of this text for some more "non-linear" reading.

<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!!Citation Index<html><a name="Citation"/></html>
Create a tiddler "Citations" that contains your "citations". 
Wrap every citation with a part and a proper name. 

''Example''
{{{
<part BAX98>Baxter, Ira D. et al: //Clone Detection Using Abstract Syntax Trees.// 
in //Proc. ICSM//, 1998.</part>

<part BEL02>Bellon, Stefan: //Vergleich von Techniken zur Erkennung duplizierten Quellcodes.// 
Thesis, Uni Stuttgart, 2002.</part>

<part DUC99>Ducasse, Stéfane et al: //A Language Independent Approach for Detecting Duplicated Code.// 
in //Proc. ICSM//, 1999.</part>
}}}

You may now "cite" them just by using a pretty link like {{{[[Citations/BAX98]]}}} or even more pretty, like this {{{[[BAX98|Citations/BAX98]]}}}.

<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!!Creating "multi-line" Table Cells<html><a name="TableCells"/></html>
You may have noticed that it is hard to create table cells with "multi-line" content. E.g. if you want to create a bullet list inside a table cell you cannot just write the bullet list
{{{
* Item 1
* Item 2
* Item 3
}}}
into a table cell (i.e. between the | ... | bars) because every bullet item must start in a new line but all cells of a table row must be in one line.

Using the ''part'' feature this problem can be solved. Just create a hidden part that contains the cells content and use a {{{<<tiddler >>}}} macro to include its content in the table's cell.

''Example''
{{{
|!Subject|!Items|
|subject1|<<tiddler ./Cell1>>|
|subject2|<<tiddler ./Cell2>>|

<part Cell1 hidden>
* Item 1
* Item 2
* Item 3
</part>
...
}}}

Notice that inside the {{{<<tiddler ...>>}}} macro you may refer to the "current tiddler" using the ".".

BTW: The same approach can be used to create bullet lists with items that contain more than one line.

<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!!Creating Tabs<html><a name="Tabs"/></html>
The build-in {{{<<tabs ...>>}}} macro requires that you defined an additional tiddler for every tab it displays. When you want to have "nested" tabs you need to define a tiddler for the "main tab" and one for every tab it contains. I.e. the definition of a set of tabs that is visually displayed at one place is distributed across multiple tiddlers.

With the ''part'' feature you can put the complete definition in one tiddler, making it easier to keep an overview and maintain the tab sets.

''Example''
The standard tabs at the sidebar are defined by the following eight tiddlers:
* SideBarTabs
* TabAll
* TabMore
* TabMoreMissing
* TabMoreOrphans
* TabMoreShadowed
* TabTags
* TabTimeline

Instead of these eight tiddlers one could define the following SideBarTabs tiddler that uses the ''part'' feature:
{{{
<<tabs txtMainTab 
    Timeline Timeline SideBarTabs/Timeline 
    All 'All tiddlers' SideBarTabs/All 
    Tags 'All tags' SideBarTabs/Tags 
    More 'More lists' SideBarTabs/More>>
<part Timeline hidden><<timeline>></part>
<part All hidden><<list all>></part>
<part Tags hidden><<allTags>></part>
<part More hidden><<tabs txtMoreTab 
    Missing 'Missing tiddlers' SideBarTabs/Missing 
    Orphans 'Orphaned tiddlers' SideBarTabs/Orphans 
    Shadowed 'Shadowed tiddlers' SideBarTabs/Shadowed>></part>
<part Missing hidden><<list missing>></part>
<part Orphans hidden><<list orphans>></part>
<part Shadowed hidden><<list shadowed>></part>
}}}

Notice that you can easily "overwrite" individual parts in separate tiddlers that have the full name of the part.

E.g. if you don't like the classic timeline tab but only want to see the 100 most recent tiddlers you could create a tiddler "~SideBarTabs/Timeline" with the following content:
{{{
<<forEachTiddler 
		sortBy 'tiddler.modified' descending 
		write '(index < 100) ? "* [["+tiddler.title+"]]\sn":""'>>
}}}
<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!!Using Sliders<html><a name="Sliders"/></html>
Very similar to the build-in {{{<<tabs ...>>}}} macro (see above) the {{{<<slider ...>>}}} macro requires that you defined an additional tiddler that holds the content "to be slid". You can avoid creating this extra tiddler by using the ''part'' feature

''Example''
In a tiddler "About" we may use the slider to show some details that are documented in the tiddler's "Details" part.
{{{
...
<<slider chkAboutDetails About/Details details "Click here to see more details">>
<part Details hidden>
To give you a better overview ...
</part>
...
}}}

Notice that putting the content of the slider into the slider's tiddler also has an extra benefit: When you decide you need to edit the content of the slider you can just doubleclick the content, the tiddler opens for editing and you can directly start editing the content (in the part section). In the "old" approach you would doubleclick the tiddler, see that the slider is using tiddler X, have to look for the tiddler X and can finally open it for editing. So using the ''part'' approach results in a much short workflow.

<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!Revision history<html><a name="Revisions"/></html>
* v1.0.6 (2006-11-07)
** Bugfix: cannot edit tiddler when UploadPlugin by Bidix is installed. Thanks to José Luis González Castro for reporting the bug.
* v1.0.5 (2006-03-02)
** Bugfix: Example with multi-line table cells does not work in IE6. Thanks to Paulo Soares for reporting the bug.
* v1.0.4 (2006-02-28)
** Bugfix: Shadow tiddlers cannot be edited (in TW 2.0.6). Thanks to Torsten Vanek for reporting the bug.
* v1.0.3 (2006-02-26)
** Adapt code to newly introduced Tiddler.prototype.isReadOnly() function (in TW 2.0.6). Thanks to Paulo Soares for reporting the problem.
* v1.0.2 (2006-02-05)
** Also allow other macros than the "tiddler" macro use the "." in the part reference (to refer to "this" tiddler)
* v1.0.1 (2006-01-27)
** Added Table of Content for plugin documentation. Thanks to RichCarrillo for suggesting.
** Bugfix: newReminder plugin does not work when PartTiddler is installed. Thanks to PauloSoares for reporting.
* v1.0.0 (2006-01-25)
** initial version
<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!Code<html><a name="Code"/></html>
<html><sub><a href="javascript:;" onclick="window.scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>
***/
//{{{
//============================================================================
//                           PartTiddlerPlugin

// Ensure that the PartTiddler Plugin is only installed once.
//
if (!version.extensions.PartTiddlerPlugin) {



version.extensions.PartTiddlerPlugin = {
    major: 1, minor: 0, revision: 6,
    date: new Date(2006, 10, 7), 
    type: 'plugin',
    source: "http://tiddlywiki.abego-software.de/#PartTiddlerPlugin"
};

if (!window.abego) window.abego = {};
if (version.major < 2) alertAndThrow("PartTiddlerPlugin requires TiddlyWiki 2.0 or newer.");

//============================================================================
// Common Helpers

// Looks for the next newline, starting at the index-th char of text. 
//
// If there are only whitespaces between index and the newline 
// the index behind the newline is returned, 
// otherwise (or when no newline is found) index is returned.
//
var skipEmptyEndOfLine = function(text, index) {
	var re = /(\sn|[^\ss])/g;
	re.lastIndex = index;
	var result = re.exec(text);
	return (result && text.charAt(result.index) == '\sn') 
			? result.index+1
			: index;
}


//============================================================================
// Constants

var partEndOrStartTagRE = /(<\s/part>)|(<part(?:\ss+)((?:[^>])+)>)/mg;
var partEndTagREString = "<\s\s/part>";
var partEndTagString = "</part>";

//============================================================================
// Plugin Specific Helpers

// Parse the parameters inside a <part ...> tag and return the result.
//
// @return [may be null] {partName: ..., isHidden: ...}
//
var parseStartTagParams = function(paramText) {
	var params = paramText.readMacroParams();
	if (params.length == 0 || params[0].length == 0) return null;
	
	var name = params[0];
	var paramsIndex = 1;
	var hidden = false;
	if (paramsIndex < params.length) {
		hidden = params[paramsIndex] == "hidden";
		paramsIndex++;
	}
	
	return {
		partName: name, 
		isHidden: hidden
	};
}

// Returns the match to the next (end or start) part tag in the text, 
// starting the search at startIndex.
// 
// When no such tag is found null is returned, otherwise a "Match" is returned:
// [0]: full match
// [1]: matched "end" tag (or null when no end tag match)
// [2]: matched "start" tag (or null when no start tag match)
// [3]: content of start tag (or null if no start tag match)
//
var findNextPartEndOrStartTagMatch = function(text, startIndex) {
	var re = new RegExp(partEndOrStartTagRE);
	re.lastIndex = startIndex;
	var match = re.exec(text);
	return match;
}

//============================================================================
// Formatter

// Process the <part ...> ... </part> starting at (w.source, w.matchStart) for formatting.
//
// @return true if a complete part section (including the end tag) could be processed, false otherwise.
//
var handlePartSection = function(w) {
	var tagMatch = findNextPartEndOrStartTagMatch(w.source, w.matchStart);
	if (!tagMatch) return false;
	if (tagMatch.index != w.matchStart || !tagMatch[2]) return false;

	// Parse the start tag parameters
	var arguments = parseStartTagParams(tagMatch[3]);
	if (!arguments) return false;
	
	// Continue processing
	var startTagEndIndex = skipEmptyEndOfLine(w.source, tagMatch.index + tagMatch[0].length);
	var endMatch = findNextPartEndOrStartTagMatch(w.source, startTagEndIndex);
	if (endMatch && endMatch[1]) {
		if (!arguments.isHidden) {
			w.nextMatch = startTagEndIndex;
			w.subWikify(w.output,partEndTagREString);
		}
		w.nextMatch = skipEmptyEndOfLine(w.source, endMatch.index + endMatch[0].length);
		
		return true;
	}
	return false;
}

config.formatters.push( {
    name: "part",
    match: "<part\s\ss+[^>]+>",
	
	handler: function(w) {
		if (!handlePartSection(w)) {
			w.outputText(w.output,w.matchStart,w.matchStart+w.matchLength);
		}
	}
} )

//============================================================================
// Extend "fetchTiddler" functionality to also recognize "part"s of tiddlers 
// as tiddlers.

var currentParent = null; // used for the "." parent (e.g. in the "tiddler" macro)

// Return the match to the first <part ...> tag of the text that has the
// requrest partName.
//
// @return [may be null]
//
var findPartStartTagByName = function(text, partName) {
	var i = 0;
	
	while (true) {
		var tagMatch = findNextPartEndOrStartTagMatch(text, i);
		if (!tagMatch) return null;

		if (tagMatch[2]) {
			// Is start tag
	
			// Check the name
			var arguments = parseStartTagParams(tagMatch[3]);
			if (arguments && arguments.partName == partName) {
				return tagMatch;
			}
		}
		i += tagMatch[0].length;
	}
}

// Return the part "partName" of the given parentTiddler as a "readOnly" Tiddler 
// object, using fullName as the Tiddler's title. 
//
// All remaining properties of the new Tiddler (tags etc.) are inherited from 
// the parentTiddler.
// 
// @return [may be null]
//
var getPart = function(parentTiddler, partName, fullName) {
	var text = parentTiddler.text;
	var startTag = findPartStartTagByName(text, partName);
	if (!startTag) return null;
	
	var endIndexOfStartTag = skipEmptyEndOfLine(text, startTag.index+startTag[0].length);
	var indexOfEndTag = text.indexOf(partEndTagString, endIndexOfStartTag);

	if (indexOfEndTag >= 0) {
		var partTiddlerText = text.substring(endIndexOfStartTag,indexOfEndTag);
		var partTiddler = new Tiddler();
		partTiddler.set(
						fullName,
						partTiddlerText,
						parentTiddler.modifier,
						parentTiddler.modified,
						parentTiddler.tags,
						parentTiddler.created);
		partTiddler.abegoIsPartTiddler = true;
		return partTiddler;
	}
	
	return null;
}

// Hijack the store.fetchTiddler to recognize the "part" addresses.
//

var oldFetchTiddler = store.fetchTiddler ;
store.fetchTiddler = function(title) {
	var result = oldFetchTiddler.apply(this, arguments);
	if (!result && title) {
		var i = title.lastIndexOf('/');
		if (i > 0) {
			var parentName = title.substring(0, i);
			var partName = title.substring(i+1);
			var parent = (parentName == ".") 
					? currentParent 
					: oldFetchTiddler.apply(this, [parentName]);
			if (parent) {
				return getPart(parent, partName, parent.title+"/"+partName);
			}
		}
	}
	return result;	
};


// The user must not edit a readOnly/partTiddler
//

config.commands.editTiddler.oldIsReadOnlyFunction = Tiddler.prototype.isReadOnly;

Tiddler.prototype.isReadOnly = function() {
	// Tiddler.isReadOnly was introduced with TW 2.0.6.
	// For older version we explicitly check the global readOnly flag
	if (config.commands.editTiddler.oldIsReadOnlyFunction) {
		if (config.commands.editTiddler.oldIsReadOnlyFunction.apply(this, arguments)) return true;
	} else {
		if (readOnly) return true;
	}

	return this.abegoIsPartTiddler;
}

config.commands.editTiddler.handler = function(event,src,title)
{
	var t = store.getTiddler(title);
	// Edit the tiddler if it either is not a tiddler (but a shadowTiddler)
	// or the tiddler is not readOnly
	if(!t || !t.abegoIsPartTiddler)
		{
		clearMessage();
		story.displayTiddler(null,title,DEFAULT_EDIT_TEMPLATE);
		story.focusTiddler(title,"text");
		return false;
		}
}

// To allow the "./partName" syntax in macros we need to hijack 
// the invokeMacro to define the "currentParent" while it is running.
// 
var oldInvokeMacro = window.invokeMacro;
function myInvokeMacro(place,macro,params,wikifier,tiddler) {
	var oldCurrentParent = currentParent;
	if (tiddler) currentParent = tiddler;
	try {
		oldInvokeMacro.apply(this, arguments);
	} finally {
		currentParent = oldCurrentParent;
	}
}
window.invokeMacro = myInvokeMacro;

// Scroll the anchor anchorName in the viewer of the given tiddler visible.
// When no tiddler is defined use the tiddler of the target given event is used.
window.scrollAnchorVisible = function(anchorName, tiddler, evt) {
	var tiddlerElem = null;
	if (tiddler) {
		tiddlerElem = document.getElementById(story.idPrefix + tiddler);
	}
	if (!tiddlerElem && evt) {
		var target = resolveTarget(evt);
		tiddlerElem = story.findContainingTiddler(target);
	}
	if (!tiddlerElem) return;

	var children = tiddlerElem.getElementsByTagName("a");
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		var name = child.getAttribute("name");
		if (name == anchorName) {
			var y = findPosY(child);
			window.scrollTo(0,y);
			return;
		}
	}
}

} // of "install only once"
//}}}

/***
<html><sub><a href="javascript:;" onclick="scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>

!Licence and Copyright
Copyright (c) abego Software ~GmbH, 2006 ([[www.abego-software.de|http://www.abego-software.de]])

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

Neither the name of abego Software nor the names of its contributors may be
used to endorse or promote products derived from this software without specific
prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.

<html><sub><a href="javascript:;" onclick="scrollAnchorVisible('Top',null, event)">[Top]</sub></a></html>
***/
