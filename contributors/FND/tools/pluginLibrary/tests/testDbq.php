<?php

require_once("../dbq.php");

class TestOfDbq extends UnitTestCase {
    function testDatabaseConnection() {
		$dbq = new dbq();
		$db = $dbq->connectToDB();
        $this->assertTrue($db);
    }
}

?>
