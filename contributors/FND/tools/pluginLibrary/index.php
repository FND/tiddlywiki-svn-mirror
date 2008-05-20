<?php

require "dbq.php";

// initialize debugging variables
$debugMode = true;
$t0 = time();
$log = array();

// establish database connection
$dbq = new dbq();
$dbq->connect();

// start processing
echo "<pre>"; // DEBUG
processRepositories();
echo "</pre>"; // DEBUG

// close database connection
$dbq->disconnect();

// output debugging info
$t1 = time();
echo "Runtime: " . ($t1 - $t0) . " seconds\n"; // DEBUG
debug($log); // DEBUG: write to file?


/*
** repository handling
*/

function processRepositories() {
	global $currentRepository;
	$repositories = getRepositories();
	$currentRepository = new stdClass;
	foreach($repositories as $repo) {
		// set current repository
		$currentRepository->ID = $repo->ID;
		$currentRepository->URI = $repo->URI;
		$currentRepository->name = $repo->name;
		// initialize plugins' availability
		initPluginAvailability();
		// load contents
		$contents = file_get_contents($repo->URI); // DEBUG: missing error handling?
		// document type handling
		if($repo->type == "TiddlyWiki") // TiddlyWiki document
			processTiddlyWiki($contents);
		elseif($repo->type == "SVN") // Subversion directory
			echo $repo->type . "\n"; // DEBUG: to be implemented
		elseif($repo->type == "file") // JavaScript file
			echo $repo->type . "\n"; // DEBUG: to be implemented
		else
			addLog("ERROR: failed to process repository " . $repo->url);
	}
}

function getRepositories() {
	global $dbq;
	$repositories = $dbq->retrieveRecords("repositories", array("*"));
	return $repositories;
}

function initPluginAvailability() {
	global $dbq;
	$data = array(
		available => false
	);
	$dbq->updateRecords("plugins", $data);
}

/*
** tiddler retrieval
*/

function processTiddlyWiki($str) {
	$str = str_replace("xmlns=", "ns=", $str); // workaround for default-namespace bug
	$xml = @new SimpleXMLElement($str); // DEBUG: errors for HTML entities (CDATA issue!?); suppressing errors hacky?!
	$version = getVersion($xml);
	if(floatval($version[0] . "." . $version[1]) < 2.2) {
		processPluginTiddlers($xml, true);
	} else {
		processPluginTiddlers($xml, false);
	}
}

function getVersion($xml) {
	$version = $xml->xpath("/html/head/script");
	preg_match("/major: (\d), minor: (\d), revision: (\d)/", $version[0], $matches);
	$major = intval($matches[1]);
	$minor = intval($matches[2]);
	$revision = intval($matches[3]);
	if($major + $minor + $revision > 0) { // DEBUG: dirty hack?
		return array($major, $minor, $revision);
	} else {
		return null;
	}
}

function processPluginTiddlers($xml, $oldStoreFormat = false) {
	global $currentRepository;
	// DEBUG: use of strval() for SimpleXML value retrieval hacky!?
	$filter = "//div[@id='storeArea']/div[contains(@tags, 'systemConfig')]";
	$tiddlers = $xml->xpath($filter);
	foreach($tiddlers as $tiddler) {
		// initialize tiddler object -- DEBUG: correct? required?
		$t = new stdClass;
		$t->fields = new stdClass;
		// set repository
		$t->repository = $currentRepository->URI;
		// retrieve tiddler fields
		foreach($tiddler->attributes() as $field) {
			switch($field->getName()) {
				case "title":
					$t->title = strval($field);
					break;
				case "tags":
					$t->tags = strval($field);
					break;
				case "created":
					$t->created = strval($field);
					break;
				case "modified":
					$t->modified = strval($field);
					break;
				case "modifier":
					$t->modifier = strval($field);
					break;
				default: // extended fields
					$t->fields->{$field->getName()} = strval($field);
					break;
			}
		}
		// retrieve tiddler text -- DEBUG: strip leading and trailing whitespace?
		if(!$oldStoreFormat) { // v2.2+
			$t->text = strval($tiddler->pre);
		} else {
			$t->text = strval($tiddler);
		}
		// retrieve slices
		$t->slices = getSlices($t->text);
		if(isset($t->slices->Name)) {
			$t->title = $t->slices->Name;
		}
		$source = $t->slices->source;
		// retrieve plugins only from original source
		if(!$source || $source && !(strpos($source, $currentRepository->URI) === false)) { // DEBUG: www handling (e.g. http://foo.bar = http://www.foo.bar)
			storePlugin($t);
		} else {
			addLog("skipped tiddler " . $t->title . " in repository " . $currentRepository->name);
		}
	}
}

