<script language="javascript" type="text/javascript" src="Source/ajax.js">
</script>
<link rel="stylesheet" type="text/css" href="Source/style.css"/>
<script>
<?php

// AUTOSETTINGS // 
    $fullserverpath = $_SERVER["SCRIPT_NAME"];
    $parts = split("/",$fullserverpath);   
    $fullscriptpath = "http://".$_SERVER["SERVER_NAME"].$fullscriptpath;
    $wrapperScriptPath = array_pop($parts);
    $sourcePath = $wikipath; // From the wikiframe .. the wrapper.  It should still be defined.
    
// SPLIT // 
    list($wrapperScriptName, $ext) = split('\.', $wrapperScriptPath, 2);
    
// STORE ORIGINAL VERSION // 
    echo "\nvar wrapperScriptPath = '$wrapperScriptPath';";
    echo "\nvar wrapperScriptName = '$wrapperScriptName';";
    echo "\nvar sourcePath = '$sourcePath';";
    echo "\nvar fullScriptPath = '$fullscriptpath';";
        
// RSS // 
    echo "\nvar rssExists = '" . file_exists($wrapperScriptName.".xml") . "';";

// FILETIME // Must be updated for prefixes
    echo "\nvar origtime = '".filemtime($sourcePath)."';";
?>
</script>
<?php include_once("Admin.php") ?>

<script>

var systempath = "Source/System.php";

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
        }
    }
    catch (e) {
        showMessageWindow("Error!<br> The server's response was corrupted");
        alert(data);
        store.uploadError = true;
        store.setDirty(true);
    }
}

function goSave(user, pass, data, backup, rss)
{
    // Nothing // 
}


//use array for updated tiddlers as well?
//might give better performance!
TiddlyWiki.prototype.deletedTiddlersIndex = [];
TiddlyWiki.prototype.updatedTiddlersIndex = [];
TiddlyWiki.prototype.uploadError = false;

