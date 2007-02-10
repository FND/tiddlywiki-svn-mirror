/***

** Mediawiki 'monobook' style sheet for CSS2-capable browsers.
** Copyright Gabriel Wicke - http://wikidev.net/
** License: GPL
**
** Loosely based on http://www.positioniseverything.net/ordered-floats.html by Big John
** and the Plone 2.0 styles, see http://plone.org/ (Alexander Limi,Joe Geldart & Tom Croucher,
** Michael Zeltner and Geir Bækholt)
** All you guys rock :)

http://en.wikipedia.org/style/monobook/main.css

***/

//{{{

#column-content {
    width: 100%;
    float: right;
    margin: 0 0 0.6em -12.2em;
    padding:0;
}
#content {
    margin: 2.8em 0 0 12.2em;
    padding: 0em 1em 1.5em 1em;
    background: White;
    border: 1px solid #aaaaaa;
    border-right: none;
    line-height: 1.5em;
    position: relative;
    z-index: 2;
}
#column-one { padding-top: 160px; }
/* the left column width is specified in class .portlet */

/* Font size:
** We take advantage of keyword scaling- browsers won't go below 9px
** More at http://www.w3.org/2003/07/30-font-size
** http://style.cleverchimp.com/font_size_intervals/altintervals.html
*/

body {
    font: x-small sans-serif;
    background: #f9f9f9 url("headbg.jpg") 0px 0px no-repeat;
    color: Black;
    margin: 0;
    padding: 0;
}

/* scale back up to a sane default */
#globalWrapper {
    font-size:127%;
    width: 100%;
    margin: 0;
    padding: 0;
}
.visualClear { clear: both; }

/* general styles */

