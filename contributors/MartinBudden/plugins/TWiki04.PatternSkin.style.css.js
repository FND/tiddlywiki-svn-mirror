/***
|''Name:''|TWiki04.PatternSkin.style.css|
|''Source:''| http://www.twiki.org/p/pub/TWiki04/PatternSkin/style.css |
***/

/*{{{*/
/*	-----------------------------------------------------------
	STYLE
	Appearance: margins, padding, fonts, borders
	-----------------------------------------------------------	*/
	

/*	---------------------------------------------------------------------------------------
	CONSTANTS
	
	Sizes
	----------------------------------------
	S1 line-height																	1.4em
	S2 somewhat smaller font size													94%
	S3 small font size, twikiSmall													font-size:86%; line-height:110%;
	S4 horizontal bar padding (h2, patternTop)										5px
	S5 form and attachment padding													20px
	S6 left margin left bar															1em

	---------------------------------------------------------------------------------------	*/

/* GENERAL HTML ELEMENTS */

html body {
	font-size:104%; /* to change the site's font size, change #patternPage below */
	voice-family:"\"}\""; 
	voice-family:inherit;
	font-size:small;
}
html>body { /* Mozilla */
	font-size:small;	
}
p {
	margin:1em 0 0 0;
}
table {
	border-collapse:separate;
}
th {
	line-height:1.15em;
}
strong, b {
	font-weight:bold;
}
hr {
	height:1px;
	border:none;
}

/* put overflow pre in a scroll area */
pre {
    width:100%;
    margin:1em 0; /* Win IE tries to make this bigger otherwise */
}
html>body pre { /* hide from IE */
	/*\*/ overflow:auto !important; /* */ overflow:scroll; width:auto; /* for Mac Safari */
}
/* IE behavior for pre is defined in twiki.pattern.tmpl in conditional comment */
ol, ul {
	margin-top:0;
}
ol li, ul li {
	line-height:1.4em; /*S1*/
}
	
/* Text */
h1, h2, h3, h4, h5, h6 {
	line-height:104%;
	padding:0;
	margin:1em 0 .1em 0;
	font-weight:normal;
}
h1 {
	margin:0 0 .5em 0;
}
h1 { font-size:210%; }
h2 { font-size:160%; }
h3 { font-size:135%; }
h4 { font-size:122%; }
h5 { font-size:110%; }
h6 { font-size:95%; }
h2, h3, h4, h5, h6 {
	display:block;
	/* give header a background color for easy scanning:*/
	padding:.1em 5px;
	margin:1em -5px .35em -5px;
	border-width:0 0 1px 0;
	border-style:solid;
	height:auto;	
}
h1.patternTemplateTitle {
	font-size:175%;
	text-align:center;
}
h2.patternTemplateTitle {
	text-align:center;
}
/* Links */
/* somehow the twikiNewLink style have to be before the general link styles */
.twikiNewLink {
	border-width:0 0 1px 0;
	border-style:solid;
}
.twikiNewLink a {
	text-decoration:none;
	margin-left:1px;
}
.twikiNewLink a sup {
	text-align:center;
	padding:0 2px;
	vertical-align:baseline;
	font-size:100%;
	text-decoration:none;
}
.twikiNewLink a:link sup,
.twikiNewLink a:visited sup {
	border-width:1px;
	border-style:solid;
	text-decoration:none;
}
.twikiNewLink a:hover sup {
	text-decoration:none;
}

:link:focus,
:visited:focus,
:link,
:visited,
:link:active,
:visited:active {
	text-decoration:underline;
}
:link:hover,
:visited:hover {
	text-decoration:none;
}
img {
	vertical-align:text-bottom;
	border:0;
}

/* Form elements */
form { 
	display:inline;
	margin:0;
	padding:0;
}
textarea,
input,
select {
	vertical-align:middle;
	border-width:1px;
	border-style:solid;
}
textarea {
	padding:1px;
}
input,
select option {
	padding:1px;
}
.twikiSubmit,
.twikiButton,
.twikiCheckbox {
	border-width:1px;
	border-style:solid;
	padding:.15em .25em;
	font-size:94%;
	font-weight:bold;
	vertical-align:middle;
}
.twikiCheckbox,
.twikiRadioButton {
	margin:0 .3em 0 0;
	border:0;
}
.twikiInputField {
	border-width:1px;
	border-style:solid;
	padding:.15em .25em;
	font-size:94%; /*S2*/
}
.patternFormButton {
	border:0;
	margin:0 0 0 2px;
}
textarea {
	font-size:100%;
}

