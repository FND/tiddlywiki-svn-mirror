<?php
    session_start(); 
    
    include_once("Functions.php");
    
    $data = "var data = {";
    $actions = "";

// INIT // 
    $baseDir = substr($_SERVER['SCRIPT_URI'], 0, strpos($_SERVER['SCRIPT_URI'],"Source/System.php"));
    $configfile = "users.php";
    include_once($configfile);
    
    $templatename = "empty.html";
    $wikiframe = "wikiframe.php";
    
// BACKUPS // 
    $backupDir = "../Backups/";
    
// VERIFY LOGIN //
    function verifyLogin($luser, $lpass)
    {
        global $users;
        return ( $luser != "" && $lpass != "" && ($users[$luser] == $lpass ));
    }
    
    function verifyAdmin($luser, $lpass) {
        global $users;
        return ($users["admin"] == $lpass && $users[$luser] == $lpass);
    }

    $action = $_GET['action'];
    $user = $_GET['get_user']; 
    $pass = $_GET['get_pass'];
    
    $wrapperScriptName = $_POST['wrapperScriptName'];
    $wrapperScriptPath = "../".$wrapperScriptName .".php";
    $sourcePath = "../".$_POST['sourcePath'];
    
    $filename = $wrapperScriptPath;
    $sourcename = $sourcePath;
    
    $dobackup = ($_GET['backup'] == "true");
    $time = $_POST['time'];
    
    
// SAVING INFORMATION // 
    if ( $action == "login" ) {
        if (verifyLogin($user, $pass)) {
            $_SESSION['mts_saved_username'] = $user;
            $_SESSION['mts_saved_password'] = $pass;
            $data .= "login:true,";
        }
        
        else {
            $data .= "login:false,";
        }
    }
    
    else if ( $action == "logout" ) {
        session_unset();
        session_destroy();
        $data .= "logout:true, checkuser:'".$_SESSION['mts_saved_username']."',";
    }

// ADMIN FUNCTIONS //  I probably don't need to open the file each time, but for now we'll keep it this way. 
    else if ( $action != "save") { // Must be an admin function 
    
        if ( !verifyAdmin($_SESSION['mts_saved_username'], $_SESSION['mts_saved_password']) ) 
            $data .= "error:true, message:'Admin user information lost or incorrect. Check cookie settings.',";
    
        else {
        
            if ( $action == "adduser") {
                $configstr = file_get_contents($configfile);
                $configstr = preg_replace('/\)\;/i',"\t\"$user\" => \"$pass\",\n);",$configstr);
                writeToFile($configfile, $configstr);
                $data .= "adduser:true,";
            }
            
            else if ( $action == "removeuser") {
                $configstr = file_get_contents($configfile);
                $configstr = preg_replace("/.*$user.*\n/i","",$configstr);
                
                writeToFile($configfile, $configstr);
                $data .= "removeuser:true,";
            }
            
            else if ( $action == "clearall") {
                $origstr = file_get_contents($templatename);
                writeToFile($sourcename, $origstr);
            }
            
            else if ( $action == "moveadmin") {
                $side = $_POST['side'];
                $css = file_get_contents("style.css");
                if ( $side == "left" )
                    $css = preg_replace ( '/right:(\d*)px/i',"left:$1px",$css);
                else
                    $css = preg_replace ( '/left:(\d*)px/i',"right:$1px",$css);
                    
                writeToFile("style.css",$css);
        
            }
            
            else if ( $action == "listAllUsers") {
                $data .= "users:{";
                foreach ($users as $user => $pass) {
                    if ($user != "" && isset($user) && $user != 0) 
                        $data.= "$user:\"$pass\",";
                }
                $data .= "end:true},";
            }
            
            else if ( $action == "createwiki") {
                $newWrapper = $_POST["newWrapper"];
                $newSource = $_POST["newSource"];
                createNewWiki($newWrapper, $newSource, "../", $baseDir);
            }
            
            else if ( $action == "deletewiki") {
                $result = unlink ($wrapperScriptPath);
                $result2 = unlink ($sourcePath);
                if ( file_exists("../$wrapperScriptName.xml"))
                    unlink ("../$wrapperScriptName.xml");
                $result = ($result && $result2);
                $data .= "delete:$result,";
            }
            
            else if ( $action == "manualbackup") {
                createBackup($_POST['sourcePath'], date('dMy_Gi')."_manual.html");
            }
            
            else if ( $action == "revert" ) {
                $file = $_POST['revertfile'];
                $sourceName = substr($_POST['sourcePath'], 0, strpos($_POST['sourcePath'], ".htm"));
            
                if ( copy($backupDir.$sourceName."/".$file, $sourcePath) )
                    $data .= "reverted:true,";
                else
                    $data .= "reverted:false,message:'The file was not copied succesfully ($backupDir$file) ($sourcePath)',";
            }
            
            else {
                $data .= "error:true, message:'The action was not properly defined',";
            }
        }
    } // end admin functions
    
    