table {
    font-size: 100%;
    background: White;
}
a {
    text-decoration: none;
    color: #002bb8;
    background: none;
}
a:visited { color: #5a3696; }
a:active { color: Orange; }
a:hover { text-decoration: underline; }
a.stub { color: #772233; }
a.new,
#p-personal a.new { color:#ba0000; }
a.new:visited,
#p-personal a.new:visited { color:#a55858; }

img {
    border: none;
    vertical-align: middle;
}
p {
    margin: 0.4em 0em 0.5em 0em;
    line-height: 1.5em;
}

p img { margin: 0; }

hr {
    height: 1px;
    color: #aaaaaa;
    background-color: #aaaaaa;
    border: 0;
    margin: 0.2em 0 0.2em 0;
}

h1, h2, h3, h4, h5, h6 {
    color: Black;
    background: none;
    font-weight: normal;
    margin: 0;
    padding-top: 0.5em;
    padding-bottom: 0.17em;
    border-bottom: 1px solid #aaaaaa;
}
h1 { font-size: 188%; }
h2 { font-size: 150%; }
h3, h4, h5, h6 { 
    border-bottom: none;
    font-weight: bold;
}
h3 { font-size: 132%; }
h4 { font-size: 116%; }
h5 { font-size: 100%; }
h6 { font-size: 80%;  }

ul { 
    line-height: 1.5em;
    list-style-type: square;
    margin: 0.3em 0 0 1.5em;
    padding:0;
    list-style-image: url("bullet.gif");
}
ol {
    line-height: 1.5em;
    margin: 0.3em 0 0 3.2em;
    padding:0;
    list-style-image: none;
}
li { margin-bottom: 0.1em; }
dt { 
    font-weight: bold; 
    margin-bottom: 0.1em;
}
dl{
    margin-top: 0.2em;
    margin-bottom: 0.5em;
}
dd {
    line-height: 1.5em;
    margin-left: 2em;
    margin-bottom: 0.1em;
}

fieldset {
    border: 1px solid #2f6fab;
    margin: 1em 0em 1em 0em;
    padding: 0em 1em 1em 1em;
    line-height: 1.5em;
}
legend {
    background: White;
    padding: 0.5em;
    font-size: 95%;
}
form {
    border: none;
    margin: 0;
}

textarea {
    border: 1px solid #2f6fab;  
    color: Black;
    background-color: white;
    width: 100%;
    padding: 0.1em;
    overflow: auto;
}
/* hide this from ie/mac and konq2.2 */
@media All {
    head:first-child+body input {
        visibility: visible;
        border: 1px solid #2f6fab;  
        color: Black;
        background-color: white;
        vertical-align: middle;
        padding: 0.2em;
    }
}
input.historysubmit {
    padding: 0 0.3em 0.3em 0.3em !important;
    font-size: 94%;
    cursor: pointer;
    height: 1.7em !important;
    margin-left: 1.6em;
}
input[type="radio"],
input[type="checkbox"] { border:none; }
select {
    border: 1px solid #2f6fab;  
    color: Black;
    vertical-align: top;
}
abbr, acronym, .explain {
    border-bottom: 1px dotted Black;
    color: Black;
    background: none;
    cursor: help;
}
q {
    font-family: Times, "Times New Roman", serif;
    font-style: italic;
}
/* disabled for now
blockquote {
    font-family: Times, "Times New Roman", serif;
    font-style: italic;
}*/
code { background-color: #f9f9f9; }
pre {
    padding: 1em;
    border: 1px dashed #2f6fab;
    color: Black;
    background-color: #f9f9f9;
    line-height: 1.1em;
}


/*
** the main content area
*/

#siteSub { display: none; }
#contentSub {
    font-size: 84%;
    line-height: 1.2em;
    margin: 0 0 1.4em 1em;
    color: #7d7d7d;
    width: auto;
}
span.subpages { display: block; }

/* Some space under the headers in the content area */
#bodyContent h1, #bodyContent h2 { margin-bottom:0.6em; }
#bodyContent h3,
#bodyContent h4,
#bodyContent h5 {
    margin-bottom: 0.3em;
}
.firstHeading { margin-bottom:0.1em; }

/* user notification thing */
.usermessage {
    background-color: #ffce7b;
    border: 1px solid #ffa500;
    color: Black;
    font-weight: bold;
    margin: 2em 0em 1em 0em;
    padding: 0.5em 1em;
    vertical-align: middle;
}
#siteNotice {
    text-align: center;
    font-size: 95%;
    padding: 0 0.9em 0 0.9em;
}
#siteNotice p { margin: none; padding: none; }
.error {
    color: red;
    font-size: larger;
}
#catlinks {
    border:1px solid #aaaaaa;
    background-color:#f9f9f9;
    padding:5px;
    margin-top: 1em;
    clear: both;
}
/* currently unused, intended to be used by a metadata box
in the bottom-right corner of the content area */
.documentDescription {
    /* The summary text describing the document */
    font-weight: bold;
    display: block;
    margin: 1em 0em;
    line-height: 1.5em;
}
.documentByLine {
    text-align: right;
    font-size: 90%;
    clear: both;
    font-weight: normal;
    color: #76797c;
}

/* emulate center */
.center {
    width: 100%;
    text-align: center;
}
*.center * {
    margin-left: auto;
    margin-right: auto;
}
/* small for tables and similar */
.small, .small * { font-size: 94%; }
table.small { font-size: 100% }

/*
** content styles
*/

#toc { 
    /*border:1px solid #2f6fab;*/
    border:1px solid #aaaaaa;
    background-color:#f9f9f9;
    padding:5px;
    font-size: 95%;
}
#toc .tocindent { margin-left: 2em; }
#toc .tocline { margin-bottom: 0px; }
#toc p { margin: 0 }
#toc .toctoggle { font-size: 94%; }
#toc .editsection { 
    margin-top: 0.7em; 
    font-size: 94%;
}

/* images */
div.floatright, table.floatright {
    clear: right;
    float: right; 
    margin: 0;
    position: relative;
    border: 0.5em solid White;
    border-width: 0.5em 0 0.8em 1.4em;
}
div.floatright p { font-style: italic; } 
div.floatleft, table.floatleft {
    float: left; 
    margin: 0.3em 0.5em 0.5em 0;
    position: relative;
    border: 0.5em solid White;
    border-width: 0.5em 1.4em 0.8em 0;
}
div.floatleft p { font-style: italic; } 
/* thumbnails */
div.thumb {
    margin-bottom: 0.5em;
    border-style: solid; border-color: White;
    width: auto;
}
div.thumb div {
    border:1px solid #cccccc;
    padding: 3px !important;
    background-color:#f9f9f9;
    font-size: 94%;
    text-align: center;
    overflow: hidden;
}
div.thumb div a img {
    border:1px solid #cccccc;
}
div.thumb div div.thumbcaption {
    border: none;
    text-align: left;
    line-height: 1.4;
    padding: 0.3em 0 0.1em 0;
}
div.magnify {
    float: right;
    border: none !important;
    background: none !important;
}
div.magnify a, div.magnify img {
    display: block;
    border: none !important;
    background: none !important;
}
div.tright {
    clear: right;
    float: right;
    border-width: 0.5em 0 0.8em 1.4em;
}
div.tleft {
    float: left;
    margin-right:0.5em;
    border-width: 0.5em 1.4em 0.8em 0;
}
.urlexpansion,
.hiddenStructure {
    display: none;
}
img.tex { vertical-align: middle; }
span.texhtml { font-family: serif; }

