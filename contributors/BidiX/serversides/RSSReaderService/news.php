<?php
//{{{
/***
 * news.php - Display a RSS file using a CSS
 * Copyright (c) 2006-2007, BidiX@BidiX.info 
 * version: 2.0.1 - 2007/05/13 - BidiX@BidiX.info
 * source: http://tiddlywiki.bidix.info/#news.php
 * license: BSD open source license (http://tiddlywiki.bidix.info/#[[BSD open source license]])
 * 
 * usage : 
 *	GET  
 *		news.php[?[rss=<rssfile>[&css=<cssfile>][&encoding=<encoding>]]
 *		<rssfile>: a RSSFeed (default index.xml)
 *		<cssfile>: a CssFile (default embeded css)
 *		<encoding>: charset encoding of the feed (default 'utf-8') 
 *
 * Revision history
 * v 2.0.1 - 2007/05/13
 *	small css tweak
 * v 2.0.0 - 2007/03/10
 *	should parse all RSS 2.0 feed
 *	embed a simple stylesheet
 * v 1.0.1 - 2006/11/02 : 
 *	minor enhancements
 * v 1.0.0 - 2006/04/20 : 
 *	design for GenerateRssHijack
 *

 ***/
//
// parameters 
//
	$RSSFEED = 'index.xml';
	$CSS = '';
	$ENCODING = 'utf-8'; //'utf-8' 'iso-8859-1'
if (isset($_GET['rss'])) {
	$RSSFEED = $_GET['rss'];
}
if (isset($_GET['css'])) {
	$CSS = $_GET['css'];
}
if (isset($_GET['encoding'])) {
	$ENCODING = $_GET['encoding'];
}

//
// Parser
//

class RSSParser {
	// state
	var $insideitem = false;
	var $insideHeader = false;
	var $tag = "";
	// feed header
	var $feedTitle = '';
	var $feedDescription = '';
	var $feedLink = '';
	// items
	var $items = array();
	// current item
	var $title = "";
	var $description = "";
	var $link = "";
	// parser
	var $xml_parser;
	var $fp;

	function __construct($url) {
		global $ENCODING;
		$this->xml_parser = xml_parser_create($ENCODING);
		xml_set_object($this->xml_parser,$this);
		xml_set_element_handler($this->xml_parser, "startElement", "endElement");
		xml_set_character_data_handler($this->xml_parser, "characterData");
		$this->url = $url;
		$this->fp = fopen($url,"r") or die("Error reading RSS data.");
	}

	function startElement($parser, $tagName, $attrs) {
		$this->tag = $tagName;
		if ($tagName == "ITEM") {
			//end of header and beginning of item
			$this->insideHeader = false;
			$this->insideitem = true;
		} elseif ($tagName == 'CHANNEL') {
			//beginning of header
			$this->insideHeader = true;
		}
		
	}

	function endElement($parser, $tagName) {
		if ($tagName == "ITEM") {
			$this->items[] = array($this->title, $this->description, $this->link);
			$this->title = "";
			$this->description = "";
			$this->link = "";
			$this->insideitem = false;
		}
	}

	function characterData($parser, $data) {
		if (preg_match('/^\s*$/',$data))
			return;
		if ($this->insideitem) {
			switch ($this->tag) {
				case "TITLE":
				$this->title .= $data;
				break;
				case "DESCRIPTION":
				$this->description .= $data;
				break;
				case "LINK":
				$this->link .= $data;
				break;
			}
		}
		elseif ($this->insideHeader) {
			switch($this->tag) {
				case 'TITLE':
					$this->feedTitle .= $data;
					break;
				case 'DESCRIPTION':
					$this->feedDescription .= $data;
					break;
				case 'LINK':
					$this->feedLink .= $data;
					break;
			}
		}
	}

	function parse() {
		global $ENCODING;
		while ($data = fread($this->fp, 4096))
		xml_parse($this->xml_parser, utf8_html_entity_decode($data, $ENT_NOQUOTES, 'UTF-8'), feof($this->fp))
		or die(sprintf("XML error: %s at line %d",
			xml_error_string(xml_get_error_code($this->xml_parser)),
			xml_get_current_line_number($this->xml_parser)))
		;
		fclose($this->fp);
		xml_parser_free($this->xml_parser);

	}
	
	//
	// print
	//
	
	function printItem($title, $description, $link) {
		print("<div class=\"feedItem\">");
		//title
		printf("<div class=\"itemTitle\"><a href='%s'>%s</a></div>",
			trim($link),trim($title));
		// description
		printf("<div class=\"itemDescription\">%s</div>",$description);
		print("</div>");
	}
	
	function printItems() {
		foreach ($this->items as $item) {
			$this->printItem($item[0], $item[1], $item[2]);
		}
	}
	
}

//
// Utilities for entity_decode (see: http://www.php.net/manual/en/function.html-entity-decode.php)
//

function utf8_replaceEntity($result){
    $value = (int)$result[1];
    $string = '';

    $len = round(pow($value,1/8));

    for($i=$len;$i>0;$i--){
        $part = ($value & (255>>2)) | pow(2,7);
        if ( $i == 1 ) $part |= 255<<(8-$len);

        $string = chr($part) . $string;

        $value >>= 6;
    }
		$string = html_entity_decode($string);	
    return $string;
}

function utf8_html_entity_decode($string){
    return preg_replace_callback(
        '/&#([0-9]+);/u',
        'utf8_replaceEntity',
        $string
    );
}

//
// main
//

$rss_parser = new RSSParser($RSSFEED);
$rss_parser->__construct($RSSFEED);
$rss_parser->parse();

//
// Template HTML
//
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
<meta name="description" content="<?=$rss_parser->feedTitle?> - <?=$rss_parser->feedDescription?>" />
<meta name="keywords" content="TiddlyWiki, RSS" />
<meta name="Generator" content="news.php - Copyright (C) 2007 BidiX@BidiX.info. All rights reserved." />
<meta name="robots" content="index, follow" />
<style type="text/css">
body {
	font-size: .90em;
	font-family: arial, helvetica, sans-serif;
	padding: 30px;
}

h1,h2,h3,h4,h5,h1 {
	font-weight: bold;
}

h1 {font-size: 1.35em;}
h2 {font-size: 1.25em;}
h3 {font-size: 1.1em;}
h4 {font-size: 1em;}
h5 {font-size: .9em;}

a img {border:0;}

#feedTitle {
	font-size: 2em;
	color: #BF2323;
}

#feedDescription {
	font-size: 1,25em;
	color: #666;
}

#items {
	padding-left: 30px;
}

.feedItem {
	padding-top: 1em;
	padding-bottom: 1em;
	border-top: solid 1px #ccc;
}

.itemTitle {
	padding-bottom: 1em;
}

.itemTitle a {
	font-size: 1.35em;
	font-weight: bold;
	color: #BF2323;
}

.itemDescription {
	color: #666;
}

.itemDescription a {
	color:#333;
}
</style>
<link rel="stylesheet" href="<?=$CSS?>" type="text/css" media="screen"/>
<BASE HREF="<?=$rss_parser->feedLink?>">
<title><?=$rss_parser->feedTitle?> - <?=$rss_parser->feedDescription?></title>
</head>
<body>
	<div id="page">
		<div id="header">
			<h1 id="feedTitle"><?=$rss_parser->feedTitle?></h1>
			<h2 id="feedDescription"><?=$rss_parser->feedDescription?></h2>
		</div>
		<div id='items'>
			<?$rss_parser->printItems()?>
		</div>
	</div>
</body>
</html>
<?php
//}}}
?>
