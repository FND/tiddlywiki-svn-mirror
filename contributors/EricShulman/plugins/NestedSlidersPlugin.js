/***
|Name|NestedSlidersPlugin|
|Source|http://www.TiddlyTools.com/#NestedSlidersPlugin|
|Documentation|http://www.TiddlyTools.com/#NestedSlidersPluginInfo|
|Version|2.4.6|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Options|##Configuration|
|Description|show content in nest-able sliding/floating panels, without creating separate tiddlers for each panel's content|
!!!!!Documentation
>see [[NestedSlidersPluginInfo]]
!!!!!Configuration
<<<
<<option chkFloatingSlidersAnimate>> allow floating sliders to animate when opening/closing
>Note: This setting can cause 'clipping' problems in some versions of InternetExplorer.
>In addition, for floating slider animation to occur you must also allow animation in general (see [[AdvancedOptions]]).
<<<
!!!!!Revisions
<<<
2008.09.07 - 2.4.6 added removeOptionCookie() function for compatibility with [[CookieManagerPlugin]]
2008.06.07 - 2.4.5 in 'onmouseover' handler for 'open on hover' slider buttons,<br>use call() method when invoking document.onclick function (avoids error in IE)
|please see [[NestedSlidersPluginInfo]] for additional revision details|
2005.11.03 - 1.0.0 initial public release.  Thanks to RodneyGomes, GeoffSlocock, and PaulPetterson for suggestions and experiments.
<<<
!!!!!Code
***/
//{{{
version.extensions.NestedSlidersPlugin= {major: 2, minor: 4, revision: 6, date: new Date(2008,9,7)};

// options for deferred rendering of sliders that are not initially displayed
if (config.options.chkFloatingSlidersAnimate===undefined)
	config.options.chkFloatingSlidersAnimate=false; // avoid clipping problems in IE

// default styles for 'floating' class
setStylesheet(".floatingPanel { position:absolute; z-index:10; padding:0.5em; margin:0em; \
	background-color:#eee; color:#000; border:1px solid #000; text-align:left; }","floatingPanelStylesheet");

// if removeOptionCookie() function is not defined by TW core, define it here.
if (window.removeOptionCookie===undefined) {
window.removeOptionCookie=function(cookie) {
	var ex=new Date(); ex.setTime(ex.getTime()-1000);  // immediately expire cookie
	document.cookie = cookie+"=novalue; path=/; expires="+ex.toGMTString();
}
}

