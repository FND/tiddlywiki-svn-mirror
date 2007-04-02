<?php

/*/////////////////////////////////////////////////////////////////////////////

    MiniTiddlyServer: A mini-server for TiddlyWikis
    Copyright (C) 2007  Sean Clark Hess and Saq Imtiaz
    
    MiniTiddlyServer is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

////////////////////////////////////////////////////////////////////////////////*/

// DEFINED BY ModuleEvent.php: $userControl, $serverInfo, $clientRequest, $serverResponse, // 
// ALSO FUNCTIONS in SystemFunctions.php: writeToFile // 

// CREATE INSTANCES // 
    
    if ( $userControl->isAdmin != true ) {
        $serverResponse->throwCriticalError("You must be logged in as the admin to access this function");
    }
    
// SET VARS // 
    $newWrapper = $clientRequest->newWrapper;
    $newSource = $clientRequest->newSource;
    $dirShift = $serverInfo->BaseInstallOffset;
    $templatename = $serverInfo->TemplatesDirectory.$clientRequest->template;       
    
    $wikiframe = $serverInfo->WikiFrameFile;
    
    $wrapperpath = $dirShift.$newWrapper;
    $sourcepath = $dirShift.$newSource;
    
    if ($templatename == $serverInfo->TemplatesDirectory) 
        $serverResponse->throwError("The template name was lost in the request");
    
    else if (!file_exists($templatename))
        $serverResponse->throwError("The template of the name '$templatename' does not exit");
        
    else if (strpos($templatename, ".htm") == false)
        $serverResponse->throwError("The template of the name '$templatename' is not an html file");

    else if (file_exists($wrapperpath))
        $serverResponse->throwError("A wrapper file of the name '$newWrapper' already exists");
        
    else if (file_exists($sourcepath))
        $serverResponse->throwError("A wrapper file of the name '$newSource' already exists");
        
    else {
        // COPY TEMPLATE // Copy the template wiki
            if ( !copy($templatename, $sourcepath))
                $serverResponse->throwError("Could not copy '$templatename' to '$sourcepath'");

        // CREATE WRAPPER // Open the wikiframe, put in the new filename and go.
            $output = file_get_contents($wikiframe);
            $output = preg_replace ( '/"WIKIPATH"/i',"\"$newSource\"",$output);
            writeToFile($wrapperpath, $output);
    }

