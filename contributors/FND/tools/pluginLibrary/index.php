<?php

require_once "dbq.php";
require_once "utils.php";

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

// close database connection -- DEBUG: not required?
$dbq->disconnect();

// output debugging info
$t1 = time();
echo "Runtime: " . ($t1 - $t0) . " seconds\n"; // DEBUG
debug($log); // DEBUG: write to file?

/*
** repository handling
*/

/**
* process repositories
* @return null
*/
function processRepositories() {
	global $currentRepository;
	$repositories = getRepositories();
	$currentRepository = new stdClass;
	foreach($repositories as $repo) {
		if($repo->disabled) {
			addLog("skipped disabled repository " . $repo->name);
		} else {
			addLog("processing repository " . $repo->name);
			// set current repository
			$currentRepository->ID = $repo->ID;
			$currentRepository->URI = $repo->URI;
			$currentRepository->name = $repo->name;
			// initialize plugins' availability
			initPluginAvailability($repo->ID);
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
}

/**
* retrieve repositories
* @return array results
*/
function getRepositories() {
	global $dbq;
	return $dbq->retrieveRecords("repositories", array("*"));
}

/**
* initialize plugin availability
* @param integer $repoID ID of the respective repository
* @return null
*/
function initPluginAvailability($repoID) {
	global $dbq;
	$data = array(
		available => false
	);
	$selectors = array(
		repository_ID => $repoID
	);
	$dbq->updateRecords("plugins", $data, $selectors);
	// DEBUG: tags, fields and metaslices need to be purged
}

/*
** tiddler retrieval
*/

/**
* process TiddlyWiki document
* @param object $xml SimpleXML object
* @return null
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

/**
* get version number from a TiddlyWiki document
* @param object $xml SimpleXML object
* @return object
*/
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

/**
* process plugin tiddlers within a TiddlyWiki document
* @param object $xml SimpleXML object
* @param boolean [$oldStoreFormat] use pre-v2.2 TiddlyWiki store format
* @return null
*/
function processPluginTiddlers($xml, $oldStoreFormat = false) { // DEBUG: split into separate functions
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
		// retrieve tiddler text -- DEBUG: strip leading and trailing whitespaces (esp. line feeds)?
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
			// check blacklist
			if(pluginBlacklisted($t->title, $currentRepository->ID)) {
				addLog("skipped blacklisted plugin " . $t->title . " in repository " . $currentRepository->name);
			}
			// retrieve documentation sections
			preg_match("/(?:\/\*\*\*)(.*)(?:\*\*\*\/)/s", $t->text, $matches); // DEBUG: extraction pattern too simplistic?
			$t->documentation = $matches[1];
			// store plugin
			storePlugin($t);
		} else {
			addLog("skipped tiddler " . $t->title . " in repository " . $currentRepository->name);
		}
	}
}

/**
* retrieve plugin meta-slices
* @param string $text tiddler text
* @return object
*/
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

/**
* store a plugin in the database (insert or update)
* @param object $tiddler tiddler object
* @return null
*/
function storePlugin($tiddler) {
	global $currentRepository;
	$pluginID = pluginExists($tiddler->title, $currentRepository->ID);
	if($pluginID) {
		updatePlugin($tiddler, $pluginID);
	} else {
		addPlugin($tiddler);
	}
}

/**
* add a plugin to the database
* @param object $tiddler tiddler object
* @return integer plugin ID
*/
function addPlugin($tiddler) {
	global $dbq, $currentRepository;
	addLog("adding plugin " . $tiddler->title . " from repository " . $currentRepository->name);
	// insert plugin
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
	$pluginID = $dbq->insertRecord("plugins", $data);
	// insert tiddler fields
	insertTiddlerFields($tiddler->fields, $pluginID, false);
	// DEBUG: process tags, fields and metaslices
	return $pluginID;
}

/**
* update a plugin in the database
* @param object $tiddler tiddler object
* @param integer $pluginID ID of the respective plugin
* @return null
*/
function updatePlugin($tiddler, $pluginID) {
	global $dbq, $currentRepository;
	addLog("updating plugin " . $tiddler->title . " in repository " . $currentRepository->name);
	// update plugin
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
	$dbq->updateRecords("plugins", $data, $selectors, 1);
	// re-insert fields
	insertTiddlerFields($tiddler->fields, $pluginID, true);
	// DEBUG: process tags, fields and metaslices
}

/**
* add (or re-insert) a plugin's tiddler fields to the database
* @param array $fields key-value pairs for field name and value
* @param integer $pluginID ID of the respective plugin
* @param boolean [$isUpdate] plugin existed before // DEBUG: currently unused
* @return null
*/
function insertTiddlerFields($fields, $pluginID, $isUpdate = false) {
	global $dbq;
	while(list($k, $v) = each($fields)) { // DEBUG: why is this an associative array now - supposed to be an object!?
		$data = array(
			ID => null,
			plugin_ID => $pluginID,
			name => $k,
			value => $v
		);
		$dbq->insertRecord("tiddlerFields", $data); // DEBUG: auto-increments ID - bad when updating!
	}
}

/**
* check whether a plugin is blacklisted
* @param string $name name of the respective plugin
* @param integer $repoID ID of the respective repository
* @return boolean
*/
function pluginBlacklisted($name, $repoID) {
	global $dbq;
	return false; // DEBUG: to do
}

/**
* check whether a plugin exists in the database
* @param string $name name of the respective plugin
* @param integer $repoID ID of the respective repository
* @return variable FALSE on failure; plugin ID on success
*/
function pluginExists($name, $repoID) {
	global $dbq;
	$selectors = array(
		repository_ID => $repoID,
		title => $name
	);
	$r = $dbq->retrieveRecords("plugins", array("*"), $selectors);
	if(sizeof($r) > 0) {
		return $r[0]->ID;
	} else {
		return false;
	}
}

?>
