<?php
$cct_base = '';
$tiddlyCfg['plugins_disabled'] =  array();
echo 'fetching tidlers..';

include_once('includes/functions.php');
include_once('includes/tiddler.php');
include_once('includes/pluginsClass.php');
include_once('includes/pluginsLoaderClass.php');

class PluginsLoaderReplace extends PluginsLoader
{
	public function includePlugins($cct_base) {
		// add one param to the beginning of PluginFetcher call and eval the new code.
		$plugins = $this->readPlugins($cct_base);
		foreach($plugins as $plugin)
		{
			$pluginPathArray = explode("/", $plugin);
			echo $pluginPathArray[1];
			$pluginContent = file_get_contents($plugin);
			$newPluginContent  = str_replace("<?php", "", $pluginContent);
		 	$newPluginContent = str_replace('new Plugin(', 'new PluginFetcher("'.$pluginPathArray[1].'",', $newPluginContent);
			eval($newPluginContent);
		}
	}
}

class PluginFetcher extends Plugin
{
	
	public function __construct($pluginName, $author, $version, $website) {
		global $Plugins;
		$this->pluginName = $pluginName;
		$this->author = $author;
		$this->version = $version;
		$this->website = $website;
		$this->phpEvents = array();
		$this->tiddlers = array();
		array_push($Plugins,$this);
	}
	
	
	public function addTiddler($data, $path=null) {
		if(is_file($path))
			$tiddler = $this->tiddlerFromFile($path);
		else 
			$tiddler = array();
		if(is_array($data)) 
			$tiddler = array_merge_recursive($data,$tiddler);
		$this->tiddlers[$tiddler['title']] = $tiddler;
		var_dump($this->pluginName);
	}
	public function addRecipe($path) {
		
		$path = str_replace(getcwd()."/plugins/", "", $this->preparePath($path));
		$path = substr($path, 0, stripos($path, "/"));
	 	$pluginName = $path;		
		$file = $this->getContentFromFile($this->preparePath($path));
		$this->parseRecipe($file, dirname($path));	
	}
}

$pluginsLoader = new PluginsLoaderReplace();
$pluginsLoader->includePlugins($cct_base);

/*
global $pluginsLoader1;
$pluginsLoader1 = new PluginsLoader();
$a = $pluginsLoader1->readPlugins($cct_base);

foreach($a as $b){
	
	$p = new PluginFetcher('ccTiddly', '0.1', 'simonmcmanus.com');

	$pluginIndex = file_get_contents($b);
	$pluginLines = explode("\n", $pluginIndex);
	foreach($pluginLines as $pluginLine){
		if(stristr($pluginLine, 'addRecipe'))
		{
			$code = str_replace('?>', '', $pluginLine);
			echo '<br /><b>'.$code.'</b><br/>';
			eval($code);
		}	
	}
}


*/
/*


public function addRecipe($path) {
	$file = $this->getContentFromFile($this->preparePath($path));
	$this->parseRecipe($file, dirname($path));	
}

*/
/*


	$pluginsLoader = new PluginsLoader();
	$pluginsLoader->readPlugins($cct_base);
	$pluginsLoader->runPlugins();
	
	
foreach($plugins as $plugin) {
	$pluginIndex = readfile($plugin);

	$pluginIndexLines = explode("\n", $pluginIndex);
	foreach($pluginIndexLines as $pluginIndexLine)
		echo $pluginIndexLine;
}

	*/




?>