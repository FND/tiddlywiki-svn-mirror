/***
SocialtextWikiwygStyle
http://www.eu.socialtext.net/static/2.0.0.1/css/st/wikiwyg.css
***/

/*{{{*/
body {
	background: #ffd;
}

table {
	border: 1px solid black;
}

td {
	border: 1px solid black;
}


a {
	color: blue;
	text-decoration: underline;
}

/* XXX: this is supposed to create a 
	visual indicator of don't touch this
	but like this is a bit heavy handed.
	Please improve... */
.nlw_phrase, .wafl_block {
	padding: .125em;
	border: thin dashed rgb(128,128,128);
	background-color: rgb(224,224,224); 
	color: rgb(128,128,128);
}

/* XXX: this attempts to make generated toc wafl blocks appear
 * un-editable.  It works reasonably well in Firefox, but doesn't appear
 * to have any impact in IE.  All three of these selectors appear to be necessary
 */
.nlw_phrase .toc:before {
	content: "GENERATED TABLE OF CONTENTS ";
}

.nlw_phrase .toc p {
	display: none;
}

.nlw_phrase .toc ul {
	display: none;
}

li {
	margin-left:1em;
}
/*}}}*/
