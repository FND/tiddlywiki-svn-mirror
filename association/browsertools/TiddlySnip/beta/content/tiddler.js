var loadedTW = null;
var loaded = true;

function previewTiddler()
{
    var category = window.arguments[0];
    var mode =  window.arguments[1];
    var title = window.arguments[2];
    var tags = window.arguments [3];
    var text = window.arguments [4];
    document.getElementById("tiddlerTitle").value = title;
    document.getElementById("tiddlerTags").value = tags;
    document.getElementById("tiddlerText").value = text;
    if (isOnline())
        {
        var server = getServerType();
        if (server == "upload")
            getLock();
        else if (server == "mts")
            {
            mtslogin();
            //do mts login
            //fetch store type and tiddler listing, attach to window
            //enable save button
            }
        document.getElementById("tiddlerSaveButton").disabled = true;
        }
}

function getLock()
{
    var url = pref.getCharPref("tiddlysnip.uploadstoreurl").replace("store","lock") + "?action=status";
    req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function()
        {
        var locked = false;
        if (req.readyState == 4) {
            if(req.status == 200) {
                if(req.responseText.indexOf("file is locked")!=-1)
                    locked = true;
                }
            }
        if (locked)
            alert(getStr("twLocked"));
        else
            downloadTW();
        }
    req.send(null);
}

function downloadTW()
{
    var url = pref.getCharPref("tiddlysnip.wikifile");
	if (isOnline())
	    url += "?"+new Date().convertToYYYYMMDDHHMMSSMMM();
    var w = window;
    var request;
	loaded = false;
	loadedTW = null;
	request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function ()
        {
		if (request.readyState == 4) {
			if(request.status == 200) {
				w.loadedTW = request.responseText;
				w.loaded = true;
				document.getElementById("tiddlerSaveButton").disabled = false;
			}
			else
				alert(getStr("cantDownloadTW"));
		}
	};
	request.setRequestHeader('Cache-Control','no-store');
    request.setRequestHeader('Cache-Control','no-cache');
    request.setRequestHeader('Pragma','no-cache');
	request.send(null);
}

function saveTiddlerWindow(tw)
{
    //get server type and tiddler list as second param here
    var title = document.getElementById("tiddlerTitle").value;
    var mts = isOnline() && (getServerType()=="mts");
    var tiddlerExists = false;
    
    if (mts)
        {
        //check for tiddler exists, tiddlerExists = true if does
        }
    else
       {
        var fileLoc = pref.getCharPref("tiddlysnip.wikifile");
        if (tw == null)
            tw = readFile(fileLoc);
        var storeStart = findTwStore(tw);
        if (storeStart == -1)
            {
            alert(getStr("notValidTW"));
            tiddlySnipPrefs();
            return false;
            }
        var tiddlerMarkers = findTiddler(tw,title);
        if (tiddlerMarkers[0] !=-1)
            tiddlerExists = true;
       }


    if (tiddlerExists)
        {
        var params = {title: title, writeMode: null};
        window.openDialog("existDialog.xul","existWindow","chrome,centerscreen,modal",params);
        var writeMode = params.writeMode;
        if(writeMode == null)
            return false;
        }
    var text = document.getElementById("tiddlerText").value;
    var tags = document.getElementById("tiddlerTags").value;
    var mode =  window.arguments[1];
    var category = window.arguments[0];
    var newTW = window.opener.modifyTW(writeMode,tw,storeStart,tiddlerMarkers,category,mode,title,tags,text);
    window.close();
    window.opener.saveTW(fileLoc,tw,newTW,title);
}