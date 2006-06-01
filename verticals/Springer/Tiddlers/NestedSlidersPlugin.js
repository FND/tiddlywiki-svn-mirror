/***
''NestedSlidersPlugin for TiddlyWiki version 1.2.x and 2.0''
^^author: Eric Shulman
source: http://www.TiddlyTools.com/#NestedSlidersPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

Quickly make any tiddler content into an expandable 'slider' panel, without needing to create a separate tiddler to contain the slider content.  Optional syntax allows ''default to open'', ''custom button label/tooltip'' and ''automatic blockquote formatting.''

You can also 'nest' these sliders as deep as you like (see complex nesting example below), so that expandable 'tree-like' hierarchical displays can be created.  This is most useful when converting existing in-line text content to create in-line annotations, footnotes, context-sensitive help, or other subordinate information displays.

For more details, please click on a section headline below:
++++!!!!![Configuration]>
Debugging messages for 'lazy sliders' deferred rendering:
<<option chkDebugLazySliderDefer>> show debugging alert when deferring slider rendering
<<option chkDebugLazySliderRender>> show debugging alert when deferred slider is actually rendered
===
++++!!!!![Usage]>
When installed, this plugin adds new wiki syntax for embedding 'slider' panels directly into tiddler content.  Use {{{+++}}} and {{{===}}} to delimit the slider content.  Additional optional syntax elements let you specify
*default to open
*cookiename
*heading level
*floater
*rollover
*custom label/tooltip
*automatic blockquote
*deferred rendering
The complete syntax, using all options, is:
//{{{
++++(cookiename)!!!!!^*[label|tooltip]>...
content goes here
===
//}}}
where:
* {{{+++}}} (or {{{++++}}}) and {{{===}}}^^
marks the start and end of the slider definition, respectively.  When the extra {{{+}}} is used, the slider will be open when initially displayed.^^
* {{{(cookiename)}}}^^
saves the slider opened/closed state, and restores this state whenever the slider is re-rendered.^^
* {{{!}}} through {{{!!!!!}}}^^
displays the slider label using a formatted headline (Hn) style instead of a button/link style^^
* {{{"^"}}} //(without the quotes)//^^
makes the slider 'float' on top of other content rather than shifting that content downward^^
* {{{"*"}}} //(without the quotes)//^^
automatically opens/closes slider on "rollover" as well as when clicked^^
* {{{[label]}}} or {{{[label|tooltip]}}}^^
uses custom label/tooltip.  (defaults are: ">" (more) and "<" (less)^^
* {{{">"}}} //(without the quotes)//^^
automatically adds blockquote formatting to slider content^^
* {{{"..."}}} //(without the quotes)//^^
defers rendering of closed sliders until the first time they are opened.  //Note: deferred rendering may produce unexpected results in some cases.  Use with care.//^^

//Note: to make slider definitions easier to read and recognize when editing a tiddler, newlines immediately following the {{{+++}}} 'start slider' or preceding the {{{===}}} 'end slider' sequence are automatically supressed so that excess whitespace is eliminated from the output.//
===
++++!!!!![Examples]>
simple in-line slider: 
{{{
+++
   content
===
}}}
+++
   content
===
----
use a custom label and tooltip: 
{{{
+++[label|tooltip]
   content
===
}}}
+++[label|tooltip]
   content
===
----
content automatically blockquoted: 
{{{
+++>
   content
===
}}}
+++>
   content
===
----
all options combined //(default open, cookie, heading, floater, rollover, label/tooltip, blockquoted, deferred)//
{{{
++++(testcookie)!!!^*[label|tooltip]>...
   content
===
}}}
++++(testcookie)!!!^*[label|tooltip]>...
   content
===
----
complex nesting example:
{{{
+++^[get info...|click for information]
   put some general information here, plus a floating slider with more specific info:
   +++^[view details...|click for details]
      put some detail here, which could include a rollover with a +++^*[glossary definition]explaining technical terms===
   ===
===
}}}
+++^[get info...|click for information]
   put some general information here, plus a floating slider with more specific info:
   +++^[view details...|click for details]
      put some detail here, which could include a rollover with a +++^*[glossary definition]explaining technical terms===
   ===
===
----
nested floaters
>menu: <<tiddler NestedSlidersExample>>
(see [[NestedSlidersExample]] for definition)
----
===
+++!!!!![Installation]>
import (or copy/paste) the following tiddlers into your document:
''NestedSlidersPlugin'' (tagged with <<tag systemConfig>>)
===
+++!!!!![Revision History]>

++++[2006.02.04 - 1.7.5]
add 'var' to unintended global variable declarations to avoid FireFox 1.5.0.1 crash bug when assigning to globals
===

++++[2006.01.18 - 1.7.4]
only define adjustSliderPos() function if it has not already been provided by another plugin.  This lets other plugins 'hijack' the function even when they are loaded first.
===

++++[2006.01.16 - 1.7.3]
added adjustSliderPos(place,btn,panel,panelClass) function to permit specialized logic for placement of floating panels.  While it provides improved placement for many uses of floating panels, it exhibits a relative offset positioning error when used within *nested* floating panels.  Short-term workaround is to only adjust the position for 'top-level' floaters.
===

++++[2006.01.16 - 1.7.2]
added button property to slider panel elements so that slider panel can tell which button it belongs to.  Also, re-activated and corrected animation handling so that nested sliders aren't clipped by hijacking Slider.prototype.stop so that "overflow:hidden" can be reset to "overflow:visible" after animation ends
===

++++[2006.01.14 - 1.7.1]
added optional "^" syntax for floating panels.  Defines new CSS class, ".floatingPanel", as an alternative for standard in-line ".sliderPanel" styles.
===

++++[2006.01.14 - 1.7.0]
added optional "*" syntax for rollover handling to show/hide slider without requiring a click (Based on a suggestion by tw4efl)
===

+++[2006.01.03 - 1.6.2]
When using optional "!" heading style, instead of creating a clickable "Hn" element, create an "A" element inside the "Hn" element.  (allows click-through in SlideShowPlugin, which captures nearly all click events, except for hyperlinks)
===

+++[2005.12.15 - 1.6.1]
added optional "..." syntax to invoke deferred ('lazy') rendering for initially hidden sliders
removed checkbox option for 'global' application of lazy sliders
===

+++[2005.11.25 - 1.6.0]
added optional handling for 'lazy sliders' (deferred rendering for initially hidden sliders)
===

+++[2005.11.21 - 1.5.1]
revised regular expressions: if present, a single newline //preceding// and/or //following// a slider definition will be suppressed so start/end syntax can be place on separate lines in the tiddler 'source' for improved readability.  Similarly, any whitespace (newlines, tabs, spaces, etc.) trailing the 'start slider' syntax or preceding the 'end slider' syntax is also suppressed.
===

+++[2005.11.20 - 1.5.0]
   added (cookiename) syntax for optional tracking and restoring of slider open/close state
===

+++[2005.11.11 - 1.4.0]
   added !!!!! syntax to render slider label as a header (Hn) style instead of a button/link style
===

+++[2005.11.07 - 1.3.0]
   removed alternative syntax {{{(((}}} and {{{)))}}} (so they can be used by other
   formatting extensions) and simplified/improved regular expressions to trim multiple excess newlines
===

+++[2005.11.05 - 1.2.1]
   changed name to NestedSlidersPlugin
   more documentation
===

+++[2005.11.04 - 1.2.0]
   added alternative character-mode syntax {{{(((}}} and {{{)))}}}
   tweaked "eat newlines" logic for line-mode {{{+++}}} and {{{===}}} syntax
===

+++[2005.11.03 - 1.1.1]
   fixed toggling of default tooltips ("more..." and "less...") when a non-default button label is used
   code cleanup, added documentation
===

+++[2005.11.03 - 1.1.0]
   changed delimiter syntax from {{{(((}}} and {{{)))}}} to {{{+++}}} and {{{===}}}
   changed name to EasySlidersPlugin
===

+++[2005.11.03 - 1.0.0]
   initial public release
===

===
+++!!!!![Credits]>
This feature was implemented by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]] with research, programming and suggestions from RodneyGomes, GeoffSlocock, and PaulPetterson
===
***/
// //+++!!!!![Code]
//{{{
version.extensions.nestedSliders = {major: 1, minor: 7, revision: 5, date: new Date(2006,2,4)};
//}}}

