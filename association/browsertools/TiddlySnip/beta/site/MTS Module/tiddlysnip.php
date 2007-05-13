<?php

    function createTiddlerMap ($tiddlersDiv){
        $tiddlersMap =array();
        $regexp = "<div\s[^>]*tiddler=\"([^\"]*)\"[^>]*>(.*)<\/div>";
        if(preg_match_all("/$regexp/siU", $tiddlersDiv, $tiddlers, PREG_SET_ORDER))
        { 
            foreach($tiddlers as $tiddler) 
            { 
                # title: [tiddlerDivAsString,tiddlerText]
                $tiddlersMap[$tiddler[1]] = array($tiddler[0],$tiddler[2]);
            }
        }
        return $tiddlersMap;
    }
    
    function getTiddlersList ($map){
        return array_keys($map);
    }


    $source = file_get_contents ( "../../../".$_GET['file'] );

             // PARSE FILE //
    $parts = split("<div id=\"storeArea\">",$source);

    if (count($parts) == 2 && preg_match('/(.*)(\s*<\/div>\s*<!--POST-BODY-START-->.*)/s', $parts[1], $regs)) {
        $prestore = $parts[0]."<div id=\"storeArea\">";
        $store = $regs[1];
        $poststore = $regs[2];

        $storeTiddlerMap = createTiddlerMap($store);
        }

    else
        {
        //$serverResponse->throwError("The source file ($sourcename) was not found or is corruped.  Please open manually to fix.  Your save was redirected to $sourcename.err");
        exit();
        }


    $action = $_GET['action'];
    if ($action == 'index')
         $output = "var data = {tiddlerList:'".implode(",",getTiddlersList ($storeTiddlerMap))."',success:true,storeType:"."'2.1'"."};";
       //write a function getStoreType($storeTiddlerMap)


    elseif ($action == 'fetch'){
        $title == $_GET['title'];
        $output = getTiddler($title);
        }

    echo $output;


?>