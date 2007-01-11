/***
|''Name:''|TWiki04.PatternSkin.colors.css|
|''Source:''|http://www.twiki.org/p/pub/TWiki04/PatternSkin/colors.css|
***/

/*{{{*/
/*	-----------------------------------------------------------
	COLOR
	Appearance: text colors, background colors, border colors
	-----------------------------------------------------------	*/
	
/*	---------------------------------------------------------------------------------------
	CONSTANTS
	
	Text colors
	----------------------------------------
	T1 text color																	#000
	T2 link color																	#06c
	T3 link hover text color														#FBF7E8
	T4 link action button color (red) (same as BG2)									#D6000F
	T5 header color																	#a00
	T6 code text, left bar text														#7A4707
	T7 muted (dark gray) text														#666
	T8 grayed out text																#8E9195
	T9 alert 																		#f00
	T10 green 'new'																	#049804
	T11 dark gray																	#333
	
	Background colors
	----------------------------------------
	BG1	white; attachment, form table background									#fff
	BG2 link hover background color (red)  											#D6000F 
	BG3	light gray																	#efefef
	BG4 active form field (not implemented yet)										#ffc
	BG5 info background very light blue	(placeholder for background image)			#ECF4FB
	BG6	patternTopicAction light yellow (same as T3)								#FBF7E8
	BG7 header background (very light yellow)										#FDFAF1
	BG8 accent on sorted table column												#ccc
	BG9 light yellow; attachment, form background									#FEFBF3
	BG10 light green 'new'															#ECFADC
	BG11 dark gray; diff header background (same as T8)								#8E9195
	BG12 dark yellow, submit button													#FED764
	BG13 light blue: form steps														#F6FAFD
	BG14 lighter blue: left bar														#F9FCFE
	
	Border colors
	----------------------------------------
	BO1	light gray																	#efefef
	BO2 submit button border blue ('active')										#88B6CF
	BO3	info light blue border														#D5E6F3
	BO4 border color beige, header h2 bottom border									#E2DCC8
	BO5 header h3..h6 bottom border	(75% of BO4)									#E9E4D2
	BO6 darker gray																	#aaa
	BO7 neutral gray border															#ccc
	BO8 light neutral gray															#ddd
	BO9 alert border																#f00
	BO10 dark gray (same as BG11)													#8E9195

	---------------------------------------------------------------------------------------	*/

/* LAYOUT ELEMENTS */

#patternTopBar {
	background-color:#fff; /*BG1*/
	border-color:#ccc;
}
#patternMain { /* don't set a background here; use patternOuter */ }
#patternOuter {
	background-color:#fff; /*BG1*/ /*** Sets background of center col***/
	border-color:#ccc;
}
#patternLeftBar, #patternLeftBarContents { /* don't set a background here; use patternWrapper */ }
#patternWrapper {
	background-color:#F6FAFD; /*BG13*/
}
#patternBottomBar {
	background-color:#fff; /*BG1*/
	border-color:#ccc;
}
#patternBottomBarContents,
#patternBottomBarContents a:link,
#patternBottomBarContents a:visited {
	color:#8E9195;	/*T8*/
}

/* GENERAL HTML ELEMENTS */

