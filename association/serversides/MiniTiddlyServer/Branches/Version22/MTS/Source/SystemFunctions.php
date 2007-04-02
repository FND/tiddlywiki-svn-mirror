<?php

    function writeToFile($file, $str) {
    
        global $serverResponse;
        
        // Removed Lockdown // 
        
        if (!$handle = fopen($file, 'w+')) 
            $serverResponse->throwError("Cannot open file ($file)");
            
        if (fwrite($handle, $str) === FALSE)
            $serverResponse->throwError("Cannot write to file ($file)");

        else
            $serverResponse->setBoolean("saved",true);
              
        fclose($handle);
    }
    
    function findAndReplaceInside($source, $start, $end, $content, $last=false) {
    
        global $serverResponse;
        
        $startpos = strpos ( $source, $start );
        
        if ($last) {
            $endpos = strrpos( $source, $end ); 
        }
            
        else
            $endpos = strpos( $source, $end, $startpos); 
            
            
        if (!$startpos || !$endpos && $start == "<title")
            return $source;
            
        if (!$startpos || !$endpos ) {
            $serverResponse->throwError("There was a critical saving error looking for ($start) and ($end).");
            return $source;
        }
        
            $startpos += strlen($start);
            return substr($source, 0, $startpos) . $content . substr($source, $endpos);
            
    }
    
    

?>