/* LAYOUT ELEMENTS */
/* for specific layout sub-elements see further down */

#patternPage {
	font-family:arial, "Lucida Grande", verdana, sans-serif;
	line-height:1.4em; /*S1*/
	/* change font size here */
	font-size:105%;
}
#patternTopBar {
	border-width:0 0 1px 0;
	border-style:solid;
	overflow:hidden;
}
#patternTopBarContents {
	padding:0 1.5em 0 1em;
}
#patternBottomBar {
	border-width:1px 0 0 0;
	border-style:solid;
}
#patternBottomBarContents {
	padding:1em;
	font-size:86%; line-height:110%; /*S3*/
	text-align:center;
}
#patternMainContents {
	padding:0 1.5em 3em 3em;
}
#patternLeftBarContents {
	margin:0 1em 1em 1em;
}

/*	-----------------------------------------------------------
	Plugin elements
	-----------------------------------------------------------	*/

/* TagMePlugin */
.tagMePlugin select {
	font-size:.86em; /* use em instead of % for consistent size */
	margin:0 .25em 0 0;
}
.tagMePlugin input { 
	border:0px;
}

/* EditTablePlugin */
.editTable .twikiTable {
	margin:0 0 2px 0;
}
.editTableInput,
.editTableTextarea {
	font-family:monospace;
}
.editTableEditImageButton {
	border:none;
}

/* TablePlugin */
.twikiTable {
}
.twikiTable td,
.twikiTable th {
}
.twikiTable th {
    padding:4px;
}
.twikiTable td {
    padding:2px 4px;
}
.twikiTable th a:link,
.twikiTable th a:visited,
.twikiTable th a font {
	text-decoration:none;
}
.twikiTable th a:hover,
.twikiTable th a:hover font {
	text-decoration:none;
	border-width:0 0 1px 0;
	border-style:solid;
}

/* TablePlugin - sorting of table columns */
th.twikiSortedAscendingCol a:link,
th.twikiSortedAscendingCol a:link font,
th.twikiSortedAscendingCol a:visited,
th.twikiSortedAscendingCol a:visited font {
	border-width:1px 0 0 0;
	border-style:solid;	
}
th.twikiSortedDescendingCol a:link,
th.twikiSortedDescendingCol a:link font,
th.twikiSortedDescendingCol a:visited,
th.twikiSortedDescendingCol a:visited font {
	border-width:0 0 1px 0;
	border-style:solid;
}
th.twikiSortedAscendingCol a:hover,
th.twikiSortedAscendingCol a:hover font {
	border-width:0 0 1px 0;
	border-style:solid;
	text-decoration:none;
}
th.twikiSortedDescendingCol a:hover,
th.twikiSortedDescendingCol a:hover font {
	border-width:1px 0 0 0;
	border-style:solid;
	text-decoration:none;
}

.twikiEditForm {
	margin:0 0 .5em 0;
}
.twikiEditForm .twikiFormTable {
	text-align:center;
}

/* TipsContrib */
.tipsOfTheDayContents .tipsOfTheDayTitle {
	font-weight:bold;
}
.patternTopic .tipsOfTheDayHeader {
	display:block;
	padding:3px 5px;
}
.patternTopic .tipsOfTheDayText {
	padding:0 5px 5px 5px;
}
.patternTopic .tipsOfTheDayText a:link,
.patternTopic .tipsOfTheDayText a:visited {
	text-decoration:none;
}
/* TipsContrib - in left bar */
#patternLeftBar .tipsOfTheDayHeader img {
	/* hide lamp icon */
	display:none;
}
#patternLeftBar .tipsOfTheDayContents {
	padding:.25em .25em .5em .25em;
	height:1%; /* or Win IE won't display a background */
	overflow:hidden;
}
#patternLeftBar .tipsOfTheDayHeader {
	display:block;
	font-weight:normal;
}

