<?php
global $Plugins;
global $tiddlyCfg;
$Plugins = array();
	
	// takes a path to a .tid file and returns a tiddler object.
	function tiddler_parse_tid_file($file)
	{
		$tiddly_body = file_get_contents($file);		
		$position = strpos($tiddly_body, "\n\n");
		$top = substr($tiddly_body, 0, $position);
	 	$file_slash_position = strrpos($file, "/");
		$tiddler['title'] = substr($file,$file_slash_position+1,-4);
		$tiddler['body'] = substr($tiddly_body, $position+1);
		$fields = explode("\n", $top);
		foreach($fields as $field)
		{
			$pairs = explode(":", $field);
			$tiddler[$pairs[0]] = trim($pairs[1]);
		}
		return $tiddler;
	}
	
class Plugin {
	public $phpEvents;
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
		if(is_array($data)) 
			$tiddler = array_merge_recursive($data,$tiddler);
		$this->tiddlers[$tiddler['title']] = $tiddler;
	}
	
	function tiddlerFromFile($file) {
		$tiddler['created'] = epochToTiddlyTime(mktime());
		$tiddler['modified'] = epochToTiddlyTime(mktime());
		$tiddler['modifier'] = "ccTiddly";
		$tiddler['creator'] = epochToTiddlyTime(mktime());
		$ext = substr($file, strrpos($file, '.') + 1);
		$tiddler['title'] = substr($file, strrpos($file, '/')+1, -strlen($ext)-1); 
		if($ext=='tiddler') {
			$tiddler['body'] = $this->getContentFromFile($file);	
			$tiddler['tags'] = "";
		} elseif($ext=='js') {
			$tiddler['body'] = file_get_contents($file);	
			$tiddler['tags'] = "systemConfig";
		} elseif($ext=='tid') {
			$tiddler = tiddler_parse_tid_file($file);
		}
		return $tiddler;
	}
	
	public function addTiddlersFolder($dir, $data=null) {
		if (is_dir($dir)) 
		{
		    if ($dh = opendir($dir)) 
			{
		    	while (($file = readdir($dh)) !== false) 
				{
				//		$this->addTiddlersFolder($file);
				if(is_dir($dir."/".$file)){
					if(substr($file, 0, 1)!=".")
						$this->addTiddlersFolder($dir."/".$file);
					}
					if(substr($file,0,1)!=".") 
					{ // do not include system/hidden files. 
						$tiddler = $this->tiddlerFromFile($dir."/".$file);
						if(is_array($data))
							$tiddler = array_merge($tiddler, $data); // allows users to add extra data.
						$this->addTiddler($tiddler);			
					}
				}
			}
		}
	}

	public function preparePath($path) {
		$path = trim($path);
//		$TW_ROOT = '/Applications/xampp/htdocs/tiddlywikicore/';
		$TW_ROOT = '/home/user/tiddlywikicore/';
		return str_replace('$TW_ROOT/', $TW_ROOT, $path);
		
	}
	public function getContentFromFile($path) {
		$path = $this->preparePath($path);	
		$fh = fopen($path, 'r');
		return $file = @fread($fh, @filesize($path)); 	
	}

	public function addRecipe($path) {
//		error_log('adding recipe : '.$path);
		$file = $this->getContentFromFile($path);
		$this->parseRecipe($file, dirname($path));	
	}

	public function parseRecipe($string, $recipePath) {
		$lines = explode("\n", $string);
		foreach($lines as $line) {
			error_log('line : '.$line);
			$this->parseRecipeLine($line, $recipePath);
		}
	}
	
	public function parseRecipeLine($line, $recipePath) {
		$ext = trim(end(explode(".", $line)));
		switch ($ext) {
			case 'recipe':
				$this->addRecipe(str_replace('recipe: ', '', $line));
			break;
			case 'js' :
				$tiddler['title'] = substr(basename(str_replace('tiddler: ', '', $line)), 0, -strlen($ext)-1);
				$tiddler['tags'] = 'systemConfig';
				$tiddler['body'] = $this->getContentFromFile(str_replace('tiddler: ', '', $recipePath.'/'.$line));				$this->addTiddler($tiddler);		
			break;
			case 'tid' :
 $this->addTiddler($this->tiddlerFromFile($this->preparePath(str_replace('tiddler: ', '', $recipePath.'/'.$line))));
/*
				$tiddler['title'] = substr(basename(str_replace('tiddler: ', '', $line)), 0, -strlen($ext)-1);
				$tiddler['body'] = $this->getContentFromFile(str_replace('tiddler: ', '', $recipePath.'/'.$line));				$this->addTiddler($tiddler);		
*/
			break;
			default: 
		break;
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
