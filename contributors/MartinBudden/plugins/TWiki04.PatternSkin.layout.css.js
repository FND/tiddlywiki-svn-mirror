/***
|''Name:''|TWiki04.PatternSkin.layout.css|
|''Source:''| http://www.twiki.org/p/pub/TWiki04/PatternSkin/layout.css |
***/

/*{{{*/
/* 
Basic layout derived from http://www.positioniseverything.net/articles/pie-maker/pagemaker_form.php.
I've changed many so things that I won't put a full copyright notice. However all hacks (and comments!) are far beyond my knowledge and this deserves full credits:

Original copyright notice:
Parts of these notes are
(c) Big John @ www.positioniseverything.net and (c) Paul O'Brien @ www.pmob.co.uk, all of whom contributed significantly to the design of
the css and html code.

Reworked for TWiki: (c) Arthur Clemens @ visiblearea.com
*/

html, body {
	margin:0; /*** Do NOT set anything other than a left margin for the page
as this will break the design ***/
	padding:0;
	border:0;
/* \*/
	height:100%;
/* Last height declaration hidden from Mac IE 5.x */
}
body {
	background:#fff;
	min-width:100%; /*** This is needed for moz. Otherwise, the header and patternBottomBar will
slide off the left side of the page if the screen width is narrower than the design.
Not seen by IE. Left Col + Right Col + Center Col + Both Inner Borders + Both Outer Borders ***/
	text-align:center; /*** IE/Win (not IE/MAC) alignment of page ***/
}
.clear {
	clear:both;
	/*** these next attributes are designed to keep the div
	height to 0 pixels high, critical for Safari and Netscape 7 ***/
	height:0px;
	overflow:hidden;
	line-height:1%;
	font-size:0px;
}

#patternWrapper {
	height:100%; /*** moz uses this to make full height design. As this #patternWrapper is inside the #patternPage which is 100% height, moz will not inherit heights further into the design inside this container, which you should be able to do with use of the min-height style. Instead, Mozilla ignores the height:100% or min-height:100% from this point inwards to the center of the design - a nasty bug.
If you change this to height:100% moz won't expand the design if content grows.
Aaaghhh. I pulled my hair out over this for days. ***/
/* \*/
	height:100%;
/* Last height declaration hidden from Mac IE 5.x */
/*** Fixes height for non moz browsers, to full height ***/
}
#patternWrapp\65	r{ /*** for Opera and Moz (and some others will see it, but NOT Safari) ***/
	height:auto; /*** For moz to stop it fixing height to 100% ***/
}
/* \*/
* html #patternWrapper{
	height:100%;
}

#patternPage {
	margin-left:auto; /*** Mozilla/Opera/Mac IE 5.x alignment of page ***/
	margin-right:auto; /*** Mozilla/Opera/Mac IE 5.x alignment of page ***/
	text-align:left; /*** IE Win re-alignment of page if page is centered ***/
	position:relative;
	width:100%; /*** Needed for Moz/Opera to keep page from sliding to left side of
page when it calculates auto margins above. Can't use min-width. Note that putting
width in #patternPage shows it to IE and causes problems, so IE needs a hack
to remove this width. Left Col + Right Col + Center Col + Both Inner Border + Both Outer Borders ***/
/* \*/

/* Last height declaration hidden from Mac IE 5.x */
/*** Needed for Moz to give full height design if page content is
too small to fill the page ***/
}
/* Last style with height declaration hidden from Mac IE 5.x */
/*** Fixes height for IE, back to full height,
from esc tab hack moz min-height solution ***/
#patternOuter {
	z-index:1; /*** Critical value for Moz/Opera Background Column colors fudge to work ***/
	position:relative; /*** IE needs this or the contents won't show outside the parent container. ***/

	height:100%;
/* Last height declaration hidden from Mac IE 5.x */
/*** Needed for full height inner borders in Win IE ***/
}

#patternFloatWrap {
	width:100%;
	float:left;
	display:inline;
}

#patternLeftBar {
	/* Left bar width is defined in viewleftbar.pattern.tmpl */
	float:left;
	display:inline;
	overflow:hidden;
}
#patternLeftBarContents {
	left:-1px;
	position:relative;
	/* for margins and paddings use style.css */
}
#patternMain {
	width:100%;
	float:right;
	display:inline;
}
#patternTopBar {
	/* Top bar height is defined in viewtopbar.pattern.tmpl */
	z-index:1; /*** Critical value for Moz/Opera Background Column colors fudge to work ***/
	position:absolute;
	top:0px;
	width:100%;
}
#patternTopBarContents {
	height:1%; /* or Win IE won't display a background */
	/* for margins/paddings use style.css */
}
#patternBottomBar {
	z-index:1; /* Critical value for Moz/Opera Background Column colors fudge to work */
	clear:both;
	width:100%;
}

/* Pages that are not view */

.patternNoViewPage #patternOuter {
	/* no left bar, margin at both sides */
	margin-left:4%;
	margin-right:4%;
}

/* edit.pattern.tmpl */

.patternEditPage #patternOuter,
.patternPreviewPage #patternOuter {
	margin-left:0;
	margin-right:0;
}

.twikiLeft {
	float:left;
	position:relative;
}
.twikiRight {
	position:relative;
	float:right;
	display:inline;
	margin:0;
}
.twikiClear {
	/* to clean up floats */
	margin:0;
	padding:0;
	height:0;
	line-height:0px;
	clear:both;
	display:block;
}
.twikiHidden {
	display:none;
}
.twikiLast,
.patternTopic .twikiLast {
	border-bottom:0px;
}

/*}}}*/