/* TwistyContrib */
a:link.twistyTrigger,
a:visited.twistyTrigger {
	text-decoration:none;
}
a:link .twistyLinkLabel,
a:visited .twistyLinkLabel {
      text-decoration:underline;
}

/*	-----------------------------------------------------------
	TWiki styles
	-----------------------------------------------------------	*/

#twikiLogin {
	width:40em;
	margin:0 auto;
	text-align:center;
}
#twikiLogin .twikiFormSteps {
	border-width:5px;
}
.twikiAttachments,
.twikiForm {
	margin:1em 0;
	padding:1px; /* fixes disappearing borders because of overflow:auto; in twikiForm */
}
.twikiForm h1,
.twikiForm h2,
.twikiForm h3,
.twikiForm h4,
.twikiForm h5,
.twikiForm h6 {
	margin-top:0;
}
.patternContent .twikiAttachments,
.patternContent .twikiForm {
	/* form or attachment table inside topic area */
	font-size:94%; /*S2*/
	padding:.5em 20px; /*S5*/ /* top:use less padding for the toggle link; bottom:use less space in case the table is folded in  */
	border-width:1px 0 0 0;
	border-style:solid;
	margin:0;
}
.twikiAttachments table,
table.twikiFormTable {
	margin:5px 0;
	border-collapse:collapse;
	padding:0px;
	border-spacing:0px;
	empty-cells:show;
	border-style:solid;
	border-width:1px;
}
.twikiAttachments table {
	line-height:1.4em; /*S1*/
	width:auto;
	voice-family:"\"}\""; /* hide the following for Explorer 5.x */
	voice-family:inherit;
	width:100%;
}
.twikiAttachments td, 
.twikiAttachments th {
	border-style:solid;
	border-width:1px;
}
.twikiAttachments th,
table.twikiFormTable th.twikiFormTableHRow {
	padding:3px 6px;
	height:2.5em;
	vertical-align:middle;
}
table.twikiFormTable th.twikiFormTableHRow {
	text-align:center;
}
.twikiEditForm .twikiFormTable th,
.twikiEditForm .twikiFormTable td {
	padding:.25em .5em;
	vertical-align:middle;
	border-width:0 0 1px 0;
	border-style:solid;
}
.twikiAttachments th a:link,
.twikiAttachments th a:visited {
	text-decoration:none;
}
/* don't show any of those ugly sort icons */
.twikiAttachments th img,
.twikiAttachments th a:link img,
.twikiAttachments th a:visited img {
	display:none;
}
.twikiAttachments td,
table.twikiFormTable td {
	padding:3px 6px;
	height:1.4em; /*S1*/
	text-align:left;
	vertical-align:top;
}
.twikiAttachments td {
	/* don't show column lines in attachment listing */
	border-width:0 0 1px 0;
}
.twikiAttachments th.twikiFirstCol,
.twikiAttachments td.twikiFirstCol {
	/* make more width for the icon column */
	width:26px;
	text-align:center;
}
.twikiAttachments caption {
	display:none;
}
table.twikiFormTable th.twikiFormTableHRow a:link,
table.twikiFormTable th.twikiFormTableHRow a:visited {
	text-decoration:none;
}

.twikiFormSteps {
	text-align:left;
	padding:.25em 0 0 0;
	border-width:1px 0;
	border-style:solid;
}
.twikiFormStep {
	line-height:140%;
	padding:1em 20px; /*S5*/
	border-width:0 0 1px 0;
	border-style:solid;
}
.twikiFormStep h3,
.twikiFormStep h4 {
	font-size:115%;
	border:none;
	margin:0;
	padding:0;
}
.twikiFormStep h3 {
	font-weight:bold;
}
.twikiFormStep h4 {
	font-weight:normal;
}
.twikiFormStep p {
	margin:.3em 0;
}

.twikiToc {
	margin:1em 0;
	padding:.3em 0 .6em 0;
}
.twikiToc ul {
	list-style:none;
	padding:0 0 0 .5em;
	margin:0;
}
.twikiToc li {
	margin-left:1em;
	padding-left:1em;
	background-repeat:no-repeat;
	background-position:0 .5em;
}
.twikiToc .twikiTocTitle {
	margin:0;
	padding:0;
	font-weight:bold;
}

