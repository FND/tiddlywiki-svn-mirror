/***
SocialtextStyleOverrides
***/

/*{{{*/
#st-page-wiki-title {
	font-size: 80%;
}
.subtitle {
	font-style: italic;
	font-size 80%;
}

/* from #st-tags */
.tagged {
	border-color: #bbeebb;
	background-color: #f4fff4;
}

.tagged .listTitle {
	color: #595;
	font-weight: bold;
}

.tagged .button {
	color: #999;
}

.selected .tagged {
	background-color: ColorPalette::TertiaryLight;
	border: 1px solid ColorPalette::TertiaryMid;
}

/* from #st-incoming-links */
.tagging {
	border-color: #ebb;
	background-color: #fff4f4;
}

.tagging .listTitle {
	color: #b78;
	font-weight: bold;
}
.tagged .button {
	color: #999;
}

.selected .tagging {
	background-color: ColorPalette::TertiaryLight;
	border: 1px solid ColorPalette::TertiaryMid;
}

.tiddler {/* Tiddler body */
	border:1px solid #ccc;
	margin:0.5em;
	background:#fff;
	padding:0.5em;
}

.viewer blockquote {border-left: 0px solid}

.tiddlyLinkNonExisting {
	font-style: italic;
	border-bottom: 1px dashed;
}

.editor input, .editor textarea {
	background: #ffd;
	border-style: solid;
	border-color: #888 #ccc #ccc #888;
	border-width: 2px;
}

.tabContents {white-space: nowrap;}

#displayArea {margin: 1em 20em 0em 14em;}

#sidebar {
	position: absolute;
	right: 3px;
	width: 21em;
	font-size: .9em;
}

#sidebarOptions .button {
	border-color: #eee;
}

#sidebarTabs .tabContents {
	width: 20em;
	overflow: hidden;
}

.viewer tt {
	font-size: 1.2em;
	line-height: 1.4em;
}

ul {list-style-type: square;}
ul ul {list-style-type: circle;}

ol {list-style-type: decimal;}
ol ol {list-style-type: decimal;}
ol ol ol {list-style-type: decimal;}
ol ol ol ol {list-style-type: decimal;}
ol ol ol ol ol {list-style-type: decimal;}
ol ol ol ol ol ol {list-style-type: decimal;}

/*}}}*/
