<?php
global $Plugins;
$Plugins = array();
class Plugin {
      private $plugins;
      private $phpEvents;
      public $tiddlers;
		public $js;
	  private $msgHandler;
	      
      public function __construct($author, $version, $website) {
      		global $Plugins;
          $this->author = $author;
          $this->version = $version;
          $this->website = $website;
          $this->plugins = array();
          $this->phpEvents = array();
		  $this->tiddlers = array();
		  $this->js = array();
		  $this->msgHandler = array();
		  array_push($Plugins,$this);
      }
    
 // Specified relative to the module folder, these javascripts will be directly included at the end of the whole wiki // 
	public function addPlugin($script) {
		array_push($this->plugins, $script);
	}
	public function addTiddler($tiddler, $data=null) {
		if(is_file($tiddler))
		{
			$tiddler = $this->tiddlerFromFile($tiddler);
			if($data)
			{
				$tiddler = array_merge_recursive($tiddler, $data);
			}
			
			$tiddler_named_array[$tiddler['title']] = $tiddler;
			$this->addTiddler($tiddler_named_array);
		}else{
			array_push($this->tiddlers, $tiddler);
		}
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
		foreach ($this->plugins as $plugin) {
              $pluginsLoader->addPlugin($plugin);
        }
          foreach ($this->phpEvents as $eventnames=>$eventArray) {
				//print_r($eventnames);
			foreach ($eventArray as $event)
              $pluginsLoader->addEvent($eventnames,$event);
         }
	   foreach ($this->tiddlers as $event) {
              $pluginsLoader->addTiddler($event);
       }
      }   
  }

?>