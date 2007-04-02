<?php session_start();
    session_unset();
    session_destroy();
?>

<head>
<title>Admin Configuration Script for MiniTiddlyServer</title>
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
    else if (form.adminuser.value.length < 2 )
        alert("Please choose a longer username");
    else if (form.adminpass.value.length < 2 )
        alert("Please choose a longer password");
    else
        form.submit();
}

<?php

/*
Configuration and Installation::
Run this file after copying everything to your install server. (In a unique folder!)

/////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
*/

include_once("MTS/Source/SystemFunctions.php");
include_once("MTS/Source/ServerResponse.php");
$serverResponse = new ServerResponse();

$userspath = "MTS/Source/users.php";

$adminpass = $_POST['adminpass'];
$adminuser = $_POST['adminuser'];

if (isset($adminpass) && isset($adminuser) && $adminpass != "" && $adminuser != "") {

        // 1 // Create a new users.php with the admin password 
        
            $userstext = "<?php\n";
            $userstext .= "\$users = array(\n";
            $userstext .= "\t\"$adminuser\" => \"$adminpass\",\n";
            $userstext .= ");\n";
            $userstext .= "\$admins = array(\n";
            $userstext .= "\t\"$adminuser\" => true,\n";
            $userstext .= ");\n";
            $userstext .= "?>";
            
            writeToFile($userspath, $userstext);
        
        // 3 // Delete Config File
            unlink("config.php");
            
        // 4 // Redirect 
            echo "window.location = 'index.php'";
    
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
<h2>MiniTiddlyServer</h2>

<h4>Set Administrator Account</h4>
<table>
    <tr><td>user: </td><td><input type="text" size="10" name="adminuser"/></td></tr>
    <tr><td>password: </td><td><input type="password" size="10" name="adminpass"/></td></tr>
    <tr><td>repeat pass: </td><td><input type="password" size="10" name="adminpass2"/></td></tr>
</table>

<h4>Save and Complete</h4>
<div>By clicking submit below, this config file will be deleted and you will be taken to your first wiki!</div>
</form>
<p><input type="submit" value="Save and Complete" onclick="saveAndComplete()"/></p>
            
</body>

