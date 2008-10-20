<?php

set_include_path(get_include_path() . PATH_SEPARATOR . './PEAR/');
require_once 'Testing/Selenium.php';
require_once 'PHPUnit/Framework/TestCase.php';
class ccTests extends PHPUnit_Framework_TestCase
{
	private $selenium;
	public function setUp()
	{
		global $fail_count;
		$fail_count=0;
		$this->selenium = new Testing_Selenium("*iexplore", "http://127.0.0.1/Trunk/");
		$this->selenium->start();
		$this->selenium->setSpeed("1");
	}

	public function tearDown()
	{
		$this->selenium->stop();
	}


	$a = new ccTests();
	$a->setUp();

	//$a->runTests();
	

?>
