<?php

require_once 'Testing/Selenium.php';
require_once 'PHPUnit/Framework/TestCase.php';

class GoogleTest extends PHPUnit_Framework_TestCase
{
    private $browser;

    public function setUp()
    {
	$this->browser = new Testing_Selenium("*iexplore", "http://127.0.0.1");
        $this->browser->start();
    }

    public function testGoogle()
    {
        $this->browser->open("/Trunk");
    }

	public function doLogin($u, $p)
	{
		$this->browser->type("username", $u);
//		$this->browser->type("password", $p);
			    $this->->browser->type("//input[@type='password']", "password");
			
			
		$this->click("link=Login");
		$this->browser->waitForPageToLoad("30000");
		
		$this->click("//div[@id='tiddlerLogin']/div[3]/form/div[2]/a[1]");
	    $this->type("//input[@type='password']", "password");
	
	
	}
}

$a = new GoogleTest();
$a->setUp();
$a->testGoogle();
$a->doLogin("username", "password");
?>