//{{{
// options for deferred rendering of sliders that are not initially displayed
if (config.options.chkDebugLazySliderDefer==undefined) config.options.chkDebugLazySliderDefer=false;
if (config.options.chkDebugLazySliderRender==undefined) config.options.chkDebugLazySliderRender=false;

// default styles for 'floating' class
setStylesheet(".floatingPanel { position:absolute; z-index:10; padding:0.5em; margin:0em; \s
	background-color:#eee; color:#000; border:1px solid #000; text-align:left; }","floatingPanelStylesheet");
//}}}

//{{{
config.formatters.push( {
	name: "nestedSliders",
	match: "\s\sn?\s\s+{3}",
	terminator: "\s\ss*\s\s={3}\s\sn?",
	lookahead: "\s\sn?\s\s+{3}(\s\s+)?(\s\s([^\s\s)]*\s\s))?(\s\s!*)?(\s\s^)?(\s\s*)?(\s\s[[^\s\s]]*\s\s])?(\s\s>)?(\s\s.\s\s.\s\s.)?\s\ss*",
	handler: function(w)
		{
			var lookaheadRegExp = new RegExp(this.lookahead,"mg");
			lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = lookaheadRegExp.exec(w.source)
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
				// location for rendering button and panel
				var place=w.output;

				// default to closed, no cookie
				var show="none"; var title=">"; var tooltip="show"; var cookie="";

				// extra "+", default to open
				if (lookaheadMatch[1])
					{ show="block"; title="<"; tooltip="hide"; }

				// cookie, use saved open/closed state
				if (lookaheadMatch[2]) {
					cookie=lookaheadMatch[2].trim().substr(1,lookaheadMatch[2].length-2);
					cookie="chkSlider"+cookie;
					if (config.options[cookie]==undefined)
						{ config.options[cookie] = (show=="block") }
					if (config.options[cookie])
						{ show="block"; title="<"; tooltip="hide"; }
					else
						{ show="none"; title=">"; tooltip="show"; }
				}

				// custom label/tooltip
				if (lookaheadMatch[6]) {
					title = lookaheadMatch[6].trim().substr(1,lookaheadMatch[6].length-2);
					var pos=title.indexOf("|");
					if (pos!=-1)
						{ tooltip = title.substr(pos+1,title.length); title = title.substr(0,pos); }
					else
						{ tooltip += " "+title; }
				}

				// create the button
				if (lookaheadMatch[3]) { // use "Hn" header format instead of button/link
					var lvl=(lookaheadMatch[3].length>6)?6:lookaheadMatch[3].length;
					var btn = createTiddlyElement(createTiddlyElement(place,"h"+lvl,null,null,null),"a",null,null,title);
					btn.onclick=onClickNestedSlider;
					btn.setAttribute("href","javascript:;");
					btn.setAttribute("title",tooltip);
				}
				else
					var btn = createTiddlyButton(place,title,tooltip,onClickNestedSlider);
				btn.sliderCookie = cookie; // save the cookiename (if any) in the button object

				// "non-click" MouseOver open/close slider
				if (lookaheadMatch[5]) btn.onmouseover=onClickNestedSlider;

				// create slider panel
				var panelClass=lookaheadMatch[4]?"floatingPanel":"sliderPanel";
				var panel=createTiddlyElement(place,"div",null,panelClass,null);
				panel.style.display = show;
				panel.button = btn; // so the slider panel know which button it belongs to
				btn.sliderPanel=panel;

				// render slider (or defer until shown) 
				w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
				if (lookaheadMatch[1]||!lookaheadMatch[8]) {
					// render now if "++++" (init open) or NOT "..." (deferred render)
					w.subWikify(lookaheadMatch[7]?createTiddlyElement(panel,"blockquote"):panel,this.terminator);
					// align slider/floater position with button
					adjustSliderPos(place,btn,panel,panelClass);
				}
				else {
					var src = w.source.substr(w.nextMatch);
					var endpos=findMatchingDelimiter(src,"+++","===");
					panel.setAttribute("raw",src.substr(0,endpos));
					panel.setAttribute("blockquote",lookaheadMatch[7]?"true":"false");
					panel.setAttribute("rendered","false");
					w.nextMatch += endpos+3;
					if (w.source.substr(w.nextMatch,1)=="\sn") w.nextMatch++;
					if (config.options.chkDebugLazySliderDefer) alert("deferred '"+title+"':\sn\sn"+panel.getAttribute("raw"));
				}
			}
		}
	}
)