html body {
	background-color:#fff; /*BG1*/
	color:#000; /*T1*/
}
/* be kind to netscape 4 that doesn't understand inheritance */
body, p, li, ul, ol, dl, dt, dd, acronym, h1, h2, h3, h4, h5, h6 {
	background-color:transparent;
}
hr {
	color:#ccc; /*BO7*/
	background-color:#ccc; /*BO7*/
}
pre, code, tt {
	color:#7A4707; /*T6*/
}
h1, h2, h3, h4, h5, h6 {
	color:#a00; /*T5*/
}
h1 a:link,
h1 a:visited {
	color:#a00; /*T5*/
}
h1 a:hover {
	color:#FBF7E8; /*T3*/
}
h2 {
	background-color:#FDFAF1;
	border-color:#E2DCC8; /*BO4*/
}
h3, h4, h5, h6 {
	border-color:#E9E4D2; /*BO5*/
}
/* to override old Render.pm coded font color style */
.twikiNewLink font {
	color:inherit;
}
.twikiNewLink a:link sup,
.twikiNewLink a:visited sup {
	color:#666; /*T7*/
	border-color:#ddd; /*BO8*/
}
.twikiNewLink a:hover sup {
	background-color:#D6000F; /*BG2*/
	color:#FBF7E8; /*C3*/
	border-color:#D6000F; /*BG2*/ /* (part of bg) */
}
.twikiNewLink {
	border-color:#ddd; /*BO8*/
}
:link:focus,
:visited:focus,
:link,
:visited,
:link:active,
:visited:active {
	color:#06c; /*T2*/;
	background-color:transparent;
}
:link:hover,
:visited:hover {
	color:#FBF7E8; /*C3*/
	background-color:#D6000F; /*BG2*/
}
:link:hover img,
:visited:hover img {
	background:#fff; /*BG1*/
}
.patternTopic a:visited {
	color:#666; /*T7*/
}
.patternTopic a:hover {
	color:#FBF7E8; /*C3*/
}

/* Form elements */

textarea,
input,
select {
	border-color:#aaa; /*BO6*/
}
.twikiSubmit,
.twikiButton {
	border-color:#ddd #aaa #aaa #ddd;
	color:#333;
	background-color:#fff; /*BG1*/
}
.twikiSubmit:active,
.twikiButton:active {
	border-color:#999 #ccc #ccc #999;
	color:#000;
}
.twikiSubmitDisabled,
.twikiSubmitDisabled:active {
	border-color:#ddd;
	color:#ccc;
	background-color:#f5f5f5;
}
.twikiInputField,
.twikiSelect {
	border-color:#aaa #ddd #ddd #aaa;
	color:#000;
	background-color:#fff; /*BG1*/
}
.twikiInputFieldDisabled {
	color:#666; /*T7*/
}

/*	-----------------------------------------------------------
	Plugin elements
	-----------------------------------------------------------	*/

/* TablePlugin */
.twikiTable,
.twikiTable td,
.twikiTable th {
	border-color:#ccc; /*BO8*/
}
.twikiTable th a:link,
.twikiTable th a:visited,
.twikiTable th a font {
	color:#06c; /*T2*/
}
.twikiTable th a:hover,
.twikiTable th a:hover font {
	background-color:transparent;
	color:#D6000F; /*T4*/
	border-color:#D6000F; /*T4*/
}

/* TablePlugin - sorting of table columns */
.patternTopic th.twikiSortedAscendingCol,
.patternTopic th.twikiSortedDescendingCol {
	background-color:#ccc; /*BG8*/
}
th.twikiSortedAscendingCol a:link,
th.twikiSortedAscendingCol a:link font,
th.twikiSortedAscendingCol a:visited,
th.twikiSortedAscendingCol a:visited font,
th.twikiSortedDescendingCol a:link,
th.twikiSortedDescendingCol a:link font,
th.twikiSortedDescendingCol a:visited,
th.twikiSortedDescendingCol a:visited font {
	border-color:#666; /*T7*/
}
th.twikiSortedAscendingCol a:hover,
th.twikiSortedAscendingCol a:hover font,
th.twikiSortedDescendingCol a:hover,
th.twikiSortedDescendingCol a:hover font {
	border-color:#D6000F; /*T4*/
}

/* TwistyContrib */
.twistyPlaceholder {
	color:#8E9195; /*T8*/
}
a:hover.twistyTrigger {
	color:#FBF7E8; /*T3*/
}

/* TipsContrib */
.tipsOfTheDay {
	background-color:#ECF4FB; /*BG5*/
}
.patternTopic .tipsOfTheDayHeader {
	color:#333; /*T11*/
}
/* TipsContrib - in left bar */
#patternLeftBar .tipsOfTheDay a:link,
#patternLeftBar .tipsOfTheDay a:visited {
	color:#a00; /*T5*/
}
#patternLeftBar .tipsOfTheDay a:hover {
	color:#FBF7E8; /*T3*/
}

