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
        
            // COPY TEMPLATE // Copy the template wiki and add site url tiddler
              if (preg_match('/(.*<div id="storeArea">\s*)(.*)(\s*<\/div>\s*<!--POST-BODY-START-->.*)$/sm', file_get_contents($templatename), $regs)) {
                 $prestore = $regs[1];
                 $store = $regs[2];
                 $poststore = $regs[3];
              }   
               $newTW = $prestore. $store . "\n<div tiddler=\"SiteUrl\" modifier=\"MTS\" modified=\"000000000000\" created=\"000000000000\" tags=\"\">$baseDir$newWrapper</div>\n".$poststore;
               writeToFile($sourcepath, $newTW);
            
            // CREATE WRAPPER // Open the wikiframe, put in the new filename and go.
                $output = file_get_contents($wikiframe);
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
?>