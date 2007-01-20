<?php

/*

Common Functions .. These will allow us to not have to write so much duplicate code in System.php and config.php


*/
    function createNewWiki ($newWrapper, $newSource, $baseDir) {
        global $data, $templatename, $wikiframe;
        
        $wrapperpath = $baseDir.$newWrapper;
        $sourcepath = $baseDir.$newSource;
    
        if (file_exists($wrapperpath))
            $data .= "error:true, message:\"A wrapper file of the name '$newWrapper' already exists\",";
            
        else if (file_exists($sourcepath))
            $data .= "error:true, message:\"A source file of the name '$newSource' already exists\",";
            
        else {
            // 2 // Create a new wiki of that name.. 
        
            // a // Copy the template wiki
            if (!copy($templatename, $sourcepath)) {
               echo "failed to copy $templatename...\n";
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


    function writeToFile($file, $str) {
    
        global $data;
        
        if (!$handle = fopen($file, 'w+')) 
            $data .= "error:true, message:'Cannot open file ($file)',";
            
        if (fwrite($handle, $str) === FALSE)
            $data .= "error:true, message:'Cannot write to file ($file)',";

        else
            $data .= "saved:true,";
              
        fclose($handle);
    }
    
    function readFileToString($file) {
        $lines = file($file);
        return join("", $lines);
    }

?>