function getSlices($text) {
	$pattern = "/(?:[\'\/]*~?([\.\w]+)[\'\/]*\:[\'\/]*\s*(.*?)\s*$)|(?:\|[\'\/]*~?([\.\w]+)\:?[\'\/]*\|\s*(.*?)\s*\|)/m"; // RegEx origin: TiddlyWiki core
	$slices = new stdClass;
	preg_match_all($pattern, $text, $matches);
	$m = $matches[0];
	if($m) {
		for($i = 0; $i < count($m); $i++) {
			if($matches[1][$i]) // colon notation
				$slices->{$matches[1][$i]} = $matches[2][$i];
			else // table notation
				$slices->{$matches[3][$i]} = $matches[4][$i];
		}
	}
	return $slices;
}

/*
** tiddler integration
*/

function storePlugin($tiddler) {
	global $currentRepository;
	$pluginID = pluginExists($currentRepository->ID, $tiddler->title);
	if($pluginID) {
		updatePlugin($tiddler, $pluginID);
	} else {
		addPlugin($tiddler);
	}
}

function addPlugin($tiddler) {
	global $dbq, $currentRepository;
	$data = array(
		ID => null,
		repository_ID => $currentRepository->ID,
		available => true,
		title => $tiddler->title,
		text => $tiddler->text,
		created => convertTiddlyTime($tiddler->created),
		modified => convertTiddlyTime($tiddler->modified),
		modifier => $tiddler->modifier,
		updated => date("Y-m-d H:i:s"),
		documentation => $tiddler->documentation, // DEBUG: to do
		views => 0,
		annotation => null
	);
	addLog("added plugin " . $tiddler->title . " from repository " . $currentRepository->name);
	return $dbq->insertRecord("plugins", $data);
}

function updatePlugin($tiddler, $pluginID) {
	global $dbq, $currentRepository;
	$selectors = array(
		ID => $pluginID
	);
	$data = array(
		repository_ID => $currentRepository->ID,
		available => true,
		title => $tiddler->title,
		text => $tiddler->text,
		created => convertTiddlyTime($tiddler->created),
		modified => convertTiddlyTime($tiddler->modified),
		modifier => $tiddler->modifier,
		updated => date("Y-m-d H:i:s"),
		documentation => $tiddler->documentation // DEBUG: to do
	);
	addLog("updated plugin " . $tiddler->title . " in repository " . $currentRepository->name);
	return $dbq->updateRecords("plugins", $data, $selectors, 1);
}

function pluginExists($repoID, $pluginName) {
	global $dbq;
	$selectors = array(
		repository_ID => $repoID,
		title => $pluginName
	);
	$r = $dbq->retrieveRecords("plugins", array("*"), $selectors);
	if(sizeof($r) > 0) {
		return $r[0]->ID;
	} else {
		return false;
	}
}

/*
** helper functions
*/

//  convert TiddlyWiki timestamps to ISO 8601 format
function convertTiddlyTime($timestamp) {
		if(strlen($timestamp) == 0) {
			return null;
		} else {
			$timestamp = strtotime($timestamp);
			return date("Y-m-d H:i:s", $timestamp); 
		}
}

// add log message
function addLog($text) {
	global $log;
	$timestamp = date("Y-m-d H:i:s");
	array_push($log, $timestamp . " " . $text);
}

// set default value if necessary
function setDefault(&$var, $defaultValue) {
	if(!isset($var)) {
		$var = $defaultValue;
	}
}

// generate debugging output
function debug($var, $msg = null) {
	global $debugMode;
	if($debugMode) {
		echo "<pre>";
		if(isset($msg)) {
			echo "***** " . $msg . " *****\n";
		}
		if(is_string($var) || is_int($var) || is_float($var)) {
			echo $var . "\n";
		} elseif(is_bool($var)) {
			echo ($var ? "True" : "False") . "\n";
		} elseif(is_null($var)) {
			echo "NULL\n";
		} else {
			print_r($var);
		}
		echo "</pre>";
	}
}

?>
