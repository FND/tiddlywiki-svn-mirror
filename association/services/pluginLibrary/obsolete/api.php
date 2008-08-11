<?php

require_once "dbq.php";
require_once "utils.php";

// initialize debugging variables
$debugMode = true;
$t0 = time();

// establish database connection
$dbq = new dbq();
$dbq->connect();

// retrieve request parameters
$params = explode("/", $_SERVER["REQUEST_URI"]);
array_splice($params, 0, 3); // remove file path -- DEBUG: hacky? (e.g. breaks when using subdomain instead)
debug($params, "URL parameters");

// output debugging info
$t1 = time();
addLog("Runtime: " . ($t1 - $t0) . " seconds");
debug($log, "Log"); // DEBUG: write to file?; record HTTP_HOST?

?>
