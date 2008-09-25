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
		$this->selenium = new Testing_Selenium("*firefox", "http://127.0.0.1/Trunk/tests/selenium/selenium_tests/");
		$this->selenium->start();
		$this->selenium->setSpeed("1");
	}

	public function tearDown()
	{
		$this->selenium->stop();
	}

	public function handleError($e, $error_text)
	{
		global $fail_count;
		echo "<div style='background-color:red; color:white;'> Test failed - ".$error_text."</div><br />";
		$fail_count++;
	}

	public function doLogin($u, $p)
	{
		$this->selenium->type("username", $u);
		$this->selenium->type("password", $p);
	//	    $this->selenium->click("//div[@id='tiddlerLogin']/div[2]/form/div[2]/a[1]");
		$this->click("link=login");
		$this->selenium->waitForPageToLoad("30000");
	}

	public function testLoginStatus()
	{
		$this->selenium->click("backstageShow");
		try {
			$this->assertTrue($this->selenium->isTextPresent("logout▾"));
		} catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "Logout button not present.");
		}
	}
	
	public function testEditPermissions()
	{
		
			$this->selenium->open("/rel");
		
			$this->doLogin("admin", "password");
			$this->selenium->click("link=permissions");
		    $this->selenium->click("//input[@name='anR']");
		
			echo $this->selenium->isChecked("usR");
			exit;		
		    	$this->selenium->click("usR");
		
			if($this->selenium->isChecked("usR"))			
		    	$this->selenium->click("usR");
		    
		
		$this->selenium->click("usC");
		    $this->selenium->click("link=Update Workspace Permissions");
		    $this->selenium->click("link=ok");
	}
	
	public function testStartupStuff()
	{
		// click the backstage button.
		try {
			$this->assertTrue($this->selenium->isTextNotPresent("save"));
		} catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "Save button has not been removed.");
		}		
		try {
			$this->assertTrue($this->selenium->isTextNotPresent("upgrade"));
		} catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "Upgrade button has not been removed.");
		}		
		try {
			$this->assertTrue($this->selenium->isTextPresent("about▾"));
		} catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "About buttons has not been added to the backstatge.");
		}				
		try {
			$this->assertTrue($this->selenium->isTextPresent("login▾"));
		} catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "About buttons has not been added to the backstatge.");
		}		
		//TODO attempt to edit the users name for signing edits. 
	}
	
	public function testUpgrade17()
	{
		// load exported data
		// run cctiddly upgrade script
		// load old tiddler 
		// confirm  what the format looks ok
		// edit a tiddler with adding new line <<today>> 
		// confirm the tiddler was edited and saved correctly.
		
		// confirm each macro displays correctly without any errors.
		// ..... also confirm all the required tiddlers have been laoded.		
	}
	
	public function testEditTiddler($tiddler, $text)
	{
		$this->selenium->click("link=edit");
		$this->selenium->click("tiddler".$tiddler);
		$this->selenium->type("//div[@id='tiddler".$tiddler."']/div[4]/fieldset/div/textarea", $text);
	    $this->selenium->click("link=done");
		$this->selenium->refresh();
		try {
			$this->assertTrue($this->selenium->isTextPresent($text));
		 } catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "Tiddler text was not updated");
		}
	}
	
	
	
	public function testReadOnly()
	{
		// confirm edit buttons are not in place. 
		// confirm cannot create new tiddler/task/journal.
		// confirm user cannot delete tiddler.
	}
	
	// returns true if user can delete the tiddler.
	public function testPermDelete($tiddler=null)
	{
		// click edit then delete
		// are there different ways to delete?
		// call js functions directly and check http response
		
	}
	
	// returns true if user can create the tiddler.
	public function testPermCreate($tiddler=null)
	{
		// check for new task 
		// check for new tiddler
		// check for new journal 
		// check for ctrl + N
		// Attempt to call JS function directly 
	}
	
	// returns true of user can update the tiddler.
	public function testPermUpdate($tiddler=null)
	{
		// check for edit button.
		try {
	        $this->assertTrue($this->selenium->isElementPresent("link=edit"));
	    } catch (PHPUnit_Framework_AssertionFailedError $e) {
			$this->handleError($e, "No edit button present.");
	    }
		// Attempt to call JS function directly 
	}
	
	
	// returns true if the user can read the tiddler.
	public function testPermRead($tiddler=null)
	{
		// Tiddler should not be in the story. 
	}
	
	public function	runPermTests()
	{
		$this->selenium->open("/rel");
		$this->doLogin("admin", "password");
		$this->testPermUpdate();		
	}

	public function runTests()
	{
		$this->selenium->open("/17");
		$this->selenium->deleteAllVisibleCookies();
		$this->selenium->open("/17/testing");
		$this->doLogin("username", "password");
		$this->testLoginStatus();
		$this->selenium->deleteAllVisibleCookies();
		$this->selenium->createCookie("txtTheme=smmTheme", "");
		$this->selenium->refresh();
		$this->selenium->open("/17/testing");
		$this->doLogin();
		$this->testLoginStatus();
		$this->testEditTiddler("GettingStarted", "Tiddler changed by selenium at ".mktime());
		$this->selenium->deleteAllVisibleCookies();
		$this->selenium->createCookie("txtTheme=NON EXISTANT THEME", "");
		$this->selenium->refresh();
		$this->selenium->open("/17/testing");
		$this->doLogin();
		$this->testLoginStatus();	
    }
}

$a = new ccTests();
$a->setUp();

//$a->runPermTests();

$a->testEditPermissions();
//$a->runTests();
//$a->testTeamTasks();
//$a->tearDown();

if($fail_count==0) {
	echo "<body style='background-color:green; color:white;'><h1>You have no errors </h1>";
}else {
	echo "Total Fails: ".$fail_count;
}

// DO ALL OF THE BELOW WITH DIFFERENT LANGUAGE PACKS

checkState()
{
	if(testPermRead())
		echo 'user has read permissions';
	if(testPermWrite())
		echo 'user has write permissions';
	if(testPermUpdate())
		echo 'user can update';
	if(testPermDelete())
		echo 'user can delete';
}

//RUN THROUGH 
	// IE6
	// IE7
	// Firefox 
	// Safari
	
//NOT PRESENT
	//create 
	//edit
	//delete ?
	//new task
	//new journal 
	// create workspace 
	// any other macros?
	// Save button
	// sync button
	// backstage >> About
	// backstage >> Login
	
//PRESENT 
	// revisions?
	// login 
	// login status
	// register?
	


// FAILED LOGIN

// FAILED REGISTER

// SUCCESSFUL LOGIN 
	//Anon User

	//Logged in User

	//Admin User 
	
// LOGOUT

?>