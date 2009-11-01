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
	
	public function createTidFile($path, $tiddler)
	{
		@mkdir(dirname($path));
		$fhandle = fopen($path, 'w') or die("can't open file");
		fwrite($fhandle, "created:".$tiddler['created']."\n");
		fwrite($fhandle, "modified:".$tiddler['modified']."\n");
		fwrite($fhandle, "tags:".$tiddler['tags']."\n");
		fwrite($fhandle, "modifier:".$tiddler['modifier']."\n");
		fwrite($fhandle, "\n".$tiddler['body']);
		fclose($fhandle);
	}
	
	public function addTiddler($data, $path=null) {
		if(is_file($path))
			$tiddler = $this->tiddlerFromFile($path);
		else 
			$tiddler = array();
		if(is_array($data)) 
			$tiddler = array_merge_recursive($data,$tiddler);
		$this->tiddlers[$tiddler['title']] = $tiddler;
 		$filePath = getcwd().'/plugins/'.$this->pluginName.'/files/importedPlugins/'.$tiddler['title'].'.tid';
		$this->createTidFile($filePath, $tiddler);
	}
}

$pluginsLoader = new PluginsLoaderReplace();
$pluginsLoader->includePlugins($cct_base);

?>