.twikiSmall {
	font-size:86%; line-height:110%; /*S3*/
}
.twikiSmallish {
	font-size:94%; /*S2*/
}
.twikiNew { }
.twikiSummary {
	font-size:86%; line-height:110%; /*S3*/
}
.twikiEmulatedLink {
	text-decoration:underline;
}
.twikiPageForm table {
	border-width:1px;
	border-style:solid;
}
.twikiPageForm table {
	width:100%;
	margin:0 0 2em 0;
}
.twikiPageForm th,
.twikiPageForm td {
	border:0;
	padding:.15em 1em;
}
.twikiPageForm td {}
.twikiPageForm td.first {
	padding-top:1em;
}
.twikiBroadcastMessage {
	padding:.25em .5em;
	margin:0 0 1em 0;
}
.twikiHelp {
	padding:1em;
	margin:0 0 1em 0;
	border-width:1px 0;
	border-style:solid;
}
.twikiHelp ul,
.twikiHelp li {
	margin:0;
}
.twikiHelp ul {
	padding-left:2em;
}
.twikiAccessKey {
	text-decoration:none;
	border-width:0 0 1px 0;
	border-style:solid;
}
a:hover .twikiAccessKey {
	text-decoration:none;
	border:none;
}
.twikiWebIndent {
	margin:0 0 0 1em;
}
a.twikiLinkInHeaderRight {
	float:right;
	display:block;
	margin:0 0 0 5px;
}
.twikiLinkLabel {}

/*	-----------------------------------------------------------
	Pattern skin specific elements
	-----------------------------------------------------------	*/

.patternTopic {
	margin:1em 0 2em 0;
}
#patternLeftBarContents {
	font-size:94%; /*S2*/
	padding:0 0 .5em 0;
}
#patternLeftBarContents a img {
	margin:1px 0 0 0;
}
#patternLeftBarContents a:link,
#patternLeftBarContents a:visited {
	text-decoration:none;
}
#patternLeftBarContents ul {
	padding:0;
	margin:.5em 0 1em 0;
	list-style:none;
}
#patternLeftBarContents li {
	width:100%;
	margin:0 1.1em 0 0;
	overflow:hidden;
}
#patternLeftBarContents h2 {
	border:none;
	background-color:transparent;
}
#patternLeftBarContents .patternWebIndicator {
	margin:0 -1em; /*S6*/
	padding:.55em 1em; /*S6*/
	line-height:1.4em;
	text-align:center;
}
#patternLeftBarContents .patternWebIndicator a:link,
#patternLeftBarContents .patternWebIndicator a:visited {
	text-decoration:none;
}
#patternLeftBarContents .patternLeftBarPersonal {
	margin:0 -1em; /*S6*/
	padding:.55em 1em; /*S6*/
	width:100%;
	border-width:0 0 1px 0;
	border-style:solid;
}
#patternLeftBarContents .patternLeftBarPersonal ul {
	margin:0;
	padding:0;
}
#patternLeftBarContents .patternLeftBarPersonal li {
	padding-left:1em;
	background-repeat:no-repeat;
}
#patternLeftBarContents .patternLeftBarPersonal a:hover {
	text-decoration:none;
}


