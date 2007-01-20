<?php session_start(); 
    session_unset();
    session_destroy();
?>
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

include_once("Source/Functions.php");

$configfilepath = "Source/config.txt";
$templatename = "Source/empty.html";
$wikiframe = "Source/wikiframe.php";
$userspath = "Source/users.php";

$adminpass = $_GET['adminpass'];
$wrapperpath = $_GET['wrapperpath']; 
$sourcepath = $_GET['sourcepath']; 
//~ $htmlPrefix = "Data/";


if (isset($adminpass) && isset($wrapperpath) && isset($sourcepath) && $adminpass != "" && $wrapperpath != "" && $sourcepath != "") {

        // 1 // Create a new config.txt with the admin password 
            $usersfile = file($userspath);
            $usersstr = join("", $usersfile);
            $usersstr = preg_replace ( '/"ADMINPASS"/',"\"$adminpass\"",$usersstr);
            writeToFile($userspath, $usersstr);
        
        // 2 // Create a new wiki of that name.. 
            createNewWiki($wrapperpath, $sourcepath, "");
            
        // 3 // Delete Config File
            unlink("config.php");
            
        // 4 // Redirect 
            echo "window.location = \"$wrapperpath\"";
    
}
    

?>
</script>

</head>

<body>
<form id="settings" method="GET" action="config.php">
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
<p><input type="submit" value="Save and Complete" onclick="saveAndComplete()"/></p>
</form>
            
</body>




