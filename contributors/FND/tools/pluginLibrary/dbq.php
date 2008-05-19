<?php

class dbq {
	private $host = "localhost";
	private $user = "root"; 
	private $pass = "";
	private $db = "pluginLibrary";

	function connect($host = null, $user = null, $pass = null, $db = null) {
		setDefault($host, $this->host);
		setDefault($user, $this->user);
		setDefault($pass, $this->pass);
		setDefault($db, $this->db);
		$link = mysql_connect($host, $user, $pass);
		if(!$link) {
			throw new Exception("Unable to connect: " . mysql_error());
		}
		$db = mysql_select_db($db, $link);
		if(!$db) {
			throw new Exception("Unable to connect: " . mysql_error());
		}
		return $db;
	}

	function disconnect() {
		mysql_close();
	}

	function insertRecord($table, $data) {
		if(strlen($data[0]) == 0) { // skip primary key
			array_shift($data);
		}
		$keys = array_keys($data);
		for($i = 0; $i < sizeof($key); $i++) {
			$data[$key[$i]] = $this->escapeQuery($data[$key[$i]]);
		}
		$q = "INSERT INTO " . $table . " (`" . implode("`,`", $key)
			. "`) VALUES ('" . implode("','", $data) . "')";
		debug($q);
		$r = db_query($q);
		return $r;
	}

	function query($q) {
		$r = mysql_query($q);
		if(!$r) {
			return false;
		}
		$rows = array();
		while($row = mysql_fetch_object($r)) {
			debug($row, "individual query result");
			array_push($rows, $row);
		}
		debug($rows, "query results");
		return $rows;
	}

	function escapeQuery($str) {
		if(get_magic_quotes_gpc()) {
			return $str;
		} else {
			return addslashes($str);
		}
	}

	/* DEBUG: obsolete functions */

	function insert($query) {
		$result = mysql_query($query)
			or die("SQL Error: " . $query . " " . mysql_error());
		return $result;
	}

	function updateFieldValue($table, $field, $value, $selector, $match) { // DEBUG: unused
		$result = mysql_query("UPDATE $table SET $field = '$value' WHERE $selector = $match")
			or die("SQL Error: " . mysql_error());
		return $result;
	}
}
?>