.patternTop {
	font-size:94%; /*S2*/
}
/* Button tool bar */
.patternToolBar {
	margin:.4em 0 0 0;
	padding:0 .5em 0 0;
	height:1%; /* for Win IE */
}
.patternToolBarButtons {
	float:right;
}
.patternToolBarButtons .twikiSeparator {
	display:none;
}
.patternToolBar .patternButton {
	float:left;
}
.patternToolBar .patternButton s,
.patternToolBar .patternButton strike,
.patternToolBar .patternButton a:link,
.patternToolBar .patternButton a:visited {
	display:block;
	margin:0 0 -1px 4px;
	border-width:1px;
	border-style:solid;
	/* relative + z-index removed due to buggy Win/IE redrawing problems */
	/*
	position:relative;
	z-index:0;
	*/
	padding:.15em .45em;
}
.patternToolBar .patternButton a:link,
.patternToolBar .patternButton a:visited {
	text-decoration:none;
}
.patternToolBar .patternButton s,
.patternToolBar .patternButton strike {
	text-decoration:none;
}
.patternToolBar .patternButton a:hover {
	text-decoration:none;
	/*z-index:3;*/
}
.patternToolBarBottom {
	position:relative;
	border-width:1px 0 0 0;
	border-style:solid;
	z-index:2;
	clear:both;
}
.patternMetaMenu input,
.patternMetaMenu select,
.patternMetaMenu select option {
	font-size:.86em; /* use em instead of % for consistent size */
	margin:0;
	width:8em;
}
.patternMetaMenu select option {
	padding:1px 0 0 0;
}
.patternMetaMenu ul {
    padding:0;
    margin:0;
   	list-style:none;
}
.patternMetaMenu ul li {
    padding:0 .1em 0 .1em;
	display:inline;
}

/* breadcrumb */
.patternHomePath {
	font-size:94%; /*S2*/
	margin:.3em 0;
}
.patternHomePath a:link,
.patternHomePath a:visited {
	text-decoration:none;
}
.patternRevInfo {
	margin:0 0 0 .15em;
	font-size:94%;
}
.patternTopicActions {
	border-width:0 0 1px 0;
	border-style:solid;
}
.patternTopicAction {
	line-height:1.5em;
	padding:.4em 20px; /*S5*/
	border-width:1px 0 0 0;
	border-style:solid;
}
.patternViewPage .patternTopicAction {
	font-size:94%; /*S2*/
}
.patternActionButtons a:link,
.patternActionButtons a:visited {
	padding:1px 1px 2px 1px;
}
.patternTopicAction .patternActionButtons a:link,
.patternTopicAction .patternActionButtons a:visited {
	text-decoration:none;
}
.patternTopicAction .patternSaveOptions {
	margin-bottom:.5em;
}
.patternTopicAction .patternSaveOptions .patternSaveOptionsContents {
	padding:.2em 0;
}
.patternMoved {
	font-size:94%; /*S2*/
	margin:1em 0;
}
.patternMoved i,
.patternMoved em {
	font-style:normal;
}

/* WebSearch, WebSearchAdvanced */
table#twikiSearchTable {
	background:none;
	border-bottom:0;
} 
table#twikiSearchTable th,
table#twikiSearchTable td {
	padding:.5em;
	border-width:0 0 1px 0;
	border-style:solid;
} 
table#twikiSearchTable th {
	width:20%;
	text-align:right;
}
table#twikiSearchTable td {
	width:80%;
}
table#twikiSearchTable td.first {
	padding:1em;
}

/*	-----------------------------------------------------------
	Search results
	styles and overridden styles used in search.pattern.tmpl
	-----------------------------------------------------------	*/

.patternSearchResults {
	/* no longer used in search.pattern.tmpl, but remains in rename templates */
	margin:0 0 1em 0;
}
.patternSearchResults blockquote {
	margin:1em 0 1em 5em;
}
h3.patternSearchResultsHeader,
h4.patternSearchResultsHeader {
	display:block;
	border-width:0 0 1px 0;
	border-style:solid;
	height:1%; /* or WIN/IE wont draw the backgound */
	font-weight:bold;
}
.patternSearchResults h3 {
	font-size:115%; /* same as twikiFormStep */
	margin:0;
	padding:.5em 20px;
	font-weight:bold;
}
h4.patternSearchResultsHeader {
	font-size:100%;
	padding-top:.3em;
	padding-bottom:.3em;
	font-weight:normal;
}
.patternSearchResult .twikiTopRow {
	padding-top:.2em;
}
.patternSearchResult .twikiBottomRow {
	padding-bottom:.25em;
	border-width:0 0 1px 0;
	border-style:solid;
}
.patternSearchResult .twikiAlert {
	font-weight:bold;
}
.patternSearchResult .twikiSummary .twikiAlert {
	font-weight:normal;
}
.patternSearchResult .twikiNew {
	border-width:1px;
	border-style:solid;
	font-size:85%; /*S3*/
	padding:0 1px;
	font-weight:bold;
}
.patternSearchResults .twikiHelp {
	display:block;
	width:auto;
	padding:.1em 5px;
	margin:1em -5px .35em -5px;
}
.patternSearchResult .twikiSRAuthor {
	width:15%;
	text-align:left;
}
.patternSearchResult .twikiSRRev {
	width:30%;
	text-align:left;
}
.patternSearchResultCount {
	margin:1em 0 3em 0;
}
.patternSearched {
}
.patternSaveHelp {
	line-height:1.5em;
	padding:.5em 20px; /*S5*/
}