// FILE SAVING //
    else if ( $action == "save" ) {      
        if (!verifyLogin($_SESSION['mts_saved_username'], $_SESSION['mts_saved_password'])) {
            $data .= "error:true, message:'The user information was incorrect or lost.  Please check cookie settings.',";
            $lockdown = true;
        }

        else if ( !isset($filename) ) {
            $data .= "error:true, message:'The filename was undefined',";
            $lockdown = true;
        }
            
        else
        {
            $conflict = false;
            $saveError = false;

            // TO BE ADDED in V0-8 //
            //~ if ( $time != filemtime($sourcename) )
            //~ {
                //~ $conflictpath = "Conflicts/". $_POST['filename'] . ".html";
                //~ $data .= "conflict:true, path:'$conflictpath'";
                //~ $sourcename = "../$conflictpath";
                //~ $conflict = true;
            //~ }
            
            // BACKUP // 
            if ($dobackup)
                createBackup($_POST['sourcePath'],$_SESSION['mts_saved_username']."_auto.html");

            function updateBlock($block){
                global $newTW;
                global $markupBlockData;
                if ($block == 'SiteTitle' || $block == 'SiteSubtitle')
                    {
                    $text = getBlockText('SiteTitle').' - '.getBlockText('SiteSubtitle');
                    $last = false;
                    }
                else
                    {
                    $text =getBlockText($block);
                    $last = true;
                    }          
                $newTW = findAndReplaceInside($newTW, $markupBlockData[$block][0],  $markupBlockData[$block][1], $text,$last);
            }
    
            function getBlockText($block){
               global $newStoreMap;
               global $markupBlockData;
                if (isset($newStoreMap[$block]))
                   $text = $newStoreMap[$block][1];
                else
                   $text = $markupBlockData[$block][2];
                return $text;
            }
            
            function createTiddlerMap ($tiddlersDiv){
                $tiddlersMap =array();
                $regexp = "<div\s[^>]*tiddler=\"([^\"]*)\"[^>]*>(.*)<\/div>";
                if(preg_match_all("/$regexp/siU", $tiddlersDiv, $tiddlers, PREG_SET_ORDER))
                    { foreach($tiddlers as $tiddler) 
                        { 
                                       # title: [tiddlerDivAsString,tiddlerText]
                          $tiddlersMap[$tiddler[1]] = array($tiddler[0],$tiddler[2]);
                        }
                    }
                return $tiddlersMap;
            };
    
            $markupBlockData = array(
                    'SiteTitle'           =>  array("<title>","</title>","My TiddlyWiki"),
                    'SiteSubtitle'       => array("<title>","</title>","a reusable non-linear personal web notebook"),
                    'MarkupPreHead'  => array("\n<!--PRE-HEAD-START-->\n","\n<!--PRE-HEAD-END-->\n","<!--{{{-->\n<link rel='alternate' type='application/rss+xml' title='RSS' href='index.xml'/>\n<!--}}}-->"),
                    'MarkupPostHead' => array("\n<!--POST-HEAD-START-->\n","\n<!--POST-HEAD-END-->\n",""),
                    'MarkupPreBody'   => array("\n<!--PRE-BODY-START-->\n","\n<!--PRE-BODY-END-->\n",""),
                    'MarkupPostBody'  => array("\n<!--POST-BODY-START-->\n","\n<!--POST-BODY-END-->\n","")
                    );
    
            //read source file
            $filename = $sourcename;
            $subject = file_get_contents ( $filename );
            
            // split source file into 3 parts, prestore, store and poststore
            if (preg_match('/(.*<div id="storeArea">\s*)(.*)(\s*<\/div>\s*<!--POST-BODY-START-->.*)$/sm', $subject, $regs)) {
                $prestore = $regs[1];
                $store = $regs[2];
                $poststore = $regs[3];
            } 
            else {
                $saveError = true;
                $data .= "error:true, message:'The source file ($sourcename) was not found or is corruped.  Please open manually to fix.  Your save was redirected to $sourcename.err',";
            }

            $updatesDiv = decodePost($_POST['data']);

            $savetype = decodePost($_POST['savetype']);
            
            if ($savetype == 'partial')
                {
                // create tiddlerMap for updates
                $updatesMap = createTiddlerMap($updatesDiv);
                $updatesIndex = array_keys($updatesMap);

                $deletedIndex = explode("|||||",decodePost($_POST['deletedTiddlers']));
                
                // create tiddlerMap from original store
                $storeTiddlerMap= createTiddlerMap($store);
                
                // delete tiddlers from store 
                foreach($deletedIndex as $deleted)
                     {
                      unset($storeTiddlerMap[$deleted]);
                      }

                // add updates to storeTiddlerMap
                $newStoreMap = array_merge($storeTiddlerMap,$updatesMap);
                
                ksort($newStoreMap);
                
                //create new storeDiv
                $newstore = '';
                foreach($newStoreMap as $t)
                    {
                     $newstore .= $t[0]."\n";   
                     }
                }
            else 
                $newstore = $updatesDiv;
                 
            $newTW = $prestore.$newstore.$poststore;
            
            $markupBlocks = array_keys($markupBlockData);
            if ($savetype=='partial')
                {
                $changedtiddlers = array_merge($updatesIndex, $deletedIndex);

                foreach($markupBlocks as $block)
                    {
                    if (in_array($block, $changedtiddlers))
                        #echo $block;
                        updateBlock($block);
                    }
                }
            else
                {
                foreach($markupBlocks as $block)
                    updateBlock($block);
                }

          //force autosave to minimize collisions?
          
            // CHECK FOR ERRORS //
            if ($saveError == true)
                $sourcename = $sourcename.".err";

            writeToFile($sourcename, $newTW);
                
            // RSS // 
            $rss = decodePost($_POST['rss']);
            if ( isset($rss) && $rss != "" && $conflict != true) {
                $rssfile = "../$wrapperScriptName.xml";
                writeToFile($rssfile, $rss);
                $data .= "rss:true,";
            }
        }
    
    }
    
    else {
        $data .= "error:true, message:'The action was not properly defined',";
    }
    
