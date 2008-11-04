<?php
class PluginsLoader {
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
	
	public function readPlugins($cct_base){
		$dir = $cct_base."plugins/";
		include("plugins.php");
		// Open a known directory, and proceed to read its contents
		if (is_dir($dir)) {
		    if ($dh = opendir($dir)) {
		       while (($file = readdir($dh)) !== false) {
					if( is_dir($dir.$file))
					{
						// check for index.php and remove the ..
					 	$pluginPath = $dir.$file."/index.php";
						if (is_file($pluginPath) && $file!=='..')
						{
							include($pluginPath);
						}
					}
		    	}
		        closedir($dh);
		    }
		}
	}
	
	public function runPlugins(){
		global $Plugins;
		foreach ($plugins as $plugin)
		{
			$plugin->run();
		}		
	}
}

global $pluginsLoader;
$pluginsLoader = new PluginsLoader();
$pluginsLoader->readPlugins($cct_base);
//this needs to make sure plugins and events are loaded by ccT
$pluginsLoader->runPlugins();
?>