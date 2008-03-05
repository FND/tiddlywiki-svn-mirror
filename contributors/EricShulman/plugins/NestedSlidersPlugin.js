/***
|Name|NestedSlidersPlugin|
|Source|http://www.TiddlyTools.com/#NestedSlidersPlugin|
|Documentation|http://www.TiddlyTools.com/#NestedSlidersPluginInfo|
|Version|2.3.4|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Description|show content in nest-able sliding/floating panels, without creating separate tiddlers for each panel's content|
This plugin adds new wiki syntax for embedding 'slider' panels directly into tiddler content.  
!!!!!Documentation
>see [[NestedSlidersPluginInfo]]
!!!!!Configuration
<<<
Enable animation for slider panels
<<option chkFloatingSlidersAnimate>> allow sliders to animate when opening/closing
>(note: This setting is in //addition// to the general option for enabling/disabling animation effects:
><<option chkAnimate>> enable animations (entire document)
>For slider animation to occur, you must also allow animation in general.

Debugging messages for 'lazy sliders' deferred rendering:
<<option chkDebugLazySliderDefer>> show debugging alert when deferring slider rendering
<<option chkDebugLazySliderRender>> show debugging alert when deferred slider is actually rendered
<<<
!!!!!Revisions
<<<
2008.01.08 - [*.*.*] plugin size reduction: documentation moved to ...Info tiddler
2007.12.28 - 2.3.4 added hijack for Animator.prototype.startAnimating().  Previously, the plugin code simply set the overflow to "visible" after animation.  This code tweak corrects handling of elements that were styled with overflow=hidden/auto/scroll before animation by saving the overflow style and then restoring it after animation has completed.
|please see [[NestedSlidersPluginInfo]] for additional revision details|
2005.11.03 - 1.0.0 initial public release.  Thanks to RodneyGomes, GeoffSlocock, and PaulPetterson for suggestions and experiments.
<<<
!!!!!Code
***/
//{{{
version.extensions.nestedSliders = {major: 2, minor: 3, revision: 4, date: new Date(2007,12,28)};
//}}}

//{{{
// options for deferred rendering of sliders that are not initially displayed
if (config.options.chkDebugLazySliderDefer==undefined) config.options.chkDebugLazySliderDefer=false;
if (config.options.chkDebugLazySliderRender==undefined) config.options.chkDebugLazySliderRender=false;
if (config.options.chkFloatingSlidersAnimate==undefined) config.options.chkFloatingSlidersAnimate=false;

// default styles for 'floating' class
setStylesheet(".floatingPanel { position:absolute; z-index:10; padding:0.5em; margin:0em; \
	background-color:#eee; color:#000; border:1px solid #000; text-align:left; }","floatingPanelStylesheet");
//}}}

