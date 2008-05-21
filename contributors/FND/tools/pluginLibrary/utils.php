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
