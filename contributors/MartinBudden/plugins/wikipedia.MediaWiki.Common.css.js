/***
From:
http://meta.wikimedia.org/wiki/MediaWiki:Common.css
***/
/*{{{*/
/* wikitable/prettytable class for skinning normal tables */
table.wikitable,
table.prettytable {margin:1em 1em 1em 0;background:#f9f9f9;border:1px #aaaaaa solid;border-collapse:collapse;}
table.wikitable th, table.wikitable td,
table.prettytable th, table.prettytable td {border:1px #aaaaaa solid;padding:0.2em;}
table.wikitable th,
table.prettytable th {background:#f2f2f2;text-align:center;}
table.wikitable caption,
table.prettytable caption {margin-left:inherit;margin-right:inherit;}

.allpagesredirect {font-style:italic;}

/* Infobox template style */
.infobox {
	border:1px solid #aaaaaa;
	background-color:#f9f9f9;
	color:black;
	margin-bottom:0.5em;
	margin-left:1em;
	padding:0.2em;
	float:right;
	clear:right;
}
.infobox td,
.infobox th {vertical-align:top;}
.infobox caption {font-size:larger;margin-left:inherit;}
.infobox.bordered {border-collapse:collapse;}
.infobox.bordered td,
.infobox.bordered th {border:1px solid #aaaaaa;}
.infobox.bordered .borderless td,
.infobox.bordered .borderless th {border:0;}
.infobox.sisterproject {width:20em;font-size:90%;}

/* Removes useless links from printout */
@media print {#privacy, #about, #disclaimer {display:none;}}

.plainlinksneverexpand a {background:none !important; padding:0 !important}

/* log formatting */
.logtable pre {margin:0;padding:0;border:0;}
/*}}}*/
