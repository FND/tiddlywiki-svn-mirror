<?php
global $Plugins;
$Plugins = array();
class Plugin {
      private $phpEvents;
      public $tiddlers;
	      
	public $count; 
	
      public function __construct($author, $version, $website) {
      		global $Plugins;
          $this->author = $author;
          $this->version = $version;
          $this->website = $website;
          $this->phpEvents = array();
		  $this->tiddlers = array();
		  array_push($Plugins,$this);
      }

	public function addTiddler($tiddler, $data=null) {
			if(is_file($tiddler))
			{
				$tiddler = $this->tiddlerFromFile($tiddler);
			}
				if($data)
	$tiddler = array_merge_recursive($tiddler, $data);
	$this->tiddlers[$tiddler['title']] = $tiddler;

//	echo $tiddler['title'];
 	echo "<br />";
//	foreach($tiddler as $t)
//	$this->tiddlers[$t['title']] = $tiddler[$t['title']];
//	//	print_r($pluginsLoader);
	//	$this->addTiddler($tiddler);	
		/*
		echo"ffff";
		if(is_file($tiddler))
		{
			$tiddler = $this->tiddlerFromFile($tiddler);
		}
			if($data)
				$tiddler = array_merge_recursive($tiddler, $data);
			$tiddler_named_array[$tiddler['title']] = $tiddler;
			
			print_r($tiddler_named_array);
			$this->addTiddler($tiddler_named_array);
			print_r($this->tiddlers);
	*/
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
		if ( !isset($this->phpEvents[$eventname]))
			$this->phpEvents[$eventname] = array();
		array_push($this->phpEvents[$eventname], $fileInclude); 
      }
     
	public function run() {
		// DO INIT SCRIPTS, JSs and MACROS // 
		global $pluginsLoader;  
		foreach ($this->phpEvents as $eventnames=>$eventArray) {
			//print_r($eventnames);
		foreach ($eventArray as $event)
			$pluginsLoader->addEvent($eventnames,$event);
		}
		foreach ($this->tiddlers as $tiddler) {
			echo "LOOP";
			$pluginsLoader->addTiddler($tiddler);
		}
	}   
}


?>