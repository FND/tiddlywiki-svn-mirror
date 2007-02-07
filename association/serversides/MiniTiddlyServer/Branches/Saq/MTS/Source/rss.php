<?php
  function splitRss ($source)
    {
     global $data, $saveError;
     if (preg_match('/^(.*<\/generator>)(.*)?(<\/channel>.*)/sm', $source, $regs))
       {
       return $regs;
       }
     else
       {
       $data .= "error:true, message:'There was a critical error in splitRss while saving your rss file'";
       $saveError = true;
       return false;
       }
    }

  function makeRssMap($source=' ')
    { 
       global $data, $saveError;
       $temprssMap = array();
       if (preg_match_all('/<item>(?:.*?(?:<title>(.*?)<\/title>).*?)<\/item>/s', $source, $items, PREG_SET_ORDER))
         {
          foreach ($items as $item)
              {
               $temprssMap[$item[1]] = $item[0];
              }
          return $temprssMap;
         }
       else
         {
          #$data .= "error:true, message:'There was a critical error in makeRssmap while saving your rss file' '$source'";
          #$saveError = true;
          //should throw an error here if the source was anything other than whitespace and the match still failed
          //when no items, the souce seems to be a line break
          return $temprssMap;
         }
    }
    
    
  function updateRss($newrss,$rssfilename,$deletedIndex,$savetype)
    {  
     #global $deletedIndex, $savetype;  
     global $data, $saveError;
     #$deletedIndex = array(); #for testing
     
     if ($savetype == 'partial' && file_exists($rssfilename))
         {
         #$oldrss = file_get_contents("index.xml"); #file name passed as an argument
         $oldrss = file_get_contents($rssfilename);
         $oldrssparts = splitRss($oldrss);
         $oldbody = $oldrssparts[2]; 
         $oldRssMap = makeRssMap ($oldbody); 
          
          
         #var_dump ($oldrssparts);
      
         #$newrss = file_get_contents("updates.xml"); #passed as an argument
         $newrssparts = splitRss($newrss);
         $newrssheader = $newrssparts[1];
         $newrssbody = $newrssparts[2];
         $newrssfooter = $newrssparts[3];
         $newRssMap = makeRssMap($newrssbody);
      
         #var_dump($newrssparts);
      
         $deletedrss = array_merge($deletedIndex,array_keys($newRssMap));
         
         #do I really need this now?
         if (! isset($oldRssMap) || $oldRssMap == false)
            $oldRssMap = array();
      
      //remove deleted tiddlers
         foreach($deletedrss as $deleted)
          {
            unset($oldRssMap[$deleted]);
          }
    
         $updatedrssbody = $newrssbody;
         foreach($oldRssMap as $t)
           {
            $updatedrssbody .= $t."\n";   
           }  
      
         $updatedrss = $newrssheader .$updatedrssbody .$newrssfooter;
        }
    else
        $updatedrss = $newrss;
        
     #echo $updatedrss;
     return $updatedrss;
   }
?>