<?php
global $Plugins;
$Plugins = array();
class Plugin {
	private $phpEvents;
	public $tiddlers;
	
	public function __construct($author, $version, $website) {
		global $Plugins;
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
			
			

		if(is_array($data)) {


			$tiddler = array_merge_recursive($data,$tiddler);
		}
		
		
		$this->tiddlers[$tiddler['title']] = $tiddler;
	}
	
	public function tiddlerFromFile($file)
	{
		$tiddler['created'] = epochToTiddlyTime(mktime());
		$tiddler['modified'] = epochToTiddlyTime(mktime());
		$tiddler['modifier'] = "ccTiddly";
		$tiddler['creator'] = epochToTiddlyTime(mktime());
		$ext = substr($file, strrpos($file, '.') + 1);
		$tiddler['title'] = substr($file, strrpos($file, '/')+1, -strlen($ext)-1); 
		$tiddler['body'] = file_get_contents($dir."/".$file);
		if($ext=='tiddler')
			$tiddler['tags'] = "";
		elseif($ext=='js') 
			$tiddler['tags'] = "systemConfig";
		return $tiddler;
	}
	
	public function addTiddlersFolder($dir) 
	{
		if (is_dir($dir)) 
		{
		    if ($dh = opendir($dir)) 
			{
		       while (($file = readdir($dh)) !== false) 
				{
					if(substr($file,0,1)!=".") 
					{ // do not include system/hidden files. 
						$tiddler = $this->tiddlerFromFile($dir."/".$file);
						$this->addTiddler($tiddler);			
					}
				}
			}
		}
	}
      
	public function addEvent($eventname, $fileInclude) {
		if (!isset($this->phpEvents[$eventname]))
			$this->phpEvents[$eventname] = array();
		array_push($this->phpEvents[$eventname], $fileInclude); 
	}
     
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


?>