// TBD: ignore 'quoted' delimiters (e.g., "{{{+++foo===}}}" isn't really a slider)
function findMatchingDelimiter(src,starttext,endtext) {
	var startpos = 0;
	var endpos = src.indexOf(endtext);
	// check for nested delimiters
	while (src.substring(startpos,endpos-1).indexOf(starttext)!=-1) {
		// count number of nested 'starts'
		var startcount=0;
		var temp = src.substring(startpos,endpos-1);
		var pos=temp.indexOf(starttext);
		while (pos!=-1)  { startcount++; pos=temp.indexOf(starttext,pos+starttext.length); }
		// set up to check for additional 'starts' after adjusting endpos
		startpos=endpos+endtext.length;
		// find endpos for corresponding number of matching 'ends'
		while (startcount && endpos!=-1) {
			endpos = src.indexOf(endtext,endpos+endtext.length);
			startcount--;
		}
	}
	return (endpos==-1)?src.length:endpos;
}
//}}}

//{{{
function onClickNestedSlider(e)
{
	if (!e) var e = window.event;
	var theTarget = resolveTarget(e);
	var theLabel = theTarget.firstChild.data;
	var theSlider = theTarget.sliderPanel
	var isOpen = theSlider.style.display!="none";
	// if using default button labels, toggle labels
	if (theLabel==">") theTarget.firstChild.data = "<";
	else if (theLabel=="<") theTarget.firstChild.data = ">";
	// if using default tooltips, toggle tooltips
	if (theTarget.getAttribute("title")=="show")
		theTarget.setAttribute("title","hide");
	else if (theTarget.getAttribute("title")=="hide")
		theTarget.setAttribute("title","show");
	if (theTarget.getAttribute("title")=="show "+theLabel)
		theTarget.setAttribute("title","hide "+theLabel);
	else if (theTarget.getAttribute("title")=="hide "+theLabel)
		theTarget.setAttribute("title","show "+theLabel);
	// deferred rendering (if needed)
	if (theSlider.getAttribute("rendered")=="false") {
		if (config.options.chkDebugLazySliderRender)
			alert("rendering '"+theLabel+"':\sn\sn"+theSlider.getAttribute("raw"));
		var place=theSlider;
		if (theSlider.getAttribute("blockquote")=="true")
			place=createTiddlyElement(place,"blockquote");
		wikify(theSlider.getAttribute("raw"),place);
		theSlider.setAttribute("rendered","true");
	}
	// show/hide the slider
	if(config.options.chkAnimate)
		anim.startAnimating(new Slider(theSlider,!isOpen,e.shiftKey || e.altKey,"none"));
	else
		theSlider.style.display = isOpen ? "none" : "block";
	if (this.sliderCookie && this.sliderCookie.length)
		{ config.options[this.sliderCookie]=!isOpen; saveOptionCookie(this.sliderCookie); }
	// align slider/floater position with target button
	adjustSliderPos(theSlider.parentNode,theTarget,theSlider,theSlider.className);
	return false;
}

// hijack animation handler 'stop' handler so overflow is visible after animation has completed
Slider.prototype.coreStop = Slider.prototype.stop;
Slider.prototype.stop = function() { this.coreStop(); this.element.style.overflow = "visible"; }

// adjust panel position based on button position
if (window.adjustSliderPos==undefined) window.adjustSliderPos=function(place,btn,panel,panelClass) {
	///////////////////////////////////////////////////////////////////////////////
	/// EXPERIMENTAL HACK - WORKS IN SOME CASES, NOT IN OTHERS
	///////////////////////////////////////////////////////////////////////////////
	// "if this panel is floating and the parent is not also a floating panel"...
	if (panelClass=="floatingPanel" && place.className!="floatingPanel") {
		var left=0; var top=btn.offsetHeight;
		if (place.style.position!="relative") { left+=findPosX(btn); top+=findPosY(btn); }
		panel.style.left=left+"px"; panel.style.top=top+"px";
	}
}
//}}}
// //===