/* Search results in book view format */

.patternBookView {
	border-width:0 0 2px 2px;
	border-style:solid;
	/* border color in cssdynamic.pattern.tmpl */
	margin:.5em 0 1.5em -5px;
	padding:0 0 0 5px;
}
.patternBookView .twikiTopRow {
	padding:.25em 5px .15em 5px; /*S4*/
	margin:1em -5px .15em -5px; /*S4*/
}
.patternBookView .twikiBottomRow {
	font-size:100%;
	padding:1em 0 1em 0;
	width:auto;
	border:none;
}

/* pages that are not view */

.patternNoViewPage #patternMainContents {
	padding-top:1.5em;
}


/* oopsmore.pattern.tmpl */

table.patternDiffOptions {
	margin:.5em 0;
	border:none;
}
table.patternDiffOptions td {
	border:none;
	text-align:center;
}
table.patternDiffOptions img {
	padding:0 10px;
	border-width:1px;
	border-style:solid;
}
table.patternDiffOptions input {
	border:0;
}

/* edit.pattern.tmpl */

.patternEditPage .twikiForm h1,
.patternEditPage .twikiForm h2,
.patternEditPage .twikiForm h3 {
	/* same as twikiFormStep */
	font-size:120%;
	font-weight:bold;
}	
.twikiEditboxStyleMono {
	font-family:"Courier New", courier, monaco, monospace;
}
.twikiEditboxStyleProportional {
	font-family:"Lucida Grande", verdana, arial, sans-serif;
}
.twikiChangeFormButtonHolder {
	margin:.5em 0;
	float:right;
}
.twikiChangeFormButton .twikiButton,
.twikiChangeFormButtonHolder .twikiButton {
	padding:0;
	margin:0;
	border:none;
	text-decoration:underline;
	font-weight:normal;
}
.patternFormHolder { /* constrains the textarea */
	width:100%;
}
.patternSigLine {
	margin:.25em 0 .5em 0;
	padding:0 .5em 0 0;
}
.patternEditPage .patternTopicActions {
	margin:1.5em 0 0 0;
}

/* preview.pattern.tmpl */

.patternPreviewArea {
	border-width:1px;
	border-style:solid;
	margin:0 -0.5em 2em -0.5em;
	padding:.5em;
}

/* attach.pattern.tmpl */

.patternAttachPage .twikiAttachments table {
	width:auto;
}
.patternAttachPage .patternTopicAction {
	margin-top:-1px;
}
.patternAttachPage .twikiAttachments {
	margin-top:0;
}
.patternAttachForm {
	margin:0 0 3.5em 0;
}
.patternMoveAttachment {
	margin:.5em 0 0 0;
	text-align:right;
}

/* rdiff.pattern.tmpl */

.patternDiff {
	/* same as patternBookView */
	border-width:0 0 2px 2px;
	border-style:solid;
	margin:.5em 0 1.5em -5px;
	padding:0 0 0 5px;
}
.patternDiffPage .patternRevInfo ul {
	padding:0;
	margin:2em 0 0 0;
	list-style:none;
}
.patternDiffPage .twikiDiffTable {
	margin:2em 0;
}
.patternDiffPage .twikiDiffTable th,
.patternDiffPage .twikiDiffTable td {
	padding:0 .2em 0 .3em;
}
tr.twikiDiffDebug td {
	border-width:1px;
	border-style:solid;
}
.patternDiffPage td.twikiDiffDebugLeft {
	border-bottom:none;
}
.twikiDiffLineNumberHeader {
	padding:.3em 0;
}

/*}}}*/
