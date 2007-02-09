<?php session_start();
    session_unset();
    session_destroy();
?>

<!-- /////////////////////////////////////////////////////////////////////////////

    MiniTiddlyServer: A mini-server for TiddlyWikis
    Copyright (C) 2007  Sean Clark Hess
    
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

//////////////////////////////////////////////////////////////////////////////// -->

<head>
<title>Admin Configuration Script for AjaxTiddlyWiki</title>
<style>
   td, div, body, p {
	   font-family:verdana;
       font-size:10pt;
   }
   
   h1 {
        color:red;
   }
</style>
<script>

function saveAndComplete() {

    var form = document.getElementById("settings");
    
    if (form.adminpass.value != form.adminpass2.value || form.adminpass.value == "" || form.adminpass2.value == "") {
        alert("Error: the passwords to not match or have not been entered");
        
        return; 
    }
    
    else if ( form.wrapperpath.value.indexOf(".php") == -1 || form.sourcepath.value.indexOf(".html") == -1) {
        alert("Error: Please make sure the wrapper path has a .php extension, and the sourcepath has a .html extension");
        
        return;
    }
    
    form.submit();
}

<?php

/*
Configuration and Installation::
Run this file after copying everything to your install server. (In a unique folder!)


*/

$data = "";

include_once("MTS/Source/Functions.php");

$templatename = "MTS/Source/empty.html";
$wikiframe = "MTS/Source/wikiframe.php";
$userspath = "MTS/Source/users.php";

$adminpass = $_POST['adminpass'];
$wrapperpath = $_POST['wrapperpath'];
$sourcepath = $_POST['sourcepath'];
$baseDir = substr($_SERVER['SCRIPT_URI'], 0, strpos($_SERVER['SCRIPT_URI'],"config.php"));


if (isset($adminpass) && isset($wrapperpath) && isset($sourcepath) && $adminpass != "" && $wrapperpath != "" && $sourcepath != "") {

        // 1 // Create a new users.php with the admin password 
        
            $userstext = "<?php\n";
            $userstext .= "\$users = array(\n";
            $userstext .= "\t\"admin\" => \"$adminpass\",\n";
            $userstext .= ");\n";
            $userstext .= "?>";
            
            writeToFile($userspath, $userstext);
        
        // 2 // Create a new wiki of that name.. 
            createNewWiki($wrapperpath, $sourcepath, "", $baseDir);
            
        // 3 // Delete Config File
            unlink("config.php");
            
        // 4 // Redirect 
            echo "window.location = \"$wrapperpath\"";
    
}
    

?>
</script>

</head>

<body>

<?php 
if ( substr(phpversion(),0,strpos(phpversion(), ".")) == "4" ) {
    echo "<h2>PHP Version Error</h2><p>You are running PHP Version ".phpversion().".  MiniTiddlyServer requires PHP 5.1 or higher. Please use a server with PHP 5 enabled. </p>";
    exit;
}
else if ( substr(phpversion(),0,strrpos(phpversion(), ".")) == "5.0" )
    echo "<h2>PHP Version Warning</h2><p>You are running PHP Version ".phpversion().".  We suspect that MiniTiddlyServer does no twork on PHP 5.0.  If you experience problems, you may want to switch to 5.1.x or higher, but please report your bugs to the google list</p>";
    
?>
<form id="settings" method="POST" action="config.php">
<h2>AjaxTiddlyWiki</h2>

<h4>Administrator Account</h4>
<table>
    <tr><td>user: </td><td>admin</td></tr>
    <tr><td>password: </td><td><input type="password" size="10" name="adminpass"/></td></tr>
    <tr><td>repeat pass: </td><td><input type="password" size="10" name="adminpass2"/></td></tr>
</table>

<h4>WikiFileName</h4>
<div> Don't forget the extensions below!  The first must be ".php" and the second ".html";</div>
<table>
    <tr><td>Wrapper Path (ie: "test.php"): </td><td><input type="text" name="wrapperpath"/></td></tr>
    <tr><td>Wiki Path (ie: "source.html"): </td><td><input type="text" name="sourcepath"/></td></tr>
</table>

<h4>Save and Complete</h4>
<div>By clicking submit below, this config file will be deleted and you will be taken to your new wiki!</div>
</form>
<p><input type="submit" value="Save and Complete" onclick="saveAndComplete()"/></p>
            
</body>

