<?php
class ModulesLoader {
	public $events;
	public $plugins;
	public $tidddlers;
	public $msgHandlers;
	
	public function __construct(){
		$this->events = array();
		$this->plugins = array();
		$this->tidddlers = array();
		$this->msgHandlers = array();
	}	
	//  These functions populate arrays with module data
	// !! ccT needs to make sure these arrays are processed
	
	public function addPlugin($plugin){
		array_push($this->plugins,$plugin);
	}
	
	public function addEvent($eventname,$event){
		if ( !isset($this->events[$eventname]))
             $this->events[$eventname] = array();
			array_push($this->events[$eventname], $event); 
	}
	
	public function addTiddler($tiddler){
		array_push($this->tiddlers,$tiddler);
	}
	
	public function addHandler($msgHandler){
		array_push($this->msgHandlers,$msgHandler);
	}
	
	public function readModules($cct_base){
		$dir = $cct_base."modules/";
		include("modules.php");
		error_log("dir".$dir);

		// Open a known directory, and proceed to read its contents
		if (is_dir($dir)) {
			error_log("IS DIRECTORY !!!!!");
		    if ($dh = opendir($dir)) {
		       while (($file = readdir($dh)) !== false) {
					if( is_dir($dir.$file))
					{
						
						// check for index.php and remove the ..
					 	$modulePath = $dir.$file."/index.php";
						if (is_file($modulePath) && $file!=='..')
						{
							
								error_log($modulePath."IS DIRECTORY !!!!!");
							include($modulePath);
						}
					}
		    	}
		        closedir($dh);
		    }
		}
	}
	
	public function runModules(){
		global $Modules;
		foreach ($Modules as $module)
		{
			$module->run();
		}		
	}
}

global $modulesLoader;
$modulesLoader = new ModulesLoader();
$modulesLoader->readModules($cct_base);
//this needs to make sure plugins and events are loaded by ccT
$modulesLoader->runModules();
?>