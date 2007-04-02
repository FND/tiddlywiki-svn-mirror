<?php session_start();
/* /////////////////////////////////////////////////////////////////////////////

    MiniTiddlyServer: A mini-server for TiddlyWikis
    Copyright (C) 2007  Sean Clark Hess and Saq Imtiaz
    
    MiniTiddlyServer is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

//////////////////////////////////////////////////////////////////////////////// */


    class Module {
        public $isActive = true;
        public $version;
        public $author;
        public $website;
        public $name;
        
        private $javascripts;
        private $htmlMacros;
        private $phpscripts;
        private $savescripts;
        private $loginscripts;
        private $customevents;
        
        public function __construct($author, $version, $website) {
        
            $this->author = $author;
            $this->version = $version;
            $this->website = $website;
        
            $this->javascripts = array();
            $this->htmlMacros = array();
            $this->phpscripts = array();
            $this->savescripts = array();
            $this->loginscripts = array();
            $this->customevents = array();
        }
        
        // Specified relative to the module folder, these javascripts will be directly included at the end of the whole wiki // 
        public function addScript($script) {
            array_push($this->javascripts, $script);
        }
        
        // This creates a reusable macro.  If you pass in "henry", "henry.html", you can throw the contents of henry.html anywhere by typeing <<henry>> into a tiddler
        // Again, the sources are specified relative to the Module folder // 
        public function addHTMLMacro($name, $source) {
            $this->htmlMacros[$name] = $source;
        }
        
        // These PHP scripts will run immediately if the module is active //
        // Again, these sources are specified relative to the Module folder // 
        public function addInitPHP($phpscript) {
            array_push($this->phpscripts, $phpscript);
        }
        
        public function addSavePHP($phpscript) {
            array_push($this->savescripts, $phpscript);
        }
        
        public function addLoginPHP($script) {
            array_push($this->loginscripts, $script);
        }
        
        public function addEventPHP($eventname, $eventscript) {
            if ( !isset($this->customevents[$eventname]))
                $this->customevents[$eventname] = array();
                
            array_push($this->customevents[$eventname], $eventscript);
        }
        
        public function runSave() {
            foreach ($this->savescripts as $script)
                includeInitPHP($script, $this);
        }
        
        public function runLogin() {
            foreach ($this->loginscripts as $script)
                includeInitPHP($script, $this);
        }
        
        public function runEvent($eventname) {
            if (isset($this->customevents[$eventname]))
                foreach ($this->customevents[$eventname] as $script)
                    includeEventPHP($script, $this);
        }
        
        public function run() {
            // DO EVERYTHING! // 
            
            foreach ($this->javascripts as $script)
                includeScript($script, $this);
                
            foreach ($this->htmlMacros as $macroname => $macro) {
                includeHTMLMacro($macroname, $macro, $this);
            }
                
            foreach ($this->phpscripts as $script) {
                includeInitPHP($script, $this);
            }
        }
        
    }

    class ModuleManager {
    
        public $modulesDirectory = "MTS/Modules";
        public $moduleCoreName = "index.php";
        public $deactivateFileName = "deactivate";
        
        public $modules;
    
        public function __construct($modulesDirectory) {
            $this->modules = array();
            $this->modulesDirectory = $modulesDirectory;
            $this->importModules();
        }
        
        public function addModule($module) {
            $this->modules[$module->name] = $module;
        }
        
        public function runModules() {
            foreach ($this->modules as $module)
                if ($module->isActive)
                    $module->run();
        }
        
        public function runSave() {
             foreach ($this->modules as $module)
                if ($module->isActive)
                    $module->runSave();
        }
        
        public function runLogin() {
             foreach ($this->modules as $module)
                if ($module->isActive)
                    $module->runLogin();
        }
        
        public function runEvent($eventname) {
             foreach ($this->modules as $module)
                if ($module->isActive)
                    $module->runEvent($eventname);
        }
        
        private function importModules() {
        
            if ($handle = opendir($this->modulesDirectory)) {
    
                while (false !== ($folder = readdir($handle))) {
                
                    if ( $folder != "." && $folder != ".." ) {
                        $name = $folder;
                        $folder = $this->modulesDirectory.$folder;
                
                        if (is_dir($folder) ) {
                            $corefile = $folder."/".$this->moduleCoreName;
                            
                            if (file_exists($corefile)) {
                                include_once($corefile);
                                
                                if ( isset($module) ) {
                                    $module->name = $name;
                                    $module->isActive = (file_exists($folder."/".$this->deactivateFileName) != 1);
                                    $this->addModule($module);
                                }
                            }
                            else
                                showError("ModuleError: The core file doesn't exist ~ $corefile");
                        }
                    }
                }

                closedir($handle);
            }
        }
       
    }
    
    
// FUNCTIONS // 
function includeScript($scriptPath, $module) {
    global $moduleManager;
    
    $moduleName = $module->name;
    $file = $moduleManager->modulesDirectory."/$moduleName/$scriptPath" ;
    echo "<script language='javascript' type='text/javascript' src='$file'></script>";
}

function includeHTMLMacro($macroname, $htmlPath, $module) {
    global $moduleManager, $wikipath;
    
    $moduleName = $module->name;
    echo "<div style='display:none' id='$macroname'>";
    include($moduleManager->modulesDirectory."/$moduleName/$htmlPath");
    echo "</div>\n";
    
    
    ?>
    <script>
        config.macros.<?php echo $macroname?> = {
            list:[]
        }
        
        config.macros.<?php echo $macroname?>.refresh = function () {
            for (var i in config.macros.<?php echo $macroname?>.list)
                config.macros.<?php echo $macroname?>.list[i] = document.getElementById("<?php echo $macroname?>").innerHTML;
        }
        
        config.macros.<?php echo $macroname?>.handler = function (place, macroName, params) {
            var container = createTiddlyElement(place,'div');
            config.macros.<?php echo $macroname?>.setValue(container);
        }
        
        config.macros.<?php echo $macroname?>.setValue = function (container) {
            container.innerHTML = document.getElementById("<?php echo $macroname?>").innerHTML;
        }
    </script>
    <?php
}

function includeInitPHP($script, $module) {
    global $moduleManager, $serverInfo, $userControl, $serverResponse, $clientRequest, $savingMachine, $sessionManager, $wikipath;
    
    $moduleName = $module->name;
    $file = $moduleManager->modulesDirectory."/$moduleName/$script" ;
    include_once($file);
}

function includeEventPHP($script, $module) {
    global $moduleManager,$serverInfo, $userControl, $serverResponse, $clientRequest, $savingMachine, $sessionManager, $wikipath;
    
    include_once($moduleManager->modulesDirectory."/".$module->name."/$script");
}


// Must Execute outside of script tags, of course // 
function showError($message) {
    print "<script>alert(\"$message\");</script>";
}

?>