/*
** classes for special content elements like town boxes
** intended to be referenced directly from the wiki src
*/

/*
** User styles
*/
/* table standards */
table.rimage {
    float:right; 
    position:relative;
    margin-left:1em; 
    margin-bottom:1em;
    text-align:center;
}
.toccolours { 
    border:1px solid #aaaaaa;
    background-color:#f9f9f9;
    padding:5px;
    font-size: 95%;
}
div.townBox {
    position:relative;
    float:right;
    background:White;
    margin-left:1em;
    border: 1px solid Grey;
    padding:0.3em;
    width: 200px;
    overflow: hidden;
    clear: right;
}
div.townBox dl {
    padding: 0;
    margin: 0 0 0.3em 0; 
    font-size: 96%;
}
div.townBox dl dt {
    background: none;
    margin: 0.4em 0 0 0;
}
div.townBox dl dd {
    margin: 0.1em 0 0 1.1em;
    background-color: #f3f3f3;
}

/*
** edit views etc
*/
.special li {
    line-height: 1.4em;
    margin: 0;
    padding: 0;
}

/* Page history styling */
/* the auto-generated edit comments */
.autocomment { color: gray; }
#pagehistory span.user { 
    margin-left: 1.4em;
    margin-right: 0.4em;
}
#pagehistory span.minor { font-weight: bold; }
#pagehistory li { border: 1px solid White; }
#pagehistory li.selected { 
    background-color:#f9f9f9;
    border:1px dashed #aaaaaa;
}
/*
** Diff rendering
*/
table.diff { background:white; }
td.diff-otitle { background:#ffffff; }
td.diff-ntitle { background:#ffffff; }
td.diff-addedline { 
    background:#ccffcc;
    font-size: smaller;
}
td.diff-deletedline { 
    background:#ffffaa;
    font-size: smaller;
}
td.diff-context {
    background:#eeeeee;
    font-size: smaller;
}
span.diffchange { color: red; }

/* 
** keep the whitespace in front of the ^=, hides rule from konqueror
** this is css3, the validator doesn't like it when validating as css2 
*/
#bodyContent a[href ^="http://"],
#bodyContent a[href ^="gopher://"] {
    background: url(external.png) center right no-repeat;
    padding-right: 13px;
}
#bodyContent a[href ^="https://"],
.link-https {
    background: url("lock_icon.gif") center right no-repeat;
    padding-right: 16px;
}
#bodyContent a[href ^="mailto:"],
.link-mailto {
    background: url("mail_icon.gif") center right no-repeat;
    padding-right: 18px;
}
#bodyContent a[href ^="news://"] {
    background: url("news_icon.png") center right no-repeat;
    padding-right: 18px;
}
#bodyContent a[href ^="ftp://"],
.link-ftp {
    background: url("file_icon.gif") center right no-repeat;
    padding-right: 18px;
}
#bodyContent a[href ^="irc://"],
.link-irc {
    background: url("discussionitem_icon.gif")  center right no-repeat;
    padding-right: 18px;
}
/* disable interwiki styling */
#bodyContent a.extiw,
#bodyContent a.extiw:active {
    color: #3366bb;
    background: none;
    padding: 0;
}
#bodyContent a.external { color: #3366bb; }
/* this can be used in the content area to switch off
special external link styling */
#bodyContent .plainlinks a {
    background: none !important;
    padding: 0;
}
/*
** Structural Elements
*/

