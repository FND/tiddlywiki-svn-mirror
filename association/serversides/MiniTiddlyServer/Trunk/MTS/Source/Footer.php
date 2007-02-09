<script language="javascript" type="text/javascript" src="MTS/Source/ajax.js">
</script>
<link rel="stylesheet" type="text/css" href="MTS/Source/style.css"/>
<script>
<?php
/* /////////////////////////////////////////////////////////////////////////////

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

// Plugins. Load to array as variables for later processing.
   echo "\nvar MTSExternalPlugins = [];";
   foreach (glob("MTS/Plugins/*.js") as $filename) {
      $fcontents = file_get_contents($filename);
      $fcontents = addslashes($fcontents);
      $fcontents = preg_replace('/(\n)/i', '\\n', $fcontents);
      $fcontents = preg_replace('/</i', '\\<', $fcontents);
      $fcontents = preg_replace('/>/i', '\\>', $fcontents);
      echo "\nMTSExternalPlugins.push(['$filename','$fcontents']);";
}

// AUTOSETTINGS // 
    $fullserverpath = $_SERVER["SCRIPT_NAME"];
    $parts = split("/",$fullserverpath);   
    $fullscriptpath = "http://".$_SERVER["SERVER_NAME"].$fullscriptpath;
    $wrapperScriptPath = array_pop($parts);
    $sourcePath = $wikipath; // From the wikiframe .. the wrapper.  It should still be defined.
    $sourceName = substr($sourcePath, 0, strpos($sourcePath, ".htm"));
    
// SPLIT // 
    list($wrapperScriptName, $ext) = split('\.', $wrapperScriptPath, 2);
    if (file_exists($wrapperScriptName.".xml"))
       echo "\nvar mtsRssExists = true;";
    else
       echo "\nvar mtsRssExists = false;";
    
// STORE ORIGINAL VERSION // 
    echo "\nvar wrapperScriptPath = '$wrapperScriptPath';";
    echo "\nvar wrapperScriptName = '$wrapperScriptName';";
    echo "\nvar sourcePath = '$sourcePath';";
    echo "\nvar sourceName = '$sourceName';";
    echo "\nvar fullScriptPath = '$fullscriptpath';";
        
// RSS // 
    echo "\nvar rssExists = '" . file_exists($wrapperScriptName.".xml") . "';";

// FILETIME // Must be updated for prefixes
    echo "\nvar origtime = '".filemtime($sourcePath)."';";
?>
</script>
<?php include_once("Admin.php") ?>

<script>

var systempath = "MTS/Source/System.php";

var genericPostPaths = "wrapperScriptName=" + wrapperScriptName + "&sourcePath=" + sourcePath;

function saveReturn(data) {

    try {
        eval(data);
        
        if ( data.error )
            {        
            showMessageWindow("Error!<br> " + data.message);
            store.uploadError = true;
            store.setDirty(true);
            }
        else if ( data.conflict ) {
            showMessageWindow("Error! A conflict was detected.  Your changes have been routed to the following file.  Please click the following link, refresh this wiki and copy your changes manually.<a href='" + data.path + "' target='_blank'>Rerouted Changes</a>");
            store.uploadError = false;
        }

        else {
            showMessageWindow("The file was saved successfully");
            store.uploadError = false;
            
            if ( data.rss ) {
                rssExists = true;
                printNav();
            }
            
            // Add to Backups List // 
            if ( backupsmap[sourcePath] != true) {
                var options = document.getElementById("revert").revertfile.options;
                options[options.length] = new Option(data.backup,data.backup);
                backupsmap[sourcePath] = true;
            }
        }
    }
    catch (e) {
        showMessageWindow("Error!<br> The server's response was corrupted");
        alert(data);
        store.uploadError = true;
        store.setDirty(true);
    }
}

TiddlyWiki.prototype.deletedTiddlersIndex = [];
TiddlyWiki.prototype.updatedTiddlersIndex = [];
TiddlyWiki.prototype.uploadError = false;

TiddlyWiki.prototype.flagForUpload = function(title)
{
  store.suspendNotifications();
	this.setValue(title,"temp.flagForUpload",1,true);
	store.resumeNotifications();
}

TiddlyWiki.prototype.unFlagForUpload = function(tiddlers)
{
    store.suspendNotifications();
    for (var i=0; i<tiddlers.length;i++)
         this.setValue(tiddlers[i],"temp.flagForUpload","",true);
    store.resumeNotifications();
}

old_ffu_setTiddlerTag = TiddlyWiki.prototype.setTiddlerTag;
TiddlyWiki.prototype.setTiddlerTag = function(title,status,tag)
{
    old_ffu_setTiddlerTag.apply(this,arguments);
    this.flagForUpload(title);
}

TiddlyWiki.prototype.old_ffu_saveTiddler = TiddlyWiki.prototype.saveTiddler
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields)
{
    var temp = this.old_ffu_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields);
    this.flagForUpload(temp);
    return temp;
}

old_ffu_setValue = TiddlyWiki.prototype.setValue;
TiddlyWiki.prototype.setValue = function(tiddler, fieldName, value,flag) {
    old_ffu_setValue.apply(this,arguments);
    if (!flag)
        this.flagForUpload(tiddler);
}

old_ffu_removeTiddler = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title)
{
	old_ffu_removeTiddler.apply(this,arguments);
	this.deletedTiddlersIndex.pushUnique(title);
}

TiddlyWiki.prototype.updatedTiddlersAsHtml = function()
{
   return store.getSaver().externalizeUpdated(store);
}

SaverBase.prototype.externalizeUpdated = function(store)
{
	var results = [];
	var tiddlers = store.getTiddlersWithField("temp.flagForUpload",1);
	for (var t = 0; t < tiddlers.length; t++)
		{
    results.push(this.externalizeTiddler(store, tiddlers[t]));
	  store.updatedTiddlersIndex.push(tiddlers[t].title);
    }
  return results.join("\n");
}

//returns a sorted array of tiddlers with a given field
// if fieldValue is specified, returns array of tiddlers that have given field with value equal to fieldValue
//if resultMatch is false, returns array of tiddlers that have given field with value NOT equal to fieldValue
TiddlyWiki.prototype.getTiddlersWithField = function (field,fieldValue,resultMatch)
{                
       if (resultMatch==undefined) var resultMatch = true;
       var results= [];
       this.forEachTiddler(function(title,tiddler){
                var f = !resultMatch;
                var fieldResult = store.getValue(tiddler,field);
                if (fieldResult!=undefined)
                  {if(fieldValue == undefined || fieldValue == fieldResult)
                          {f= resultMatch;}
                   if (f) results.push(tiddler);       }

                });
       results.sort(function(a,b) {return a["title"] < b["title"] ? -1 : (a["title"] == b["title"] ? 0 : +1);});
       return results;
}


function generateRss()
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText("SiteUrl");
	// Assemble the header
	s.push("<" + "?xml version=\"1.0\"?" + ">");
	s.push("<rss version=\"2.0\">");
	s.push("<channel>");
	s.push("<title" + ">" + wikifyPlain("SiteTitle").htmlEncode() + "</title" + ">");
	if(u)
		s.push("<link>" + u.htmlEncode() + "</link>");
	s.push("<description>" + wikifyPlain("SiteSubtitle").htmlEncode() + "</description>");
	s.push("<language>en-us</language>");
	s.push("<copyright>Copyright " + d.getFullYear() + " " + config.options.txtUserName.htmlEncode() + "</copyright>");
	s.push("<pubDate>" + d.toGMTString() + "</pubDate>");
	s.push("<lastBuildDate>" + d.toGMTString() + "</lastBuildDate>");
	s.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
	s.push("<generator>TiddlyWiki " + version.major + "." + version.minor + "." + version.revision + "</generator>");
	// The body
	var tiddlers = store.getTiddlers("modified","excludeLists");
	var n = config.numRssItems > tiddlers.length ? 0 : tiddlers.length-config.numRssItems;
	for (var t=tiddlers.length-1; t>=n; t--)
	    { if (! store.uploadError && mtsRssExists)
          {
          if (store.getValue(tiddlers[t],"temp.flagForUpload"))
		          s.push(tiddlers[t].saveToRss(u));
          }
        else
            s.push(tiddlers[t].saveToRss(u));
	    }
    // And footer
	s.push("</channel>");
	s.push("</rss>");
	// Save it all
	return s.join("\n");
}


// OVERRIDEN SAVE CHANGES
function saveChanges()
{        //allow for full saves depending on global variable
        //only save when there is something to save
        //rss only when rss tiddlers

    // 1 // Verify Info //
        if ( savedUserName == "" || savedUserName == "undefined" )
        {
            alert("Please login before attempting to save.  Select 'Login' at the top of the screen");
            return false;
        }

    showMessageWindow("Saving ... ");

    var rss = "";

    // Generate Rss //
    if(config.options.chkGenerateAnRssFeed)
        rss = convertUnicodeToUTF8(generateRss());
      //we are still uploading the entire rss....

    // SEND INFO //
        var params = new Object();

        if (rss != "") params.rss = rss;
        params.time = origtime;

        params.wrapperScriptName = wrapperScriptName;
        params.sourcePath = sourcePath;
        
        params.data = convertUnicodeToUTF8(store.uploadError? store.allTiddlersAsHtml(): store.updatedTiddlersAsHtml());
        
        params.savetype = store.uploadError? "full":"partial";
        
        params['deletedTiddlers'] = convertUnicodeToUTF8(store.deletedTiddlersIndex.join("|||||"));

        //reset tiddlers that were marked for upload
        store.deletedTiddlersIndex = [];
        store.unFlagForUpload(store.updatedTiddlersIndex);

        // Must use a post request //
        openAjaxRequestParams(systempath + "?action=save&backup=" + config.options.chkSaveBackups, params, saveReturn, true);
        store.setDirty(false);
}


old_MTS_loadPlugins = loadPlugins;
loadPlugins = function()
{
    var hadProblems = old_MTS_loadPlugins.apply(this,arguments);
    var scripts = MTSExternalPlugins;
    for (var i=0; i<scripts.length;i++)
        {
        title = scripts[i][0];
        try
           {
           window.eval(scripts[i][1]);
           }
        catch(e)
          {
          alert(exceptionText(e)+ " in " + title);
          }
        }
   MTSExternalPlugins = null;
   return hadProblems;
}

</script>


<div id="addedStuff">

<form name="loginInfo" action="javascript:;">
    <div id="login">
        <div class="inner">
            <table>
            <tr><td>user: </td><td><input type="text" size="10" name="loginuser"/></td></tr>
            <tr><td>pass: </td><td><input type="password" size="10" name="loginpass"/></td></tr>
            <tr><td colspan="2"><div align="center"><input type="submit" value="Login" onclick="login();return false;"></div></td></tr>
            </table>
        </div>
    </div>
</form>

<div id="helppanel">
    <div class="inner"><center>
        <p><a href='http://www.seanclarkhess.com/tw/' target='_blank'>MTS Home</a></p>
        <p><a href='http://www.seanclarkhess.com/tw/#LatestVersion' target='_blank'>Updates</a></p>
        <p><a href='http://www.blogjones.com/TiddlyWikiTutorial.html#EasyToEdit' target='_blank'>Editing Help</a></p>
        <script>document.write("<p id='rssfeed'><a href='" + wrapperScriptName + ".xml' target='_blank'>RSS Feed</a></p>");</script>
    </center></div>
</div>
        
<div id="options">
    <div class="inner">
        <span id="optionsGuts">
        </span>
    </div>
</div>


<form name="message">
    <div id="messageWindow">
        <div class="inner">
            <div id="messageWindowContent"></div>
            <div align="center"><a href="javascript:;" onclick="hideMessageWindow();return false;">[ Close ]</a></div>
        </div>
    </div>
</form>



<script>

    
    var savedUserName = "<?php echo $_SESSION['mts_saved_username'] ?>";
    
    function login() {
        // Get Username and Password
        
        showMessageWindow("Logging in...");
        
        // Hide Box // 
        hideLogin();
        hideHelp();
        
        var user = document.loginInfo.loginuser.value;
        var password = document.loginInfo.loginpass.value;
        
        var params = new Object();
        params.action = "login";
        params.get_user = user;
        params.get_pass = password;
        
        openAjaxRequestParams(systempath, params, loginReturn);
        //return false;
    }
    
    function loginReturn (data) {
    
        // redefines data // 
        try {
            eval (data);
            
            if (data.login) {
                showMessageWindow("Login Successful");
                savedUserName = document.loginInfo.loginuser.value;
                //enable editing
                readOnly = false;
                refreshDisplay();
                printNav();
                // Change to logout //
            }
            
            else {
                logoutReturn("skip");
                showMessageWindow("Login Failed");
                printNav();
            }
        }
        catch (e) {
            showMessageWindow("Error!<br> The server's response was corrupted");
            alert(data);
        }
    }
    
    function logout() {
        // Send Logout Request // 
        showMessageWindow("Logging out...");
    
        openAjaxRequest(systempath + "?action=logout",logoutReturn);
    }
    
    function logoutReturn(data) {
        try {
            if (data != "skip")
                eval (data);
        }
        catch (e) {
            showMessageWindow("Error!<br> The server's response was corrupted");
            alert(data);
        }
      
            if (data.logout && data != "skip") {
                showMessageWindow("You have been successfuly logged out.  Please log in again before saving.");
                savedUserName = "";
                //reset editing & readOnly
                readOnly = config.options.chkHttpReadOnly;
                refreshDisplay();
                printNav();
                hideAdmin();
            }
            
            else {
                showMessageWindow("Logout Failed");
            }
    }
    
    var loginvisible = false;
    function showLogin() {
        hideHelp();
        hideMessageWindow();
        document.getElementById("login").style.visibility = "visible";
        loginvisible = true;
    }
    
    function hideLogin() {
        document.getElementById("login").style.visibility = "hidden";
        loginvisible = false;
    }
    
    function toggleLogin() {
        if (loginvisible == true)
            hideLogin();
        
        else if (loginvisible == false)
            showLogin();
    }
    
    var helpvisible = false;
    function showHelp() {
        hideLogin();
        hideMessageWindow();
        document.getElementById("helppanel").style.visibility = "visible";
        helpvisible = true;
    }
    
    function hideHelp() {
        document.getElementById("helppanel").style.visibility = "hidden";
        helpvisible = false;
    }
    
    function toggleHelp() {
        if (helpvisible == true) 
            hideHelp();
            
        else if ( helpvisible == false )
            showHelp();
    }
    
    
    
    function showMessageWindow(message)
    {
        hideHelp();
        document.getElementById("messageWindowContent").innerHTML = "<P>" + message + "</P>";
        document.getElementById("messageWindow").style.visibility = "visible";
    }
    
    function hideMessageWindow(message)
    {
        document.getElementById("messageWindowContent").innerHTML = "<P></P>";
        document.getElementById("messageWindow").style.visibility = "hidden";
    }
    
    old_mts_clearMessage = clearMessage;
    clearMessage = function()
    {
        old_mts_clearMessage();
        hideMessageWindow();
    }
    
    function downloadWiki()
    {
        showMessageWindow("<p>Save Local Copy: Right click on the link, and select Save Link As.</p><p align='center'><a href='<?php echo $downfile?>'><?php echo $downfile ?></a></p>");
    }
    
    
    function printNav() {
        var out = "";
        
        //~ if ( nav.download )
            //~ out += "<a href='javascript:;' onclick='" + nav.download + "()'>Download</a> | ";
        
        if ( savedUserName ) {
            
            out += "<span class='loggedin'>" + savedUserName + " -</span>";
            out += "<a href='javascript:;' onclick='logout();return false;'>Logout</a> | ";
            
            if ( savedUserName == "admin" )
                out += "<a href='javascript:;' onclick='showAdmin();return false;'>Admin</a> | ";
        }
        
        else {
            out += "<a href='javascript:;' onclick='toggleLogin();return false;'>Login</a> | ";
        }
        
        if ( rssExists == '1')
            document.getElementById("rssfeed").style.display = "block";
            
        out += "<a href='" + sourcePath + "'>Download</a> | ";
          
        out += "<a href='javascript:;' onclick='toggleHelp();return false;'>MTS</a>";          
        
        document.getElementById("optionsGuts").innerHTML = out;
    }
    
// ADMIN FUNCTIONS // 

    function showAdmin() {
        hideMessageWindow();
        hideLogin();
        hideHelp();
    
        if (document.getElementById("adminDisplay").style.visibility == "visible")
            hideAdmin();
        else
        document.getElementById("adminDisplay").style.visibility = "visible";
    }
    
    function hideAdmin() {
        document.getElementById("adminDisplay").style.visibility = "hidden";
    }
    
    function listAllUsers() {
        var ret = function (data) {
            try {
                alert("data :: " + data);
                eval (data);
                
                var users = "<b>Users</b><ol>";
                
                for (var username in data.users) {
                    user += "<li>" +username+ ":" + data.users[username] + "</li>";
                }
                
                users += "</ol>";
                
                showMessageWindow(users);
            }
            catch (e) {
                showMessageWindow("Error!<br> The server's response was corrupted");
                alert(data);
            }

        }
    
        openAjaxRequest(systempath + "?action=listAllUsers", ret);
    }
    
    function addUser() {
        var user = document.getElementById("adduser").user.value;
        var pass = document.getElementById("adduser").pass.value;
        
        showMessageWindow("Adding User...");
        
        openAjaxRequest(systempath + "?action=adduser&get_user=" + user + "&get_pass=" + pass, addUserReturn);
        
    }
    
    function addUserReturn(data) {
        try {
            eval (data);
            
            if (data.adduser)
                showMessageWindow("User Added Successfully");
            
            else
                showMessageWindow("User Add: Error -- " + data.message);
        }
        catch (e) {
            showMessageWindow("Error!<br> The server's response was corrupted");
            alert(data);
        }

    }
    
    function removeUser() {
        var user = document.getElementById("removeuser").user.value;
        
        showMessageWindow("Removing User...");

               
        openAjaxRequest(systempath + "?action=removeuser&get_user=" + user, removeUserReturn);
    }
    

    
    function removeUserReturn(data) {
        try {
            eval (data);
            
            if (data.removeuser)
                showMessageWindow("User Removed Successfully");
            
            else
                showMessageWindow("User Remove: Error -- " + data.message);
        }
        catch (e) {
            showMessageWindow("Error!<br> The server's response was corrupted");
            alert(data);
        }
    }
    
    
    
    function moveAdmin(side) {
        var moveAdminRet = function (data) {
            try {
                eval(data);
                
                if (data.error) 
                    showMessageWindow("Error: " + data.message);
                    
                else
                    showMessageWindow("Control panel side changed, please refresh to see the change");
            }
            catch (e) {
                showMessageWindow("Error!<br> The server's response was corrupted");
                alert(data);
            }
        }
    
        openAjaxRequest(systempath + "?action=moveadmin", moveAdminRet, true, "side=" + side);
    }
    
    function createWiki() {
        var wrapperpath = document.getElementById("createwiki").wrapperpath.value;
        var sourcepath = document.getElementById("createwiki").sourcepath.value;
        
        showMessageWindow("Creating Wiki ... ");
        
        var ret = function (data) {
            try {
                eval(data);
                
                if (data.error) 
                    showMessageWindow("Error: " + data.message);
                    
                else
                    showMessageWindow("Wiki Created Successfully: <br><a href='"+wrapperpath+"'>[ " + wrapperpath + " ]</a>");
            }
            catch (e) {
                showMessageWindow("Error!<br> The server's response was corrupted");
                alert(data);
            }
        }
        
        openAjaxRequest(systempath + "?action=createwiki", ret, true, "newWrapper=" + wrapperpath + "&newSource=" + sourcepath);
    }
    
    
    function deleteWiki() {
    
        if (confirm("Delete: Are you sure?  This will destroy all saved data!")) {
        
            showMessageWindow("Removing Wiki ... ");
            
            var ret = function (data) {
                try {
                    eval(data);
                    
                    if (data["delete"])
                        showMessageWindow("This wiki has been deleted.");    
                        
                    else
                        showMessageWindow("The file was NOT deleted successfully");
                }
                catch (e) {
                    showMessageWindow("Error!<br> The server's response was corrupted");
                    alert(data);
                }
            }
            
            openAjaxRequest(systempath + "?action=deletewiki", ret, true, genericPostPaths);
        }
    }
    
    function uploadFile() {
        var file = document.getElementById("uploadfile");
        if (file.lastChild.value.length == 0)
              {
              alert("no file selected!");
              return false;
              }           
        if (confirm("Upload: Are you sure?  This will completely replace your current wiki.  You may want to perform a manual backup first.")) {              
            showMessageWindow("Uploading Wiki ... ");
            
            file.submit();
        }
    }
    
    function manualBackup () {
        showMessageWindow("Creating Backup ... ");
        
        
        var ret = function (data) {
        
            try {
                eval(data);
            }
            catch (e) {
                showMessageWindow("Error!<br> The server's response was corrupted");
                alert(data);
            }
                
            if (data["backup"] != false) {
                    showMessageWindow("A manual backup has been created.");

                if ( backupsmap[sourcePath] != true) {
                    var options = document.getElementById("revert").revertfile.options;
                    options[options.length] = new Option(data.backup,data.backup);
                    backupsmap[sourcePath] = true;
                }
            }
                    
                else
                    showMessageWindow("The backup was not created succesfully");
            
        }
        
        openAjaxRequest(systempath + "?action=manualbackup", ret, true, genericPostPaths);
    }
    
    function revert() {
        var revertTo = document.getElementById("revert").revertfile.value;
        
        if ( revertTo.indexOf(".html") < 0 ) {
            alert("Error, filename not valid");
            return;
        }
        
        var ret = function (data) {
            try {
                eval(data);
            }
            catch (e) {
                showMessageWindow("Error!<br> The server's response was corrupted");
                alert(data);
            }
        
            if (data.reverted) 
                history.go();
                
            else
                showMessageWindow("Revert was unsuccessful. " + data.message);
        }
        
        if (confirm("Revert: Are you sure?  This will overwrite your current wiki!"))
            openAjaxRequest(systempath + "?action=revert", ret, true, genericPostPaths+"&revertfile=" + revertTo);
    }
    
    printNav();
    hideAdmin();
    
    //enable editing for user already logged in
    if (savedUserName)
        {
        old_MTS_restart= restart;
        restart = function(){
            old_MTS_restart();
            config.options.chkHttpReadOnly = false;
            readOnly = false;
            refreshDisplay();
            }
        }
    
</script>

<script>
loadRemoteFile = function () {
    alert("Unfortunatly, this cannot work from a live wiki wrapped by MTS.  Please download your wiki, import the tiddlers after running it from your hard drive, and then upload it after saving.");
}

</script>