/* RevCommentPlugin */
.revComment .patternTopicAction {
	background-color:#FDFBF4;
}

/*	-----------------------------------------------------------
	TWiki styles
	-----------------------------------------------------------	*/

.twikiGrayText {
	color:#8E9195; /*T8*/
}
.twikiGrayText a:link,
.twikiGrayText a:visited {
	color:#8E9195; /*T8*/
}
.twikiGrayText a:hover {
	color:#FBF7E8; /*C3*/
}

table.twikiFormTable th.twikiFormTableHRow,
table.twikiFormTable td.twikiFormTableRow {
	color:#666; /*T7*/
}
.twikiEditForm {
	color:#000; /*T1*/
}
.twikiEditForm .twikiFormTable th,
.twikiEditForm .twikiFormTable td {
	border-color:#ddd; /*BO8*/
}
.twikiEditForm .twikiFormTable td  {
	background-color:#F6F8FC;
}
.twikiEditForm .twikiFormTable th {
	background-color:#ECF4FB; /*BG5*/
}
.patternContent .twikiAttachments,
.patternContent .twikiForm {
	background-color:#FEFBF3; /*BG9*/
	border-color:#E2DCC8; /*BO4*/
}
.twikiAttachments table,
table.twikiFormTable {
	border-color:#ccc; /*BO7*/
	background-color:#fff; /*BG1*/
}
.twikiAttachments table {
	background-color:#fff; /*BG1*/
}
.twikiAttachments td, 
.twikiAttachments th {
	border-color:#ccc;
}
.twikiAttachments th/*,
table.twikiFormTable th.twikiFormTableHRow*/ {
	background-color:#fff; /*BG1*/
}
.twikiAttachments td {
	background-color:#fff; /*BG1*/
}
.twikiAttachments th a:link,
.twikiAttachments th a:visited,
table.twikiFormTable th.twikiFormTableHRow a:link,
table.twikiFormTable th.twikiFormTableHRow a:visited {
	color:#06c; /*T2*/
}
.twikiAttachments th font,
table.twikiFormTable th.twikiFormTableHRow font {
	color:#06c; /*T2*/
}
.twikiAttachments th a:hover,
table.twikiFormTable th.twikiFormTableHRow a:hover {
	border-color:#06c; /*T2*/
	background-color:transparent;
}
.twikiAttachments th.twikiSortedAscendingCol,
.twikiAttachments th.twikiSortedDescendingCol {
	background-color:#efefef; /*BG3*/
}
.twikiFormSteps {
	background-color:#F6FAFD; /*BG13*/
	border-color:#E2DCC8;
}
.twikiFormStep {
	border-color:#E2DCC8;
}
.twikiFormStep h3,
.twikiFormStep h4 {
	background-color:transparent;
}
.twikiToc .twikiTocTitle {
	color:#666; /*T7*/
}
.twikiBroadcastMessage {
	background-color:yellow;
}
.twikiBroadcastMessage b,
.twikiBroadcastMessage strong {
	color:#f00; /*T9*/
}
.twikiAlert,
.twikiAlert code {
	color:#f00; /*T9*/
}
.twikiEmulatedLink {
	color:#06c; /*T2*/
}
.twikiPageForm table {
	border-color:#ddd; /*BO8*/
	background:#fff; /*BG1*/
}
.twikiPageForm hr {
	border-color:#efefef; /*BO1*/
	background-color:#efefef; /*BO1*/
	color:#efefef; /*BO1*/
}
.twikiHelp {
	background-color:#ECF4FB; /*BG5*/
	border-color:#D5E6F3; /*BO3*/
}
.twikiAccessKey {
	color:inherit;
	border-color:#8E9195; /*T8*/
}
a:link .twikiAccessKey,
a:visited .twikiAccessKey,
a:hover .twikiAccessKey {
	color:inherit;
}


/*	-----------------------------------------------------------
	Pattern skin specific elements
	-----------------------------------------------------------	*/