//{{{
config.formatters.push( {
	name: "nestedSliders",
	match: "\\n?\\+{3}",
	terminator: "\\s*\\={3}\\n?",
	lookahead: "\\n?\\+{3}(\\+)?(\\([^\\)]*\\))?(\\!*)?(\\^(?:[^\\^\\*\\[\\>]*\\^)?)?(\\*)?(?:\\{\\{([\\w]+[\\s\\w]*)\\{)?(\\[[^\\]]*\\])?(\\[[^\\]]*\\])?(?:\\}{3})?(\\#[^:]*\\:)?(\\>)?(\\.\\.\\.)?\\s*",
	handler: function(w)
		{
			lookaheadRegExp = new RegExp(this.lookahead,"mg");
			lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = lookaheadRegExp.exec(w.source)
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
				// var defopen=lookaheadMatch[1]
				// var cookiename=lookaheadMatch[2]
				// var header=lookaheadMatch[3]
				// var panelwidth=lookaheadMatch[4]
				// var transient=lookaheadMatch[5]
				// var class=lookaheadMatch[6]
				// var label=lookaheadMatch[7]
				// var openlabel=lookaheadMatch[8]
				// var panelID=lookaheadMatch[9]
				// var blockquote=lookaheadMatch[10]
				// var deferred=lookaheadMatch[11]

				// location for rendering button and panel
				var place=w.output;

				// default to closed, no cookie, no accesskey, no alternate text/tip
				var show="none"; var cookie=""; var key="";
				var closedtext=">"; var closedtip="";
				var openedtext="<"; var openedtip="";

				// extra "+", default to open
				if (lookaheadMatch[1]) show="block";

				// cookie, use saved open/closed state
				if (lookaheadMatch[2]) {
					cookie=lookaheadMatch[2].trim().slice(1,-1);
					cookie="chkSlider"+cookie;
					if (config.options[cookie]==undefined)
						{ config.options[cookie] = (show=="block") }
					show=config.options[cookie]?"block":"none";
				}

				// parse label/tooltip/accesskey: [label=X|tooltip]
				if (lookaheadMatch[7]) {
					var parts=lookaheadMatch[7].trim().slice(1,-1).split("|");
					closedtext=parts.shift();
					if (closedtext.substr(closedtext.length-2,1)=="=")	
						{ key=closedtext.substr(closedtext.length-1,1); closedtext=closedtext.slice(0,-2); }
					openedtext=closedtext;
					if (parts.length) closedtip=openedtip=parts.join("|");
					else { closedtip="show "+closedtext; openedtip="hide "+closedtext; }
				}

				// parse alternate label/tooltip: [label|tooltip]
				if (lookaheadMatch[8]) {
					var parts=lookaheadMatch[8].trim().slice(1,-1).split("|");
					openedtext=parts.shift();
					if (parts.length) openedtip=parts.join("|");
					else openedtip="hide "+openedtext;
				}

				var title=show=='block'?openedtext:closedtext;
				var tooltip=show=='block'?openedtip:closedtip;

				// create the button
				if (lookaheadMatch[3]) { // use "Hn" header format instead of button/link
					var lvl=(lookaheadMatch[3].length>6)?6:lookaheadMatch[3].length;
					var btn = createTiddlyElement(createTiddlyElement(place,"h"+lvl,null,null,null),"a",null,lookaheadMatch[6],title);
					btn.onclick=onClickNestedSlider;
					btn.setAttribute("href","javascript:;");
					btn.setAttribute("title",tooltip);
				}
				else
					var btn = createTiddlyButton(place,title,tooltip,onClickNestedSlider,lookaheadMatch[6]);
				btn.innerHTML=title; // enables use of HTML entities in label

				// set extra button attributes
				btn.setAttribute("closedtext",closedtext);
				btn.setAttribute("closedtip",closedtip);
				btn.setAttribute("openedtext",openedtext);
				btn.setAttribute("openedtip",openedtip);
				btn.sliderCookie = cookie; // save the cookiename (if any) in the button object
				btn.defOpen=lookaheadMatch[1]!=null; // save default open/closed state (boolean)
				btn.keyparam=key; // save the access key letter ("" if none)
				if (key.length) {
					btn.setAttribute("accessKey",key); // init access key
					btn.onfocus=function(){this.setAttribute("accessKey",this.keyparam);}; // **reclaim** access key on focus
				}
				btn.onmouseover=function(event) // mouseover on button aligns floater position with button
					{ if (window.adjustSliderPos) window.adjustSliderPos(this.parentNode,this,this.sliderPanel); }

				// create slider panel
				var panelClass=lookaheadMatch[4]?"floatingPanel":"sliderPanel";
				var panelID=lookaheadMatch[9]; if (panelID) panelID=panelID.slice(1,-1); // trim off delimiters
				var panel=createTiddlyElement(place,"div",panelID,panelClass,null);
				panel.button = btn; // so the slider panel know which button it belongs to
				btn.sliderPanel=panel; // so the button knows which slider panel it belongs to
				panel.defaultPanelWidth=(lookaheadMatch[4] && lookaheadMatch[4].length>2)?lookaheadMatch[4].slice(1,-1):"";
				panel.setAttribute("transient",lookaheadMatch[5]=="*"?"true":"false");
				panel.style.display = show;
				panel.style.width=panel.defaultPanelWidth;
				panel.onmouseover=function(event) // mouseover on panel aligns floater position with button
					{ if (window.adjustSliderPos) window.adjustSliderPos(this.parentNode,this.button,this); }

				// render slider (or defer until shown) 
				w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
				if ((show=="block")||!lookaheadMatch[11]) {
					// render now if panel is supposed to be shown or NOT deferred rendering
					w.subWikify(lookaheadMatch[10]?createTiddlyElement(panel,"blockquote"):panel,this.terminator);
					// align floater position with button
					if (window.adjustSliderPos) window.adjustSliderPos(place,btn,panel);
				}
				else {
					var src = w.source.substr(w.nextMatch);
					var endpos=findMatchingDelimiter(src,"+++","===");
					panel.setAttribute("raw",src.substr(0,endpos));
					panel.setAttribute("blockquote",lookaheadMatch[10]?"true":"false");
					panel.setAttribute("rendered","false");
					w.nextMatch += endpos+3;
					if (w.source.substr(w.nextMatch,1)=="\n") w.nextMatch++;
					if (config.options.chkDebugLazySliderDefer) alert("deferred '"+title+"':\n\n"+panel.getAttribute("raw"));
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
window.onClickNestedSlider=function(e)
{
	if (!e) var e = window.event;
	var theTarget = resolveTarget(e);
	var theLabel = theTarget.firstChild.data;
	var theSlider = theTarget.sliderPanel
	var isOpen = theSlider.style.display!="none";

	// toggle label
	theTarget.innerHTML=isOpen?theTarget.getAttribute("closedText"):theTarget.getAttribute("openedText");
	// toggle tooltip
	theTarget.setAttribute("title",isOpen?theTarget.getAttribute("closedTip"):theTarget.getAttribute("openedTip"));

	// deferred rendering (if needed)
	if (theSlider.getAttribute("rendered")=="false") {
		if (config.options.chkDebugLazySliderRender)
			alert("rendering '"+theLabel+"':\n\n"+theSlider.getAttribute("raw"));
		var place=theSlider;
		if (theSlider.getAttribute("blockquote")=="true")
			place=createTiddlyElement(place,"blockquote");
		wikify(theSlider.getAttribute("raw"),place);
		theSlider.setAttribute("rendered","true");
	}
	// show/hide the slider
	if(config.options.chkAnimate && (!hasClass(theSlider,'floatingPanel') || config.options.chkFloatingSlidersAnimate))
		anim.startAnimating(new Slider(theSlider,!isOpen,e.shiftKey || e.altKey,"none"));
	else
		theSlider.style.display = isOpen ? "none" : "block";
	// reset to default width (might have been changed via plugin code)
	theSlider.style.width=theSlider.defaultPanelWidth;
	// align floater panel position with target button
	if (!isOpen && window.adjustSliderPos) window.adjustSliderPos(theSlider.parentNode,theTarget,theSlider);
	// if showing panel, set focus to first 'focus-able' element in panel
	if (theSlider.style.display!="none") {
		var ctrls=theSlider.getElementsByTagName("*");
		for (var c=0; c<ctrls.length; c++) {
			var t=ctrls[c].tagName.toLowerCase();
			if ((t=="input" && ctrls[c].type!="hidden") || t=="textarea" || t=="select")
				{ ctrls[c].focus(); break; }
		}
	}
	var cookie=theTarget.sliderCookie;
	if (cookie && cookie.length) {
		config.options[cookie]=!isOpen;
		if (config.options[cookie]!=theTarget.defOpen)
			saveOptionCookie(cookie);
		else { // remove cookie if slider is in default display state
			var ex=new Date(); ex.setTime(ex.getTime()-1000);
			document.cookie = cookie+"=novalue; path=/; expires="+ex.toGMTString();
		}
	}
	// prevent SHIFT-CLICK from being processed by browser (opens blank window... yuck!)
	// but allow plain click to bubble up to page background (to dismiss open popup, if any)
	if (e.shiftKey) { e.cancelBubble=true; if (e.stopPropagation) e.stopPropagation(); }
	return false;
}
//}}}

//{{{
// click in document background closes transient panels 
document.nestedSliders_savedOnClick=document.onclick;
document.onclick=function(ev) { if (!ev) var ev=window.event; var target=resolveTarget(ev);
	// call original click handler
	if (document.nestedSliders_savedOnClick)
		var retval=document.nestedSliders_savedOnClick.apply(this,arguments);
	// if click was inside transient panel (or something contained by a transient panel)... leave it alone
	var p=target;
	while (p)
		if ((hasClass(p,"floatingPanel")||hasClass(p,"sliderPanel"))&&p.getAttribute("transient")=="true") break;
		else p=p.parentNode;
	if (p) return retval;
	// otherwise, find and close all transient panels...
	var all=document.all?document.all:document.getElementsByTagName("DIV");
	for (var i=0; i<all.length; i++) {
		 // if it is not a transient panel, or the click was on the button that opened this panel, don't close it.
		if (all[i].getAttribute("transient")!="true" || all[i].button==target) continue;
		// otherwise, if the panel is currently visible, close it by clicking it's button
		if (all[i].style.display!="none") window.onClickNestedSlider({target:all[i].button}) 
	}
	return retval;
};
//}}}

//{{{
// adjust floating panel position based on button position
if (window.adjustSliderPos==undefined) window.adjustSliderPos=function(place,btn,panel) {
	if (hasClass(panel,"floatingPanel")) {
		var left=0;
		var top=btn.offsetHeight; 
		if (place.style.position!="relative") {
			var left=findPosX(btn);
			var top=findPosY(btn)+btn.offsetHeight;
			var p=place; while (p && !hasClass(p,'floatingPanel')) p=p.parentNode;
			if (p) { left-=findPosX(p); top-=findPosY(p); }
		}
		if (findPosX(btn)+panel.offsetWidth > getWindowWidth())  // adjust position to stay inside right window edge
			left-=findPosX(btn)+panel.offsetWidth-getWindowWidth()+15; // add extra 15px 'fudge factor'
		panel.style.left=left+"px"; panel.style.top=top+"px";
	}
}

function getWindowWidth() {
	if(document.width!=undefined)
		return document.width; // moz (FF)
	if(document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) )
		return document.documentElement.clientWidth; // IE6
	if(document.body && ( document.body.clientWidth || document.body.clientHeight ) )
		return document.body.clientWidth; // IE4
	if(window.innerWidth!=undefined)
		return window.innerWidth; // IE - general
	return 0; // unknown
}
//}}}

//{{{
// TW2.1 and earlier:
// hijack Slider animation handler 'stop' handler so overflow is visible after animation has completed
Slider.prototype.coreStop = Slider.prototype.stop;
Slider.prototype.stop = function()
	{ this.coreStop.apply(this,arguments); this.element.style.overflow = "visible"; }

// TW2.2+
// hijack start/stop handlers so overflow style is saved and restored after animation has completed
if (version.major+.1*version.minor+.01*version.revision>=2.2) {
/**
	Animator.prototype.core_startAnimating = Animator.prototype.startAnimating;
	Animator.prototype.startAnimating = function() {
		for(var t=0; t<arguments.length; t++)
			arguments[t].element.save_overflow=arguments[t].element.style.overflow;
		return this.core_startAnimating.apply(this,arguments);
	};
**/
	Morpher.prototype.coreStop = Morpher.prototype.stop;
	Morpher.prototype.stop = function() {
		this.coreStop.apply(this,arguments);
		this.element.style.overflow = this.element.save_overflow||"visible";
	};
}
//}}}