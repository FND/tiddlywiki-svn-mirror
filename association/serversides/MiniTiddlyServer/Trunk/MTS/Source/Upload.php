<?php session_start(); ?>
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

//////////////////////////////////////////////////////////////////////////////// */
    
    include_once("Functions.php");
    
    $basedir = "../../";
    
    $file = $_FILES['uploadfile'];
    $localfilename =  basename( $file['name']); 
    $tmpfilename = $file['tmp_name'];  
    $remotefilename = $_POST['sourcepath'];
    $wrapperpath = $_POST['wrapperpath'];
    
    /*
    // SECURITY // 
        // 1 // Check for .html extension in remotefilename  yay!
        // 2 // Check for "../" in remote file name... no parental folders allowed! yay!
        // 3 // Verify the data sent? yay!
        // 4 // 
    */
    
    if ( $file['type'] != "text/html" || strpos($localfilename, ".htm") === false ) {
        err("Error: source wasn't an html file :: ".$file['type']." :: $localfilename");
        exit;
    }
    
    if (!( strpos($remotefilename, "../") === false )) {
        err("Error: source specified a parent folder");
        exit;
    }
    
    if ( strpos($remotefilename, ".htm") === false ) {
        err("Error: remote file specified was not an html file");
        exit;
    }
    
    $subject = file_get_contents ( $tmpfilename );
    if (! preg_match('/(.*<div id="storeArea">\s*)(.*)(\s*<\/div>\s*<!--POST-BODY-START-->.*)$/sm', $subject, $regs)) {
        err("Error: remote file specified was not a valid TiddlyWiki file");
        exit;
    }
    
    $remotefilename = $basedir.$remotefilename;
    
    if (!copy($tmpfilename, $remotefilename)) {
        err( "There was an error uploading the file, please try again!");
    }
    else
    {
        echo "<script>window.location = '$basedir$wrapperpath'</script>";
    
    }
    
    function err($msg) {
        echo $msg;
        echo "<pre>";
        print_r($_FILES);
        echo "</pre>";
    }
    
    
    
?>
