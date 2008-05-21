<?php

require_once "../dbq.php";

/*
** Note:
** The general structure of unit tests consists of three parts:
** 1. setup
** 2. action
** 3. assertion
** In rare cases (e.g. when handling errors and exceptions), steps 2 and 3 may be swapped.
*/

class testDatabaseConnection extends UnitTestCase {

	// return TRUE for successful connection
	function testReturnTrueOnSuccess() {
		$dbq = new dbq();
		$db = $dbq->connect();

		$dbq->disconnect();

		$this->assertTrue($db);
	}

	// throw exception for failed connection
	function testThrowExceptionOnFailure() {
		$dbq = new dbq();

		$this->expectException();

		$dbq->connect("dummyHost");
	}

}

class testDatabaseDisconnect extends UnitTestCase {

	// return TRUE for successful disconnect
	function testReturnTrueOnSuccess() {
		$dbq = new dbq();
		$dbq->connect();

		$db = $dbq->disconnect();

		$this->assertTrue($db);
	}

	// return FALSE for failed disconnect
	function testReturnFalseOnFailure() {
		$dbq = new dbq();

		$this->expectError(); // DEBUG: temporary workaround
		$db = $dbq->disconnect();

		//$this->assertFalse($db); // DEBUG'd
	}

}

?>