/*
** general portlet styles (elements in the quickbar)
*/
.portlet {
    border: none;
    margin: 0 0 0.5em 0em;
    float: none;
    padding: 0;
    width: 11.6em;
    overflow: hidden;
}
.portlet h4 {
    font-size: 95%;
    font-weight: normal;
    white-space: nowrap;
}
.portlet h5 { 
    background: transparent;
    padding: 0em 1em 0em 0.5em;
    text-transform: lowercase;
    display: inline;
    font-size: 91%;
    height: 1em;
    font-weight: normal;
    white-space: nowrap;
}
.portlet h6 { 
    background: #ffae2e;
    border: 1px solid #2f6fab;
    border-style: solid solid none solid;
    padding: 0em 1em 0em 1em;
    text-transform: lowercase;
    display: block;
    font-size: 1em;
    height: 1.2em;
    font-weight: normal;
    white-space: nowrap;
}
.pBody {
    font-size: 95%;
    background: White;
    border-collapse: collapse;
    border: 1px solid #aaaaaa;
    padding: 0 0.8em 0.3em 0.5em;
}
.portlet h1, 
.portlet h2, 
.portlet h3, 
.portlet h4 {
    margin: 0;
    padding: 0;
}
.portlet ul {
    line-height: 1.5em;
    list-style-type: square;
    list-style-image: url("bullet.gif");
    font-size:95%;
}
.portlet li {
    padding:0;
    margin: 0 0 0 0;
    margin-bottom: 0;
}

/* 
** Logo properties 
*/

#p-logo {
    z-index: 3;
    position:absolute; /*needed to use z-index */
    top: 0;
    left: 0;
    height: 155px;
    width: 12em;
    overflow: visible;
}
#p-logo h5 { display: none; }
#p-logo a,
#p-logo a:hover {
    display: block;
    height: 155px;
    width: 12.2em;
    background-repeat: no-repeat;
    background-position: 35% 50% !important;
    text-decoration: none;
}

/*
** the navigation portlet
*/

#p-nav {
    position:relative;
    z-index:3;
}

/*
** Search portlet
*/
#p-search {
    position:relative;
    z-index:3;
}    
#p-search .pBody {
    text-align: center;
}
input.searchButton {
    margin-top:1px;
    padding: 0 0.4em !important;
    font-size: 95%;
    cursor: pointer;
    background-color: White;
    border: 1px solid #2f6fab;  
}
#searchInput {
    border: 1px solid #2f6fab;  
    width:10.9em;
    margin: 0 0 0 0;
    font-size: 95%;
}
#p-search .pBody {
    padding: 0.5em 0.4em 0.4em 0.4em;
}

/* 
** the personal toolbar
*/

#p-personal {
    width:100%;
    white-space:nowrap;
    padding:0 0 0 0;
    margin:0;
    position:absolute;
    left:0px;
    top:0px;
    z-index: 0;
    border: none;
    background: none;
    overflow: visible;
    line-height: 1.2em;
}

#p-personal h5 {
    display:none;
}
#p-personal .portlet,
#p-personal .pBody {
    padding:0;
    margin:0;
    border: none;
    z-index:0;
    overflow: visible;
    background: none;
}
/* this is the ul contained in the portlet */
#p-personal ul {
    border: none;
    line-height: 1.4em;
    color: #2f6fab;
    padding: 0em 2em 0 3em;
    margin: 0;
    text-align: right;
    text-transform: lowercase;
    list-style: none;
    z-index:0;
    background: none;
}
#p-personal li {
    z-index:0;
    border:none;
    padding:0;
    display: inline;
    color: #2f6fab;
    margin-left: 1em;
    line-height: 1.2em;
    background: none;
}
#p-personal li a {
    text-decoration: none;
    color: #005896;
    padding-bottom: 0.2em;
    background: none;
}
#p-personal li a:hover {
    background-color: White;
    padding-bottom: 0.2em;
    text-decoration: none;
}

/* the icon in front of the user name, single quotes
in bg url to hide it from iemac */
li#pt-userpage,
li#pt-anonuserpage,
li#pt-login {
    background:  url('user.gif') top left no-repeat;
    background-repeat: no-repeat;
    padding-left: 20px;
    text-transform: none;
}

