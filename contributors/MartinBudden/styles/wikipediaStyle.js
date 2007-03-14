/***
Stylesheet, which when used with a Wikipedia skin stylesheet, helps give TiddlyWiki the appearance of Wikipedia.
***/

/*{{{*/
.headerShadow {padding:.5em 0em .5em 1em;}
.headerForeground {padding:.5em 0em .5em 1em;}
.header {background:darkblue;}
.headerShadow {color:white;}

h1,h2,h3,h4,h5,h6 {padding-left:0em;}

/* The bit that contains all tiddlers */
#displayArea {
	margin-top:0;margin-right:15.5em;margin-bottom:0;margin-left:0.5em;
	padding-top:.1em;padding-bottom:.1em;
	-moz-border-radius:1em;
}

.tiddlyLinkExisting {text-decoration:underline;}
#sidebarTabs .tiddlyLinkExisting {text-decoration:none;}

/* Tiddlers */
.title {color:black;border-bottom:2px solid #ddd;}
.subtitle {font-size:0.9em;text-align:right;border-bottom:1px solid #ddd;}
.tiddler {-moz-border-radius:1em;border:1px solid #ccc;margin:0.5em;background:#fff;padding:0.5em;}

.tabContents {white-space:nowrap;}

.viewer pre {padding:0;margin-left:0;}
.viewer hr {border:solid 1px silver;}
.viewer th, thead td {background:#db4;border:1px solid #666;color:black;}

.toolbar {padding-top:0px;padding-bottom:0px;color:#04b;}
.selected .toolbar {visibility:visible;color:#00f;}

.toolbar .button {color:#dee;}
.selected .toolbar .button {color:#014;}

.tagging, .tagged, .selected .tagging, .selected .tagged {
	font-size:75%;padding:0.3em;background-color:#eee;
	border-top:1px solid #ccc;border-left:1px solid #ccc;
	border-bottom:3px solid #ccc;border-right:3px solid #ccc;
	max-width:45%;-moz-border-radius:1em;
}
/*}}}*/
