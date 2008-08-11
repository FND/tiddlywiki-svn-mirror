<?php

require_once('simpletest/unit_tester.php');
require_once('simpletest/reporter.php');

$test = &new TestSuite("database-query tests");
$test->addTestFile("testDbq.php");
$test->run(new HtmlReporter());

?>