TiddlyWiki.prototype.flagForUpload = function(title)
{
  store.suspendNotifications();
	this.setValue(title,"temp.flagForUpload",1,true);
	store.resumeNotifications();
	// do I need to set the store as dirty here?
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


// OVERRIDEN SAVE CHANGES
function saveChanges()
{        //allow for full saves depending on global variable
        //only save when there is something to save
        //rss only when rss tiddlers
        // Automatically Called when they hit the save button on the side (or use the key command) //

    // 1 // Verify Info //
        if ( savedUserName == "" || savedUserName == "undefined" )
        {
            alert("Please login before attempting to save.  Select 'Login' at the top of the screen");
            return false;
        }

    showMessageWindow("Saving ... ");

    var user = config.options.txtUserName;
    var rss = "";

    // Generate Rss //
    if(config.options.chkGenerateAnRssFeed)
        rss = convertUnicodeToUTF8(generateRss());
      //we are still uploading the entire rss....

    // IGNORE ERROR CHECK // Do I want to do that ???
        //window.confirmExit = false;
        //window.checkUnsavedChanges = false;

    // SEND INFO //
        var params = new Object();

        if (rss != "") params.rss = rss;
        params.time = origtime;

        params.wrapperScriptName = wrapperScriptName;
        params.sourcePath = sourcePath;
        
        params.data = convertUnicodeToUTF8(store.uploadError? store.allTiddlersAsHtml(): store.updatedTiddlersAsHtml());
        
        params.savetype = store.uploadError? "full":"partial";
        
        params['deletedTiddlers'] = convertUnicodeToUTF8(store.deletedTiddlersIndex.join("|||||"));

             //perhaps better to do all utf8 conversions in openAjaxRequestParams?

        //reset tiddlers that were marked for upload
        //we should probably do this in the callback once we have verified the data was saved!
        store.deletedTiddlersIndex = [];
        store.unFlagForUpload(store.updatedTiddlersIndex);

        //for (var n in params)
        //    alert(n +" = " + params[n]);

        // Must use a post request //
        openAjaxRequestParams(systempath + "?action=save", params, saveReturn, true);
        store.setDirty(false);
}


</script>




<div id="addedStuff">

<form name="loginInfo" action="javascript:;">
    <div id="login">
        <div class="inner">
            <table>
            <tr><td>user: </td><td><input type="text" size="10" name="user"/></td></tr>
            <tr><td>pass: </td><td><input type="password" size="10" name="pass"/></td></tr>
            <tr><td colspan="2"><div align="center"><input type="submit" value="Login" onclick="login();return false;"></div></td></tr>
            </table>
        </div>
    </div>
</form>
        
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

    
    var savedUserName = "<?php echo $_SESSION['user'] ?>";
    
    function login() {
        // Get Username and Password
        //~ var config.options.txtUserName = document.loginInfo.user.value;
        
        showMessageWindow("Logging in...");
        
        // [ ] match up users // doesn't work yet
        try {   config.options.txtUserName = document.loginInfo.user.value; }
        catch (e) {};
        
        // Hide Box // 
        hideLogin();
        
        var user = document.loginInfo.user.value;
        var password = document.loginInfo.pass.value;
        
        var params = new Object();
        params.action = "login";
        params.user = user;
        params.pass = password;
        
        //~ alert("LOGGING IN");
        
        openAjaxRequestParams(systempath, params, loginReturn);
        //return false;
    }
    
    function loginReturn (data) {
    
        // redefines data // 
        try {
            eval (data);
            
            if (data.login) {
                showMessageWindow("Login Successful");
                savedUserName = document.loginInfo.user.value;
                //enable editing
                //config.options.chkHttpReadOnly = false;
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
                //loadOptionsCookie();
                readOnly = config.options.chkHttpReadOnly;
                refreshDisplay();
                printNav();
                hideAdmin();
            }
            
            else {
                showMessageWindow("Logout Failed");
            }
        

    }
    
    function saveChangesOver() {
        alert("SaveChangesOver");
        try { config.options.txtUserName = document.loginInfo.user.value; }        catch (e) {};
        password = document.loginInfo.pass.value;
        
        saveChanges();
    }
    
    var loginvisible = false;
    function showLogin() {
        hideMessageWindow();
        try { document.loginInfo.user.value = config.options.txtUserName; }        catch (e) {};
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
    
    
    
    function showMessageWindow(message)
    {
        document.getElementById("messageWindowContent").innerHTML = "<P>" + message + "</P>";
        document.getElementById("messageWindow").style.visibility = "visible";
    }
    
    function hideMessageWindow(message)
    {
        document.getElementById("messageWindowContent").innerHTML = "<P></P>";
        document.getElementById("messageWindow").style.visibility = "hidden";
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
            
        out += "<a href='" + sourcePath + "'>Download</a> | ";
        
        if ( rssExists == '1')
            out += "<a href='" + wrapperScriptName + ".xml'>Rss</a> | ";
            
        out += "<a href='http://www.blogjones.com/TiddlyWikiTutorial.html#EasyToEdit' target='_blank'>Help</a>";
        
        
        document.getElementById("optionsGuts").innerHTML = out;
    }
    
// ADMIN FUNCTIONS // 

    function showAdmin() {
        hideMessageWindow();
    
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
        
        openAjaxRequest(systempath + "?action=adduser&user=" + user + "&pass=" + pass, addUserReturn);
        
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

               
        openAjaxRequest(systempath + "?action=removeuser&user=" + user, removeUserReturn);
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
    
    function clearAll() {
        if (confirm("Are you sure?  This will destroy all saved data!"))
            openAjaxRequest(systempath + "?action=clearall", clearAllReturn, true, genericPostPaths);
    }
    
    function clearAllReturn (data) {
        history.go()
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
    
        if (confirm("Are you sure?  This will destroy all saved data!")) {
        
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
        if (confirm("Are you sure?  This will completely replace your current wiki.  You may want to perform a manual backup first.")) {              
            showMessageWindow("Uploading Wiki ... ");
            
            file.submit();
        }
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


