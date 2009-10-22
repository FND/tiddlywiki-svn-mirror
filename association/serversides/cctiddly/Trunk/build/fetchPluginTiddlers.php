<?php
$cct_base = '../';
$tiddlyCfg['plugins_disabled'] =  array();
echo 'fetching tidlers..';


include_once('../includes/pluginsLoaderClass.php');
	
	
	


global $pluginsLoader1;
$pluginsLoader1 = new PluginsLoader();
$a = $pluginsLoader1->readPlugins($cct_base);



class PluginFetcher extends Plugin
  {

	public function run() {
		global $pluginsLoader;  
		foreach ($this->phpEvents as $eventnames=>$eventArray) {
			foreach ($eventArray as $event)
				$pluginsLoader->addEvent($eventnames,$event);
		}
		foreach ($this->tiddlers as $tiddler) {
			$pluginsLoader->addTiddler($tiddler);
		}
	}
  }




foreach($a as $b){
		$pluginIndex = file_get_contents($b);
		$pluginLines = explode('\n', $pluginIndex);
		foreach($pluginLines as $pluginLine){
			if(stristr($pluginLine, 'addRecipe'))
			{
				$code = str_replace('?>', '', $pluginLine);
				echo '<br /><b>'.$code.'</b><br/>';
//				eval($code);
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