<?php 
    session_start(); 
    
    $data = "var data = {";
    $actions = "";
    
// INIT // 
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
        $config = file($configfile);
        $configstr = join("", $config);
        $configstr = preg_replace('/\)\;/i',"\t\"$user\" => \"$pass\",\n);",$configstr);
        writeToFile($configfile, $configstr);
        $data .= "adduser:true,";
    }
    
    else if ( $action == "removeuser" && $_SESSION['user'] == "admin") {
        $config = file($configfile);
        $configstr = join("", $config);
        $configstr = preg_replace("/.*$user.*\n/i","",$configstr);
        
        writeToFile($configfile, $configstr);
        $data .= "removeuser:true,";
    }
    
    else if ( $action == "clearall" && $_SESSION['user'] == "admin") {
        $orig = file($templatename);
        $origstr = join("", $orig);
        writeToFile($sourcename, $origstr);
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
        $sourcepath = "../".$newSource;
        $wrapperpath = "../".$newWrapper;
        
        if (file_exists($wrapperpath))
            $data .= "error:true, message:\"A wrapper file of the name '$newWrapper' already exists\",";
            
        else if (file_exists($sourcepath))
            $data .= "error:true, message:\"A source file of the name '$newSource' already exists\",";
            
        else {
            // 2 // Create a new wiki of that name.. 
        
            // a // Copy the template wiki
            if (!copy($templatename, $sourcepath)) {
               echo "failed to copy $file...\n";
               exit;
            }
            
            // IMPORT ORIG WIKI // Open the wikiframe, put in the new filename and go.
            
            if (!$handle = fopen($wikiframe, 'r')) 
                echo "error:true, message:'Cannot open file ($wikiframe)',";
                   
            if (!$output = fread($handle, filesize($wikiframe))) 
                echo "error:true, message:'Cannot read file ($wikiframe)',";

            fclose($handle);
            
            $output = preg_replace ( '/"WIKIPATH"/i',"\"$newSource\"",$output);
            
            writeToFile($wrapperpath, $output);
        }
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
        
            // Open Source File // 
            $ofile = $templatename;
            
            if (!$handle = fopen($ofile, 'r')) 
                $data .= "error:true, message:'Cannot open file ($ofile)',";
                   
            if (!$origfile = fread($handle, filesize($ofile))) 
                $data .= "error:true, message:'Cannot read file ($ofile)',";

            fclose($handle);
        
            // GET Params // implode("/", $parts), stripslashes()
            
            if ($skipSections != true ) {
                $startTitle = decodePost($_POST['startTitle']);
                $endTitle = decodePost($_POST['endTitle']); 
                $titleData = decodePost($_POST['title']); 
                
                $startMain = decodePost($_POST['startSaveArea']); 
                $endMain = decodePost($_POST['endSaveArea']); 
                $mainData = decodePost($_POST['data']); 
                
                if ( !isset($startMain) || !isset($endMain) || !isset($mainData) ) {
                    echo "ERROR in main";
                    exit;
                }
                
                $startPreHead = decodePost($_POST['startPreHead']);
                $endPreHead = decodePost($_POST['endPreHead']);
                $preHeadData = decodePost($_POST['preHeadData']);
                
                $startPostHead = decodePost($_POST['startPostHead']);
                $endPostHead = decodePost($_POST['endPostHead']);
                $postHeadData = decodePost($_POST['postHeadData']);
                
                $startPreBody = decodePost($_POST['startPreBody']);
                $endPreBody = decodePost($_POST['endPreBody']);
                $preBodyData = decodePost($_POST['preBodyData']);
                
                $startPostBody = decodePost($_POST['startPostBody']);
                $endPostBody = decodePost($_POST['endPostBody']);
                $postBodyData = decodePost($_POST['postBodyData']);
                
                // Replace // 
                if ( isset($startTitle) && isset($endTitle) && isset($titleData) )
                    $origfile = findAndReplaceInside($origfile, $startTitle, $endTitle, $titleData);
                    
                $origfile = findAndReplaceInside($origfile, $startMain, $endMain, "\n$mainData\n", true);
                
                if ( isset($startPreHead) && isset($endPreHead) && isset($preHeadData) ) 
                    $origfile = findAndReplaceInside($origfile, $startPreHead, $endPreHead, "\n$preHeadData\n", true);

                if ( isset($startPostHead) && isset($endPostHead) && isset($postHeadData) ) 
                    $origfile = findAndReplaceInside($origfile, $startPostHead, $endPostHead, "\n$postHeadData\n", true);

                if ( isset($startPreBody) && isset($endPreBody) && isset($preBodyData) ) 
                    $origfile = findAndReplaceInside($origfile, $startPreBody, $endPreBody, "\n$preBodyData\n", true);

                if ( isset($startPostBody) && isset($endPostBody) && isset($postBodyData) ) 
                    $origfile = findAndReplaceInside($origfile, $startPostBody, $endPostBody, "\n$postBodyData\n", true);
            }

            // Save // 
            // SAVE THE FILE DATA // 
                if (!$handle = fopen($sourcename, 'w+')) 
                    $data .= "error:true, message:'Cannot open file ($sourcename)',";
            
                if (fwrite($handle, $origfile) === FALSE)
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
    
    function writeToFile($file, $str) {
        if (!$handle = fopen($file, 'w+')) 
            $data .= "error:true, message:'Cannot open file ($file)',";
            
        if (fwrite($handle, $str) === FALSE)
            $data .= "error:true, message:'Cannot write to file ($file)',";

        else
            $data .= "saved:true,";
              
        fclose($handle);
    }
?>