#patternPage {
	background-color:#fff; /*BG1*/
}
/* Left bar */
#patternLeftBarContents {
	color:#666; /*T7*/
}
#patternLeftBarContents .patternWebIndicator {
	color:#000; /*T1*/
}
#patternLeftBarContents .patternWebIndicator a:link,
#patternLeftBarContents .patternWebIndicator a:visited {
	color:#000; /*T1*/
}
#patternLeftBarContents .patternWebIndicator a:hover {
	color:#FBF7E8; /*T3*/
}
#patternLeftBarContents hr {
	color:#E2DCC8; /*BO4*/
	background-color:#E2DCC8; /*BO4*/
}
#patternLeftBarContents a:link,
#patternLeftBarContents a:visited {
	color:#7A4707; /*T6*/
}
#patternLeftBarContents a:hover {
	color:#FBF7E8; /*C3*/
}
#patternLeftBarContents b,
#patternLeftBarContents strong {
	color:#333; /*T11*/
}
#patternLeftBarContents .patternChangeLanguage {
	color:#8E9195; /*T8*/
}
#patternLeftBarContents .patternLeftBarPersonal {
	border-color:#D9EAF6;
}
#patternLeftBarContents .patternLeftBarPersonal a:link,
#patternLeftBarContents .patternLeftBarPersonal a:visited {
	color:#06c; /*T2*/;
}
#patternLeftBarContents .patternLeftBarPersonal a:hover {
	color:#FBF7E8; /*C3*/
	background-color:#D6000F; /*BG2*/
}
.patternSeparator {
	font-family:monospace;
}
.patternTopicActions {
	border-color:#E2DCC8; /*BO4*/
}
.patternTopicAction {
	color:#666; /*T7*/
	border-color:#E2DCC8; /*BO4*/
	background-color:#FBF7E8;
}
.patternTopicAction .twikiSeparator {
	color:#aaa;
}
.patternActionButtons a:link,
.patternActionButtons a:visited {
	color:#D6000F; /*T4*/
}
.patternActionButtons a:hover {
	color:#FBF7E8; /*C3*/
}
.patternTopicAction .twikiAccessKey {
	border-color:#C75305;
}
.patternTopicAction label {
	color:#000; /*T1*/
}
.patternHelpCol {
	color:#8E9195; /*T8*/
}
.patternFormFieldDefaultColor {
	/* input fields default text color (no user input) */
	color:#8E9195; /*T8*/
}

.patternToolBar .patternButton s,
.patternToolBar .patternButton strike,
.patternToolBar .patternButton a:link,
.patternToolBar .patternButton a:visited {
	border-color:#E2DCC8; /*BO4*/
	background-color:#fff; /*BG1*/
}
.patternToolBar .patternButton a:link,
.patternToolBar .patternButton a:visited {
	color:#666; /*T7*/
}
.patternToolBar .patternButton s,
.patternToolBar .patternButton strike {
	color:#ccc;
	border-color:#e0e0e0;
	background-color:#fff; /*BG1*/
}
.patternToolBar .patternButton a:hover {
	background-color:#D6000F; /*BG2*/
	color:#FBF7E8; /*C3*/
	border-color:#D6000F; /*T4*/
}
.patternToolBar .patternButton img {
	background-color:transparent;
}	
.patternToolBarBottom {
	border-color:#E2DCC8; /*BO4*/
}
.patternToolBar a:link .twikiAccessKey,
.patternToolBar a:visited .twikiAccessKey {
	color:inherit;
	border-color:#666; /*T7*/
}
.patternToolBar a:hover .twikiAccessKey {
	background-color:transparent;
	color:inherit;
}

.patternRevInfo,
.patternRevInfo a:link,
.patternRevInfo a:visited {
	color:#8E9195; /*T8*/
}
.patternRevInfo a:hover {
	color:#FBF7E8; /*C3*/
}

