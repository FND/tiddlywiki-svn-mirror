
<div id="adminDisplay">    
<h2>Admin Control Panel</h2>
    <table id="admintable">
    <tr>
        <td>
            <h4>Add User</h4>
            <form id="adduser" action="javascript:;">
                 <table>
                    <tr><td>user: </td><td><input type="text" size="10" name="user"/></td></tr>
                    <tr><td>pass: </td><td><input type="password" size="10" name="pass"/></td></tr>
                    <tr><td colspan="2"><input type="submit" value="Add User" onclick="addUser()"></td></tr>
                </table>
            </form>
        </td>
        <td>
            <h4>Remove User</h4>
            <form id="removeuser" action="javascript:;">
                <table>
                    <tr><td>user: </td><td><input type="text" size="10" name="user"/></td></tr>
                    <tr><td colspan="2"><input type="submit" value="Remove User" onclick="removeUser()"></td></tr>
                </table>
            </form>
        </td>
        <td>
            
        </td>
    </tr>
    <tr>
        <td>
            <h4>Revert to Backup</h4>
            <form id="revert" action="javascript:;">
            <div>
                <select name="revertfile">
                <?php 
                    $versions = scandir("Backups/");
                    foreach ($versions as $file) {
                        if (strpos($file, ".htm") != false)
                            echo "<option value='$file'>$file</option>\n";
                    }
                ?>
                </SELECT>
            </div>
            <div><input type="submit" value="Revert" onclick="revert()"/></div>
        </td>
        <td>
            <h4>Manual Backup</h4>
            <form id="backup" action="javascript:;">
            <div><input type="submit" value="Backup" onclick="manualBackup()"/></div>
        </td>
        <td>
        <h4>Delete This Wiki</h4>
            <input type="submit" value="Delete Wiki" onclick="deleteWiki()"/>
        </td>
    </tr>
        <tr>
        <td>
            <h4>Control Panel Side</h4>
            <input type="submit" value="Left" onclick="moveAdmin('left');"/><input type="submit" value="right" onclick="moveAdmin('right');"/>
        </td>
        <td>
        </td>
        <td>
        </td>
    </tr>
<tr><td colspan=3>
<h4>Create New Wiki</h4>
<div> Don't forget the extensions below!  The first must be ".php" and the second ".html";</div>
<form id="createwiki" action="javascript:;">
    <table>
        <tr><td>Wrapper Path:</td><td><input type="text" name="wrapperpath"/></td></tr>
        <tr><td>Wiki Path: </td><td><input type="text" name="sourcepath"/></td></tr>
        <tr><td colspan="2"><input type="submit" value="Create Wiki" onclick="createWiki()"></td></tr>
    </table>
</form></td></tr>
<tr><td colspan=3>
<h4>Upload and Replace</h4>
<table>
    <tr><td>Select a TW: </td><td><form id="uploadfile" method="POST" enctype="multipart/form-data" action="Source/Upload.php"><input type="hidden" name="sourcepath" value="<?php echo $sourcePath ?>"/><input type="hidden" name="wrapperpath" value="<?php echo $wrapperScriptPath ?>"/><input name="uploadfile" type="file"/></form></td></tr>
    <tr><td colspan="2"><input type="submit" value="Upload" onclick="uploadFile()"></td></tr>
</table>
</td></tr>

</table>


    <input type="submit" value="Close" onclick="hideAdmin()"/>
    
</div>