// WRITE DATA // 
    // Remove trailing comma // 
        $data .= "nothing:true";

    echo $data . "};";
    echo $actions;
    
// FUNCTIONS // 
    function findAndReplaceInside($source, $start, $end, $content, $last=false) {
        global $data, $saveError, $sourcename;
        $startpos = strpos ( $source, $start );
        
        if ($last) {
            $endpos = strrpos( $source, $end ); 
        }
            
        else
            $endpos = strpos( $source, $end, $startpos); 

        if (!$startpos || !$endpos ) {
            $data .= "error:true, message:'There was a critical saving error looking for (".htmlspecialchars ($start).") and (".htmlspecialchars ($end).").. A file named $sourcename.err has been created. Please post this message as a bug and email the file to the developers',";
            $saveError = true;
            return $source;
        }
        
            $startpos += strlen($start);
            return substr($source, 0, $startpos) . $content . substr($source, $endpos);
            
    }
    
    function decodePost($str) {
        $str = rawurldecode($str);
        
        if ( strpos($str, "\\\\n") > 0 || strpos($str, "\\\"") > 0) {
            $str = stripslashes($str);
        }
            
        $str = preg_replace ( '/\&\#43;/i','+',$str);
        return $str;
    }
    
    function createBackup($source,$backupName="noname.html") {
        global $backupDir,$data;
        
        $sourceName = substr($_POST['sourcePath'], 0, strpos($_POST['sourcePath'], ".htm"));
        
        $myBackupDir = $backupDir."/".$sourceName ."/";
        $backupPath = $myBackupDir.$backupName;
        
        $sourcefull = "../".$source;
        
        if (is_dir($backupDir) === FALSE) {
            if( mkdir($backupDir, 0755) === false ) {
                $data .= "backup:false,error:true,message:'Could not create directory ($backupDir)',";
                return;
            }
        }
        
        if (is_dir($myBackupDir) === FALSE) {
            if( mkdir($backupDir, 0755) === false ) {
                $data .= "backup:false,error:true,message:'Could not create directory ($myBackupDir)',";
                return;
            }
        }
        
        if ( copy($sourcefull, $backupPath))
            $data .= "backup:'$backupName',";
        else
            $data .= "backup:false,error:true,message:'Copy failed on backup : ($myBackupDir) ($source) ($backupName),";
            

    }
?>
