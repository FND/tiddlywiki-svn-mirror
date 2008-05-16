<?php


global $Modules;
$Modules = array();
class Module {
      private $plugins;
      private $phpEvents;
      private $tiddlers;
	  private $msgHandler;
      
      public function __construct($author, $version, $website) {
      		global $Modules;
          $this->author = $author;
          $this->version = $version;
          $this->website = $website;
      
          $this->plugins = array();
          $this->phpEvents = array();
		  $this->tiddlers = array();
		  $this->msgHandler = array();
		  array_push($Modules,$this);
          /*$this->events = array();*/
      }
      
 
 // Specified relative to the module folder, these javascripts will be directly included at the end of the whole wiki // 
      public function addPlugin($script) {
	          array_push($this->plugins, $script);
      }

      public function addTiddler($tiddler) {
	          array_push($this->tiddlers, $tiddler);
      }
      
      public function addEvent($eventname, $fileInclude) {
		        //  array_push($this->phpEvents, $fileInclude);
   
      if ( !isset($this->phpEvents[$eventname]))
             $this->phpEvents[$eventname] = array();
		//	print_r('saq');
		//	print_r($this->phpEvents[$eventname]);
			array_push($this->phpEvents[$eventname], $fileInclude); 
		//	print_r($this->phpEvents);  
      }
      
      public function run() {
          // DO INIT SCRIPTS, JSs and MACROS // 
        global $modulesLoader;  
		foreach ($this->plugins as $plugin) {
              $modulesLoader->addPlugin($plugin);
        }
          foreach ($this->phpEvents as $event) {
              $modulesLoader->addEvent($event);
         }
	   foreach ($this->phpEvents as $event) {
              $modulesLoader->addTiddler($event);
       }
      }
      
  }

?>