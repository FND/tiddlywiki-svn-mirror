<?

//  convert TiddlyWiki timestamps to ISO 8601 format
function convertTiddlyTime($timestamp) {
		if(strlen($timestamp) == 0) {
			return null;
		} else {
			$timestamp = strtotime($timestamp);
			return date("Y-m-d H:i:s", $timestamp);
		}
}

// convert a string of items (space-separated or [[bracketed]]) to an array
function readBracketedList($str, $unique = true) {
	$pattern = "/(?:\[\[)(.+)(?:\]\])|(\S+)/s";
	preg_match_all($pattern, $str, $matches);
	$arr = array();
	for($i = 0; $i < count($matches[0]); $i++) {
		if($matches[1][$i]) { // bracketed item
			array_push($arr, $matches[1][$i]);
		} else {
			array_push($arr, $matches[2][$i]);
		}
	}
	if($unique) {
		$arr = array_unique($arr);
	}
	return $arr;
}

// retrieve URL (including HTTP response handling)
function getPageContents($URL) {
	global $http_response_header;
	// retrieve URL
	$contents = @file_get_contents($URL); // N.B.: requires fopen wrappers
	// retrieve HTTP status code
	list($version, $statusCode, $msg) = explode(" ", $http_response_header[0], 3);
	// check HTTP status code
	if($statusCode == 200) { // DEBUG: too limited (e.g. 301/302)?
		return $contents;
	} else {
		return false;
	}
}

// add log message
function addLog($text) {
	global $log;
	if(!isset($log)) {
		$log = array();
	}
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
