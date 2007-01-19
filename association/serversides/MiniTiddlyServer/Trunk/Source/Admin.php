
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
            <h4>Create New Wiki</h4>
            <div> Don't forget the extensions below!  The first must be ".php" and the second ".html";</div>
            <form id="createwiki" action="javascript:;">
                <table>
                    <tr><td>Wrapper Path:</td><td><input type="text" name="wrapperpath"/></td></tr>
                    <tr><td>Wiki Path: </td><td><input type="text" name="sourcepath"/></td></tr>
                    <tr><td colspan="2"><input type="submit" value="Create Wiki" onclick="createWiki()"></td></tr>
                </table>
            </form>
        </td>
    </tr>
    <tr>
        <td>
            <h4>Revert to Original</h4>
            <div>Disabled</div><!--<input type="submit" value="Revert" onclick="clearAll()"/>-->
        </td>
        <td>
            <h4>List All Users</h4>
            <div>Disabled</div><!--<input type="submit" value="List All Users" onclick="listAllUsers()"/>-->
        </td>
        <td>
        <h4>Delete This Wiki</h4>
            <input type="submit" value="Delete Wiki" onclick="deleteWiki()"/>
        </td>
    </tr>
</table>
    
    <input type="submit" value="Close" onclick="hideAdmin()"/>
    
</div>

