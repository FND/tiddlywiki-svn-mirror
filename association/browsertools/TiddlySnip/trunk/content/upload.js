function setUploadPassword(aStr)
{
    var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManager);
    try
        {
        passwordManager.removeUser("tiddlysniphost", getUploadUser());
        }
    catch(e)
        {}
    passwordManager.addUser("tiddlysniphost", getUploadUser(), aStr);
}

function getUploadPassword()
{
    var host= new Object();
    var user= new Object();
    var pass= new Object();
    try
        {
        var pmInternal = Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManagerInternal);
        pmInternal.findPasswordEntry("tiddlysniphost",getUploadUser(),"",host,user,pass);
        return pass.value;
		}
    catch(e)
        {
		return "";
		}
}

function getUploadUser()
{
    return pref.getCharPref("tiddlysnip.uploadusername");
}

var tiddlySnipUploadObserver =
{
    observe: function(subject, topic, data)
        {
        subject.QueryInterface(Components.interfaces.nsISupportsPRBool);
        var status;
        if (tiddlySnipUploading)
            {
            status = !confirm("There is a TiddlySnip upload in progress, if you exit now the snippet will be lost.\nAre you sure you want to exit?");
            }
        else status = false;
        subject.data = status;
        },

    register: function()
        {
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(tiddlySnipUploadObserver, "quit-application-requested", false);
        },

    unregister: function()
        {
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(tiddlySnipUploadObserver, "quit-application-requested");
        }
};

function uploadTW(content,title)
{
    var boundary = "---------------------------"+"AaB03x";
    var request;
    request = new XMLHttpRequest();
    window.doTiddlyUpload = function ()
        {
		var sheader = "";
		sheader += "--" + boundary + "\r\nContent-disposition: form-data; name=\"";
		sheader += "UploadPlugin" +"\"\r\n\r\n";
		sheader += "backupDir=" + pref.getCharPref("tiddlysnip.uploadbackupdir")
				  +";user=" + pref.getCharPref("tiddlysnip.uploadusername")
				  +";password=" + getUploadPassword()
				  +";uploaddir=" + pref.getCharPref("tiddlysnip.uploaddir")
				  + ";;\r\n";
		sheader += "\r\n" + "--" + boundary + "\r\n";
		sheader += "Content-disposition: form-data; name=\"userfile\"; filename=\"" + pref.getCharPref("tiddlysnip.uploadfilename")+"\"\r\n";
		sheader += "Content-Type: " + "text/html;charset=UTF-8" + "\r\n";
		sheader += "Content-Length: " + content.length + "\r\n\r\n";
		var strailer = new String();
		strailer = "\r\n--" + boundary + "--\r\n";
		var data;
		data = sheader + content + strailer;

		request.open("POST", pref.getCharPref("tiddlysnip.uploadstoreurl"), true);
		request.onreadystatechange = function ()
            {
		    if (request.readyState == 4)
                {
	            if (request.status == 200)
	                {
                    tiddlySnipUploading = false;
                    tiddlySnipUploadObserver.unregister();
	                if(request.responseText.substr(0,1)==0)
	                    {
	                    notifier("TiddlySnip","Snippet saved: " + title,true);
	                    showTW(title);
                        }
		            else
		                {
		                alert(request.responseText);
		                errorSound();
		                }
                    }
                else
                    {
                    tiddlySnipUploadObserver.unregister();
                    alert("Upload failed");
                    errorSound();
                    }
		        }
			};
		request.setRequestHeader("Content-Length",data.length);
		request.setRequestHeader("Content-Type","multipart/form-data; boundary="+boundary);
	    request.send(data);
	    };
    window.setTimeout("doTiddlyUpload()", 1000);
};



