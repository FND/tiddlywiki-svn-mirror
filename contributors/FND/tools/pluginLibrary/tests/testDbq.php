<?php

require_once("../dbq.php");

class testDatabaseConnection extends UnitTestCase {
	function testReturnTrueOnSuccess() {
		$dbq = new dbq();
		$db = $dbq->connectToDB();
		$this->assertTrue($db);
	}

	function testReturnFalseOnFailure() {
		$dbq = new dbq();
		$db = $dbq->connectToDB("fakeHost"); // DEBUG: leads to die()
		$this->assertFalse($db);
	}
}

?>