/*
** the page-related actions- page/talk, edit etc 
*/
#p-cactions {
    position:absolute;
    top: 1.3em;
    left: 11.5em;
    margin: 0;
    white-space:nowrap;
    width: 76%;
    line-height: 1.1em;
    overflow: visible;
    background: none;
    border-collapse: collapse;
    padding-left: 1em;
    list-style: none;
    font-size: 95%;
}
#p-cactions .hiddenStructure { display: none; }
#p-cactions ul {
    list-style: none;
}
#p-cactions li {
    display: inline;
    border: 1px solid #aaaaaa;
    border-bottom: none;
    padding: 0 0 0.1em 0;
    margin: 0 0.3em 0 0;
    overflow: visible;
    background: White;
}
#p-cactions li.selected {
    border-color: #fabd23;
    padding: 0 0 0.2em 0;
}
#p-cactions li a {
    background-color: White;
    color: #002bb8;
    border: none;
    padding: 0 0.8em 0.3em 0.8em;
    text-decoration: none;
    text-transform: lowercase;
    position: relative;
    z-index: 0;
    margin: 0;
}
#p-cactions .selected a { z-index: 3; }
#p-cactions .new a { color:#ba0000; }
#p-cactions li a:hover {
    z-index: 3;
    text-decoration: none;
}
#p-cactions h5 { display: none; }
#p-cactions li.istalk { margin-right: 0; }
#p-cactions li.istalk a { padding-right: 0.5em; }
#p-cactions #ca-addsection a { 
    padding-left: 0.4em;
    padding-right: 0.4em;
}
/* offsets to distinguish the tab groups */
li#ca-talk { margin-right: 1.6em; }
li#ca-watch, li#ca-watch { margin-left: 1.6em; }


/*
** the remaining portlets
*/
#p-tbx,
#p-lang {
    position:relative;
    z-index:3;
}

/*
** footer
*/
#footer {
    background-color: White;
    border-top: 1px solid #fabd23;
    border-bottom: 1px solid #fabd23;
    margin: 0.6em 0em 1em 0em;
    padding: 0.4em 0em 1.2em 0em;
    text-align: center;
    font-size: 90%;
}
#footer li {
    display: inline;
    margin: 0 1.3em;
}
/* hide from incapable browsers */
head:first-child+body #footer li { white-space: nowrap; }
#f-poweredbyico, #f-copyrightico {
    margin: 0 8px;
    position: relative;
    top: -2px; /* Bump it up just a tad */
}
#f-poweredbyico {
    float: right;
    height: 1%;
}
#f-copyrightico {
    float: left;
    height: 1%;
}

/* js pref toc */
#preftoc { 
    float: left;
    margin: 1em 1em 1em 1em;
    width: 13em;
}
#preftoc li { border: 1px solid White; }
#preftoc li.selected { 
    background-color:#f9f9f9;
    border:1px dashed #aaaaaa;
}
#preftoc a,
#preftoc a:active {
    display: block;
    color: #0014a6;
}
#prefcontrol { 
    clear: both;
    float: left;
    margin-top: 1em;
}
div.prefsectiontip { 
    font-size: 95%;
    margin-top: 1em;
}
fieldset.operaprefsection { margin-left: 15em }

/* 
** IE/Mac fixes, hope to find a validating way to move this
** to a separate stylesheet. This would work but doesn't validate: 
** @import("IEMacFixes.css");
*/
/* tabs: border on the a, not the div */
* > html #p-cactions li { border:none; }
* > html #p-cactions li a {
    border: 1px solid #aaaaaa;
    border-bottom: none;
}
* > html #p-cactions li.selected a { border-color: #fabd23; }
/* footer icons need a fixed width */
* > html #f-poweredbyico,
* > html #f-copyrightico { width: 88px; }
* > html #bodyContent,
* > html #bodyContent pre {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 25px;
}

/* more IE fixes */
/* float/negative margin brokenness */
* html #footer {margin-top: 0;}
* html #column-content {
    display: inline;
    margin-bottom: 0;
}
* html div.editsection { font-size: smaller; }
#pagehistory li.selected { position: relative; }

/* Mac IE 5.0 fix; floated content turns invisible */
* > html #column-content {
    float: none;
}
* > html #column-one {
    position: absolute;
    left: 0;
    top: 0;
}
* > html #footer {
    margin-left: 13.2em;
}

.printfooter {
	display: none;
}

.sharedUploadNotice {
        font-style: italic;
}

//}}}