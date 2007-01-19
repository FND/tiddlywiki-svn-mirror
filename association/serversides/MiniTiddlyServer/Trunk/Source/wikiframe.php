<?php session_start(); ?>
<?php

// PHP SOURCE // This file is copied as the php source for each file. 

// Insert Actual Wiki // 

    // Open Source File // 
    $wikipath = "WIKIPATH";
    
    if (!$handle = fopen($wikipath, 'r')) 
        $data .= "error:true, message:'Cannot open file ($wikipath)',";
           
    if (!$wikidata = fread($handle, filesize($wikipath))) 
        $data .= "error:true, message:'Cannot read file ($wikipath)',";
        
    fclose($handle);
    
    // Escape <-? sequences // 
    $wikidata = preg_replace ( '/\<\?\)/i','<?php echo "<?"; ?>)',$wikidata);
    
    echo $wikidata;


// FOOTER // 
include_once("Source/Footer.php"); 

?>