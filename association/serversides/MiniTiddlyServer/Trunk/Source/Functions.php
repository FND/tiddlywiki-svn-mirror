<?php

/*

Common Functions .. These will allow us to not have to write so much duplicate code in System.php and config.php


*/
    function createNewWiki ($newWrapper, $newSource, $dirShift, $baseDir) {
        global $data, $templatename, $wikiframe;
        
        $wrapperpath = $dirShift.$newWrapper;
        $sourcepath = $dirShift.$newSource;
    
        if (file_exists($wrapperpath))
            $data .= "error:true, message:\"A wrapper file of the name '$newWrapper' already exists\",";
            
        else if (file_exists($sourcepath))
            $data .= "error:true, message:\"A source file of the name '$newSource' already exists\",";
            
        else {
        
            // COPY TEMPLATE // Copy the template wiki
                $source = readFileToString($templatename);
                $source = preg_replace ( '/SiteUrl: ".*"/i',"SiteUrl: \"$baseDir$newWrapper\"",$source);
                writeToFile($sourcepath, $source);
            
            // CREATE WRAPPER // Open the wikiframe, put in the new filename and go.
                $output = readFileToString($wikiframe);
                $output = preg_replace ( '/"WIKIPATH"/i',"\"$newSource\"",$output);
                writeToFile($wrapperpath, $output);
        }

    }


    function writeToFile($file, $str) {
    
        global $data, $lockdown;
        
        if ($lockdown == true)
            return false;
        
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