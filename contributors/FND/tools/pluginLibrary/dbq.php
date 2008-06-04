<?php

require_once "utils.php";

class dbq {
	private $host = "localhost";
	private $user = "root"; 
	private $pass = "";
	private $db = "pluginLibrary";

	/**
	* establish database connection
	* @param string [$host] host location
	* @param string [$user] username
	* @param string [$pass] password
	* @param string [$db] database name
	* @return resource database link
	*/
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

	/**
	* close database connection
	* @param resource [$link] MySQL connection
	* @return boolean success or failure
	*/
	function disconnect($link = null) {
		if(isset($link)) {
			return mysql_close($link);
		} else {
			return mysql_close();
		}
	}

	/**
	* execute database query
	* @param string $q query string
	* @param boolean [$isInsert] query is insert operation
	* @return variable FALSE on failure; ID for insert operation; number of affected rows for update and remove operations, results array for retrieval operation
	*/
	function query($q, $isInsert = false) {
		$r = mysql_query($q);
		if($isInsert) { // insert operation
			return mysql_insert_id();
		}
		elseif(is_bool($r)) { // update or delete operation, or failure
			return $r ? mysql_affected_rows() : false;
		} else { // retrieval operation
			$rows = array();
			while($row = mysql_fetch_object($r)) {
				array_push($rows, $row);
			}
			return $rows;
		}
	}

	/**
	* add record to database
	* @param string $table table name
	* @param array $data key-value pairs to be inserted
	* @return variable FALSE on failure; ID on success
	*/
	function insertRecord($table, $data) {
		foreach($data as $k => $v) {
			$data[$k] = $this->escapeQuery($v);
		}
		$q = "INSERT INTO `" . $table . "` (`" . implode("`, `", array_keys($data))
			. "`) VALUES ('" . implode("', '", $data) . "')";
		return $this->query($q, true);
	}

	/**
	* update records in database
	* @param string $table table name
	* @param array $data key-value pairs to update record with
	* @param array [$selectors] key-value pairs to serve as selectors (WHERE condition; joined by "AND")
	* @param integer [$limit] max. number of records to update (0 for no limit)
	* @return variable FALSE on failure; number of affected rows on success
	* @todo use $comparisonOperator and $joinOperator; cf. removeRecords()
	*/
	function updateRecords($table, $data, $selectors = null, $limit = 0) {
		$q = "UPDATE `" . $table . "` SET ";
		while(list($k, $v) = each($data)) {
			$q .= "`" . $this->escapeQuery($k) . "` = '" . $this->escapeQuery($v) . "', ";
		}
		$q = substr($q, 0, strlen($q) - 2); // remove trailing comma
		if(isset($selectors)) {
			$q .= " WHERE ";
			while(list($k, $v) = each($selectors)) {
				$q .= "`" . $this->escapeQuery($k) . "` = '" . $this->escapeQuery($v) . "' AND ";
			}
			$q = substr($q, 0, strlen($q) - 5); // remove trailing "AND"
			if($limit > 0) {
				$q .= " LIMIT " . $limit;
			}
		}
		return $this->query($q);
	}

	/**
	* remove records from database
	* @param string $table table name
	* @param array $selectors key-value pairs to serve as selectors (WHERE condition)
	* @param string [$comparisonOperator] operator for all selectors
	* @param string [$joinOperator] operator for joining conditions
	* @param integer [$limit] max. number of records to remove (0 for no limit)
	* @return variable FALSE on failure; number of affected rows on success
	*/
	function removeRecords($table, $selectors, $comparisonOperator = "=", $joinOperator = "AND", $limit = 0) {
		$q = "DELETE FROM `" . $table . "` WHERE ";
		while(list($k, $v) = each($selectors)) {
			$q .= "`" . $this->escapeQuery($k) . "` " . $comparisonOperator . " '"
				. $this->escapeQuery($v) . "' " . $joinOperator . " ";
		}
		$q = substr($q, 0, strlen($q) - (strlen($joinOperator) + 2)); // remove trailing join operator
		if($limit > 0) {
			$q .= " LIMIT " . $limit;
		}
		return $this->query($q);
	}

	/**
	* retrieve records from database
	* @param string $table table name
	* @param array $fields fields to retrieve
	* @param array [$selectors] key-value pairs to serve as selectors (WHERE condition; joined by "AND")
	* @param integer [$limit] max. number of records to remove (0 for no limit)
	* @return variable FALSE on failure, results array on success
	* @todo use $comparisonOperator and $joinOperator; cf. removeRecords()
	*/
	function retrieveRecords($table, $fields, $selectors = null, $limit = 0) {
		$q = "SELECT " . implode("`, `", $fields) . " FROM `" . $table . "`";
		if(isset($selectors)) {
			$q .= " WHERE ";
			while(list($k, $v) = each($selectors)) {
				$q .= "`" . $this->escapeQuery($k) . "` = '" . $this->escapeQuery($v) . "' AND ";
			}
			$q = substr($q, 0, strlen($q) - 4); // remove trailing "AND"
		}
		if($limit > 0) {
			$q .= " LIMIT " . $limit;
		}
		return $this->query($q);
	}

	/**
	* escape query string where necessary
	* @param string $q query string
	* @return string escaped query string
	*/
	function escapeQuery($q) {
		if(get_magic_quotes_gpc()) {
			return $q;
		} else {
			return mysql_real_escape_string($q);
		}
	}
}

?>