.patternMoved,
.patternMoved a:link,
.patternMoved a:visited {
	color:#8E9195; /*T8*/
}
.patternMoved a:hover {
	color:#FBF7E8; /*T3*/
}
.patternSaveHelp {
	background-color:#fff; /*BG1*/
}

/* WebSearch, WebSearchAdvanced */
table#twikiSearchTable th,
table#twikiSearchTable td {
	background-color:#fff; /*BG1*/
	border-color:#ddd; /*BO8*/
} 
table#twikiSearchTable th {
	color:#8E9195; /*T8*/
}
table#twikiSearchTable td.first {
	background-color:#efefef; /*BG3*/
}

/*	-----------------------------------------------------------
	Search results
	styles and overridden styles used in search.pattern.tmpl
	-----------------------------------------------------------	*/

h3.patternSearchResultsHeader,
h4.patternSearchResultsHeader {
	background-color:#FEFBF3; /*BG9*/
	border-color:#ccc; /*BO7*/
}
h4.patternSearchResultsHeader {
	color:#000;
}
.patternNoViewPage h4.patternSearchResultsHeader {
	color:#a00; /*T5*/
}
.patternSearchResult .twikiBottomRow {
	border-color:#ddd; /*BO8*/
}
.patternSearchResult .twikiAlert {
	color:#f00; /*T9*/
}
.patternSearchResult .twikiSummary .twikiAlert {
	color:#900; /*C5*/
}
.patternSearchResult .twikiNew {
	background-color:#ECFADC; /*BG10*/
	border-color:#049804; /*T10*/
	color:#049804; /*T10*/
}
.patternViewPage .patternSearchResultsBegin {
	border-color:#ddd; /*BO8*/
}

/* Search results in book view format */

.patternBookView .twikiTopRow {
	background-color:transparent; /* set to WEBBGCOLOR in css.pattern.tmpl */
	color:#666; /*T7*/
}
.patternBookView .twikiBottomRow {
	border-color:#ddd; /*BO8*/
}
.patternBookView .patternSearchResultCount {
	color:#8E9195; /*T8*/
}

/* oopsmore.pattern.tmpl */

table.patternDiffOptions img {
	border-color:#ccc; /*BO7*/
}

/* edit.pattern.tmpl */

.patternEditPage textarea#topic {
	background-color:#fff; /*BG1*/
}
.twikiChangeFormButton .twikiButton,
.twikiChangeFormButtonHolder .twikiButton {
	color:#06c; /*T2*/
	background:none;
}
.patternSig input {
	color:#8E9195; /*T8*/
	background-color:#fff; /*BG1*/
}

/* preview.pattern.tmpl */

.patternPreviewArea {
	border-color:#f00; /*BO9*/
	background-color:#fff; /*BG1*/
}

/* rdiff.pattern.tmpl */

.patternDiff {
	border-color:#ccc;
}
.patternDiff h4.patternSearchResultsHeader {
	background-color:#ccc;
}
tr.twikiDiffDebug td {
	border-color:#ddd; /*BO8*/
}
.patternDiffPage .twikiDiffTable th {
	background-color:#eee;
}
tr.twikiDiffDebug .twikiDiffChangedText,
tr.twikiDiffDebug .twikiDiffChangedText {
	background:#99ff99; /* green */
}
/* Deleted */
tr.twikiDiffDebug .twikiDiffDeletedMarker,
tr.twikiDiffDebug .twikiDiffDeletedText {
	background-color:#f99;
}
/* Added */
tr.twikiDiffDebug .twikiDiffAddedMarker,
tr.twikiDiffDebug .twikiDiffAddedText {
	background-color:#ccf;
}
/* Unchanged */
tr.twikiDiffDebug .twikiDiffUnchangedText {
	color:#8E9195; /*T8*/
}
/* Headers */
.twikiDiffChangedHeader,
.twikiDiffDeletedHeader,
.twikiDiffAddedHeader {
	background-color:#ccc;
}
/* Unchanged */
.twikiDiffUnchangedTextContents { }
.twikiDiffLineNumberHeader {
	background-color:#eee;
}
/*}}}*/