config.formatters.push( {
	name: "nestedSliders",
	match: "\\n?\\+{3}",
	terminator: "\\s*\\={3}\\n?",
	lookahead: "\\n?\\+{3}(\\+)?(\\([^\\)]*\\))?(\\!*)?(\\^(?:[^\\^\\*\\@\\[\\>]*\\^)?)?(\\*)?(\\@)?(?:\\{\\{([\\w]+[\\s\\w]*)\\{)?(\\[[^\\]]*\\])?(\\[[^\\]]*\\])?(?:\\}{3})?(\\#[^:]*\\:)?(\\>)?(\\.\\.\\.)?\\s*",
	handler: function(w)
		{
			lookaheadRegExp = new RegExp(this.lookahead,"mg");
			lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = lookaheadRegExp.exec(w.source)
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
				var defopen=lookaheadMatch[1];
				var cookiename=lookaheadMatch[2];
				var header=lookaheadMatch[3];
				var panelwidth=lookaheadMatch[4];
				var transient=lookaheadMatch[5];
				var hover=lookaheadMatch[6];
				var buttonClass=lookaheadMatch[7];
				var label=lookaheadMatch[8];
				var openlabel=lookaheadMatch[9];
				var panelID=lookaheadMatch[10];
				var blockquote=lookaheadMatch[11];
				var deferred=lookaheadMatch[12];

				// location for rendering button and panel
				var place=w.output;

				// default to closed, no cookie, no accesskey, no alternate text/tip
				var show="none"; var cookie=""; var key="";
				var closedtext=">"; var closedtip="";
				var openedtext="<"; var openedtip="";

				// extra "+", default to open
				if (defopen) show="block";

				// cookie, use saved open/closed state
				if (cookiename) {
					cookie=cookiename.trim().slice(1,-1);
					cookie="chkSlider"+cookie;
					if (config.options[cookie]==undefined)
						{ config.options[cookie] = (show=="block") }
					show=config.options[cookie]?"block":"none";
				}

				// parse label/tooltip/accesskey: [label=X|tooltip]
				if (label) {
					var parts=label.trim().slice(1,-1).split("|");
					closedtext=parts.shift();
					if (closedtext.substr(closedtext.length-2,1)=="=")	
						{ key=closedtext.substr(closedtext.length-1,1); closedtext=closedtext.slice(0,-2); }
					openedtext=closedtext;
					if (parts.length) closedtip=openedtip=parts.join("|");
					else { closedtip="show "+closedtext; openedtip="hide "+closedtext; }
				}

				// parse alternate label/tooltip: [label|tooltip]
				if (openlabel) {
					var parts=openlabel.trim().slice(1,-1).split("|");
					openedtext=parts.shift();
					if (parts.length) openedtip=parts.join("|");
					else openedtip="hide "+openedtext;
				}

				var title=show=='block'?openedtext:closedtext;
				var tooltip=show=='block'?openedtip:closedtip;

				// create the button
				if (header) { // use "Hn" header format instead of button/link
					var lvl=(header.length>5)?5:header.length;
					var btn = createTiddlyElement(createTiddlyElement(place,"h"+lvl,null,null,null),"a",null,buttonClass,title);
					btn.onclick=onClickNestedSlider;
					btn.setAttribute("href","javascript:;");
					btn.setAttribute("title",tooltip);
				}
				else
					var btn = createTiddlyButton(place,title,tooltip,onClickNestedSlider,buttonClass);
				btn.innerHTML=title; // enables use of HTML entities in label

				// set extra button attributes
				btn.setAttribute("closedtext",closedtext);
				btn.setAttribute("closedtip",closedtip);
				btn.setAttribute("openedtext",openedtext);
				btn.setAttribute("openedtip",openedtip);
				btn.sliderCookie = cookie; // save the cookiename (if any) in the button object
				btn.defOpen=defopen!=null; // save default open/closed state (boolean)
				btn.keyparam=key; // save the access key letter ("" if none)
				if (key.length) {
					btn.setAttribute("accessKey",key); // init access key
					btn.onfocus=function(){this.setAttribute("accessKey",this.keyparam);}; // **reclaim** access key on focus
				}
				btn.setAttribute("hover",hover?"true":"false");
				btn.onmouseover=function(ev) {
					// optional 'open on hover' handling
					if (this.getAttribute("hover")=="true" && this.sliderPanel.style.display=='none') {
						document.onclick.call(document,ev); // close transients
						onClickNestedSlider(ev); // open this slider
					}
					// mouseover on button aligns floater position with button
					if (window.adjustSliderPos) window.adjustSliderPos(this.parentNode,this,this.sliderPanel);
				}

				// create slider panel
				var panelClass=panelwidth?"floatingPanel":"sliderPanel";
				if (panelID) panelID=panelID.slice(1,-1); // trim off delimiters
				var panel=createTiddlyElement(place,"div",panelID,panelClass,null);
				panel.button = btn; // so the slider panel know which button it belongs to
				btn.sliderPanel=panel; // so the button knows which slider panel it belongs to
				panel.defaultPanelWidth=(panelwidth && panelwidth.length>2)?panelwidth.slice(1,-1):"";
				panel.setAttribute("transient",transient=="*"?"true":"false");
				panel.style.display = show;
				panel.style.width=panel.defaultPanelWidth;
				panel.onmouseover=function(event) // mouseover on panel aligns floater position with button
					{ if (window.adjustSliderPos) window.adjustSliderPos(this.parentNode,this.button,this); }

				// render slider (or defer until shown) 
				w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
				if ((show=="block")||!deferred) {
					// render now if panel is supposed to be shown or NOT deferred rendering
					w.subWikify(blockquote?createTiddlyElement(panel,"blockquote"):panel,this.terminator);
					// align floater position with button
					if (window.adjustSliderPos) window.adjustSliderPos(place,btn,panel);
				}
				else {
					var src = w.source.substr(w.nextMatch);
					var endpos=findMatchingDelimiter(src,"+++","===");
					panel.setAttribute("raw",src.substr(0,endpos));
					panel.setAttribute("blockquote",blockquote?"true":"false");
					panel.setAttribute("rendered","false");
					w.nextMatch += endpos+3;
					if (w.source.substr(w.nextMatch,1)=="\n") w.nextMatch++;
				}
			}
		}
	}
)

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
	while (theTarget && theTarget.sliderPanel==undefined) theTarget=theTarget.parentNode;
	if (!theTarget) return false;
	var theSlider = theTarget.sliderPanel;
	var isOpen = theSlider.style.display!="none";

	// toggle label
	theTarget.innerHTML=isOpen?theTarget.getAttribute("closedText"):theTarget.getAttribute("openedText");
	// toggle tooltip
	theTarget.setAttribute("title",isOpen?theTarget.getAttribute("closedTip"):theTarget.getAttribute("openedTip"));

	// deferred rendering (if needed)
	if (theSlider.getAttribute("rendered")=="false") {
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
		if (config.options[cookie]!=theTarget.defOpen) window.saveOptionCookie(cookie);
		else window.removeOptionCookie(cookie); // remove cookie if slider is in default display state
	}

	// prevent SHIFT-CLICK from being processed by browser (opens blank window... yuck!)
	// prevent clicks *within* a slider button from being processed by browser
	// but allow plain click to bubble up to page background (to close transients, if any)
	if (e.shiftKey || theTarget!=resolveTarget(e))
		{ e.cancelBubble=true; if (e.stopPropagation) e.stopPropagation(); }
	Popup.remove(); // close open popup (if any)
	return false;
}
//}}}
//{{{
// click in document background closes transient panels 
document.nestedSliders_savedOnClick=document.onclick;
document.onclick=function(ev) { if (!ev) var ev=window.event; var target=resolveTarget(ev);

	if (document.nestedSliders_savedOnClick)
		var retval=document.nestedSliders_savedOnClick.apply(this,arguments);
	// if click was inside a popup... leave transient panels alone
	var p=target; while (p) if (hasClass(p,"popup")) break; else p=p.parentNode;
	if (p) return retval;
	// if click was inside transient panel (or something contained by a transient panel), leave it alone
	var p=target; while (p) {
		if ((hasClass(p,"floatingPanel")||hasClass(p,"sliderPanel"))&&p.getAttribute("transient")=="true") break;
		p=p.parentNode;
	}
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
		var rightEdge=document.body.offsetWidth-1;
		var panelWidth=panel.offsetWidth;
		var left=0;
		var top=btn.offsetHeight; 
		if (place.style.position=="relative" && findPosX(btn)+panelWidth>rightEdge) {
			left-=findPosX(btn)+panelWidth-rightEdge; // shift panel relative to button
			if (findPosX(btn)+left<0) left=-findPosX(btn); // stay within left edge
		}
		if (place.style.position!="relative") {
			var left=findPosX(btn);
			var top=findPosY(btn)+btn.offsetHeight;
			var p=place; while (p && !hasClass(p,'floatingPanel')) p=p.parentNode;
			if (p) { left-=findPosX(p); top-=findPosY(p); }
			if (left+panelWidth>rightEdge) left=rightEdge-panelWidth;
			if (left<0) left=0;
		}
		panel.style.left=left+"px"; panel.style.top=top+"px";
	}
}
//}}}
//{{{
// TW2.1 and earlier:
// hijack Slider stop handler so overflow is visible after animation has completed
Slider.prototype.coreStop = Slider.prototype.stop;
Slider.prototype.stop = function()
	{ this.coreStop.apply(this,arguments); this.element.style.overflow = "visible"; }

// TW2.2+
// hijack Morpher stop handler so sliderPanel/floatingPanel overflow is visible after animation has completed
if (version.major+.1*version.minor+.01*version.revision>=2.2) {
	Morpher.prototype.coreStop = Morpher.prototype.stop;
	Morpher.prototype.stop = function() {
		this.coreStop.apply(this,arguments);
		var e=this.element;
		if (hasClass(e,"sliderPanel")||hasClass(e,"floatingPanel")) {
			// adjust panel overflow and position after animation
			e.style.overflow = "visible";
			if (window.adjustSliderPos) window.adjustSliderPos(e.parentNode,e.button,e);
		}
	};
}
//}}}