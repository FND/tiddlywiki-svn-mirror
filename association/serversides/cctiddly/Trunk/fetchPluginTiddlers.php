<?php
$cct_base = '';
$tiddlyCfg['plugins_disabled'] =  array();
echo 'fetching tidlers..';


include_once('includes/functions.php');

include_once('includes/pluginsLoaderClass.php');


global $pluginsLoader1;
$pluginsLoader1 = new PluginsLoader();
$a = $pluginsLoader1->readPlugins($cct_base);



class PluginFetcher extends Plugin
  {
	public function addTiddler($data, $path=null) {
		if(is_file($path))
			$tiddler = $this->tiddlerFromFile($path);
		else 
			$tiddler = array();
		if(is_array($data)) 
			$tiddler = array_merge_recursive($data,$tiddler);
		$this->tiddlers[$tiddler['title']] = $tiddler;
		var_dump($tiddler);

	}

  }


$p = new PluginFetcher('ccTiddly', '0.1', 'simonmcmanus.com');

foreach($a as $b){
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