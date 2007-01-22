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
    
// PREFIX // Change this to change where the html files are saved.  TO save them to the root folder, set it to "" (nothing).  Or you can just put in a character, like "_".  Be sure to change Footer.php as well. 
    $htmlPrefix = "Data/";
    
// VERIFY LOGIN //
    function verifyLogin($luser, $lpass)
    {
        global $users;
        return ( $luser != "" && $lpass != "" && ($users[$luser] == $lpass ));
    }

    $action = $_GET['action'];
    $user = $_GET['user']; 
    $pass = $_GET['pass'];
    
    $wrapperScriptName = $_POST['wrapperScriptName'];
    $wrapperScriptPath = "../".$wrapperScriptName .".php";
    $sourcePath = "../".$_POST['sourcePath'];
    
    $filename = $wrapperScriptPath;
    $sourcename = $sourcePath;
    
    //~ $dobackup = ($_GET['backup'] == "true");
    $time = $_POST['time'];
    
// SAVING INFORMATION // 
    if ( $action == "login" ) {
        if (verifyLogin($user, $pass)) {
            $_SESSION['user'] = $user;
            $_SESSION['pass'] = $pass;
            $data .= "login:true,";
        }
        
        else {
            $data .= "login:false,";
        }
    }
    
    else if ( $action == "logout" ) {
        session_unset();
        session_destroy();
        $data .= "logout:true, checkuser:'".$_SESSION['user']."',";
    }
    
// ADMIN FUNCTIONS //  I probably don't need to open the file each time, but for now we'll keep it this way. 
    else if ( $action == "adduser" && $_SESSION['user'] == "admin") {
        $configstr = readFileToString($configfile);
        $configstr = preg_replace('/\)\;/i',"\t\"$user\" => \"$pass\",\n);",$configstr);
        writeToFile($configfile, $configstr);
        $data .= "adduser:true,";
    }
    
    else if ( $action == "removeuser" && $_SESSION['user'] == "admin") {
        $configstr = readFileToString($configfile);
        $configstr = preg_replace("/.*$user.*\n/i","",$configstr);
        
        writeToFile($configfile, $configstr);
        $data .= "removeuser:true,";
    }
    
    else if ( $action == "clearall" && $_SESSION['user'] == "admin") {
        $origstr = readFileToString($templatename);
        writeToFile($sourcename, $origstr);
    }
    
    else if ( $action == "moveadmin" && $_SESSION['user'] == "admin") {
        $side = $_POST['side'];
        $css = readFileToString("style.css");
        if ( $side == "left" )
            $css = preg_replace ( '/right:(\d*)px/i',"left:$1px",$css);
        else
            $css = preg_replace ( '/left:(\d*)px/i',"right:$1px",$css);
            
        writeToFile("style.css",$css);

    }
    
    else if ( $action == "listAllUsers" && $_SESSION['user'] == "admin") {
        $data .= "users:{";
        foreach ($users as $user => $pass) {
            if ($user != "" && isset($user) && $user != 0) 
                $data.= "$user:\"$pass\",";
        }
        $data .= "end:true},";
    }
    
    else if ( $action == "createwiki" && $_SESSION['user'] == "admin") {
        $newWrapper = $_POST["newWrapper"];
        $newSource = $_POST["newSource"];
        createNewWiki($newWrapper, $newSource, "../", $baseDir);
    }
    
    else if ( $action == "deletewiki" && $_SESSION['user'] == "admin") {
        $result = unlink ($wrapperScriptPath);
        $result2 = unlink ($sourcePath);
        if ( file_exists("../$wrapperScriptName.xml"))
            unlink ("../$wrapperScriptName.xml");
        $result = ($result && $result2);
        $data .= "delete:$result,";
    }


// FILE SAVING //
    if ( $action == "save" ) {
        if ( !isset($_SESSION['user']) ) 
            $data .= "error:true, message:'The username was invalid',";
        
        else if ( !isset($filename) )
            $data .= "error:true, message:'The filename was undefined',";
            
        else
        {
            $conflict = false;

            // TO BE ADDED in V0-5 //
            //~ if ( $time != filemtime($sourcename) )
            //~ {
                //~ $conflictpath = "Conflicts/". $_POST['filename'] . ".html";
                //~ $data .= "conflict:true, path:'$conflictpath'";
                //~ $sourcename = "../$conflictpath";
                //~ $conflict = true;
            //~ }

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
            $filehandle = fopen ( $filename , "r" );
            $filesize = filesize ( $filename );
            $subject = fread ( $filehandle, $filesize );
            fclose ( $filehandle );
            
            // split source file into 3 parts, prestore, store and poststore
            if (preg_match('/\\A(.*<div id="storeArea">\\n?)(.*)(\\n?<\\/div>\\n?<!--POST-BODY-START-->.*)$/sm', $subject, $regs)) {
            	$prestore = $regs[1];
              $store = $regs[2];
              $poststore = $regs[3];
            } 
            
            /// to be done: avoid parsing if full save. Just use new store to make TW file and force update of all blocks
            // will require a 'fullsave' argument from POST
            
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

            if (!$handle = fopen($sourcename, 'w+'))
                $data .= "error:true, message:'Cannot open file ($sourcename)',";

            if (fwrite($handle, $newTW) === FALSE)
                $data .= "error:true, message:'Cannot write to file ($sourcename)',";

            else
                $data .= "saved:true,";

            fclose($handle);
                
            // RSS // 
            $rss = decodePost($_POST['rss']);
            if ( isset($rss) && $rss != "" && $conflict != true) {
                // ? // If I leave this out is it ok ??? 
                //~ $rss = preg_replace("/http:\/\/www.tiddlywiki.com\//i", "MYSITE", $rss);
                
                $rssfile = "../$wrapperScriptName.xml";
                writeToFile($rssfile, $rss);
                $data .= "rss:true,";
            }
        }
    
    }
    
// WRITE DATA // 
    // Remove trailing comma // 
        $data .= "nothing:true";

    echo $data . "};";
    echo $actions;
    
// FUNCTIONS // 
    function findAndReplaceInside($source, $start, $end, $content, $last=false) {

        $startpos = strpos ( $source, $start );
        
        if ($last) {
            $endpos = strrpos( $source, $end ); 
        }
            
        else
            $endpos = strpos( $source, $end, $startpos); 

        if (!$startpos || !$endpos )
            return "ERROR::: sTART ($start) OR END ($end) NOT FOUND ($startpos) ($endpos) (".($endpos-$startpos).") " . strpos($source, "</div>", $startpos);
        
            $startpos += strlen($start);
            return substr($source, 0, $startpos) . $content . substr($source, $endpos);
            
    }
    
    function decodePost($str) {
        //~ $str = stripslashes(rawurldecode($str));
        $str = rawurldecode($str);
        
        if ( strpos($str, "\\\\n") > 0 || strpos($str, "\\\"") > 0) {
            $str = stripslashes($str);
        }
            
        $str = preg_replace ( '/\&\#43;/i','+',$str);
        return $str;
    }
?>