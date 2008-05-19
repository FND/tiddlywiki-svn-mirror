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
	foreach($repositories as $repo) {
		// DEBUG: set all of this repo's plugins availability to false
		$contents = file_get_contents($repo->URI); // DEBUG: missing error handling?
		// set current repository
		$currentRepository = new stdClass;
		$currentRepository->URI = $repo->URI;
		$currentRepository->ID = $repo->ID;
		// document type handling
		if($repo->type == "TiddlyWiki") // TidldyWiki document
			processTiddlyWiki($contents);
		elseif($repo->type == "SVN") // Subversion directory
			echo $repo->type . "\n"; // DEBUG: to be implemented
		elseif($repo->type == "file") // JavaScript file
			echo $repo->type . "\n"; // DEBUG: to be implemented
		else
			addLog("ERROR: failed to process repository " . $repo->url);
		$currentRepository = null; // DEBUG: obsolete?
	}
}

function getRepositories() {
	global $dbq;
	$repositories = $dbq->query("SELECT * FROM repositories");
	debug($repositories, "repositories");
	return $repositories;
}

/*
** tiddler retrieval
*/

function processTiddlyWiki($str) {
	$str = str_replace("xmlns=", "ns=", $str); // workaround for default-namespace bug
	$xml = @new SimpleXMLElement($str); // DEBUG: errors for HTML entities (CDATA issue!?); suppressing errors hacky?!
	$version = getVersion($xml);
	if(floatval($version[0] . "." . $version[1]) < 2.2)
		processPluginTiddlers($xml, true);
	else
		processPluginTiddlers($xml, false);
}

function getVersion($xml) {
	$version = $xml->xpath("/html/head/script");
	preg_match("/major: (\d), minor: (\d), revision: (\d)/", $version[0], $matches);
	$major = intval($matches[1]);
	$minor = intval($matches[2]);
	$revision = intval($matches[3]);
	if($major + $minor + $revision > 0) // DEBUG: dirty hack?
		return array($major, $minor, $revision);
	else
		return null;
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
		if(!$oldStoreFormat) // v2.2+
			$t->text = strval($tiddler->pre);
		else
			$t->text = strval($tiddler);
		// retrieve slices
		$t->slices = getSlices($t->text);
		if(isset($t->slices->name))
			$t->title = $t->slices->name;
		$source = $t->slices->source;
		if(!$source || $source && !(strpos($source, $currentRepository->URI) === false)) // DEBUG: www handling (e.g. http://foo.bar = http://www.foo.bar)
			storePlugin($t);
		else
			addLog("skipped tiddler " . $t->title . " in repository " . $currentRepository->name);
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
				$slices->{strtolower($matches[1][$i])} = $matches[2][$i];
			else // table notation
				$slices->{strtolower($matches[3][$i])} = $matches[4][$i];
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
	if($pluginID)
		updatePlugin($tiddler, $pluginID);
	else
		addPlugin($tiddler);
}

function addPlugin($tiddler) {
	global $dbq, $currentRepository;
	$data = array(
		ID => null,
		repository_ID => $currentRepository->ID,
		available => true,
		title => $tiddler->title,
		text => $tiddler->text,
		created => $tiddler->created, // DEBUG: use MySQL-compatible timestamp
		modified => $tiddler->modified, // DEBUG: use MySQL-compatible timestamp
		modifier => $tiddler->modifier,
		updated => date("Y-m-d H:i:s"),
		documentation => $tiddler->documentation, // DEBUG: to do
		views => 0,
		annotation => null
	);
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
		created => $tiddler->created, // DEBUG: use MySQL-compatible timestamp
		modified => $tiddler->modified, // DEBUG: use MySQL-compatible timestamp
		modifier => $tiddler->modifier,
		updated => date("Y-m-d H:i:s"),
		documentation => $tiddler->documentation // DEBUG: to do
	);
	return $dbq->updateRecords("plugins", $selectors, $data, 1);
}

function pluginExists($repoID, $pluginName) {
	global $dbq;
	$selectors = array(
		repository_ID => $repoID,
		title => $pluginName
	);
	$r = $dbq->retrieveRecords("plugins", "*", $selectors);
	if(sizeof($r) > 0)
		return $r[0]->ID;
	else
		return false;
}

/*
** helper functions
*/

function addLog($text) {
	global $log;
	$timestamp = date("Y-m-d H:i:s");
	array_push($log, $timestamp . " " . $text);
}

function setDefault(&$var, $defaultValue) {
	if(!isset($var)) {
		$var = $defaultValue;
	}
}

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
