/***
RemoteBackgroundPlugin v1.0 (2007-02-19)
 by FND

Retrieves a random image from XKCD and uses it as background image.

''N.B.:'' Do not abuse this; retrieving the images from XKCD could be regarded as hotlinking!
!!Changelog
!!!v0.9 (2007-02-18)
* initial release
!!!v1.0 (2007-02-19)
* added ability to position background image
* minor code adjustments
!!ToDo
* wait until TiddlyWiki loaded has completed before loading remote data
* extensive bug-testing (esp. non-Mozilla browsers)
!!Code
***/
/*{{{*/
setBgImg();

// set background image
function setBgImg() {
	if (img() != null) {
		document.body.style.backgroundImage = "url(" + img()[0] + ")";
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundPosition = "center";
		document.body.style.backgroundAttachment = "fixed";
		document.body.title = img()[1];
	} else {
		alert("error fetching remote image");
	}
}

// fetch image URL
function img() {
	// get remote location
	var maxCount = 225; // current amount of comcics - 2007-02-19
	var counter = Math.ceil(Math.random() * maxCount);
	var remoteSite = "http://xkcd.com/c" + counter + ".html";
	// fetch remote image
	var XmlHttp = true;
	var source = null;
	try { // query for permission to access remote file
		netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	} catch (e) {
		XmlHttp = false;
	}
	// initiate XmlHttp
	if (typeof XMLHttpRequest != 'undefined') { // Mozilla, Opera, Safari and Internet Explorer 7
		XmlHttp = new XMLHttpRequest();
	}
	if (!XmlHttp) { // Internet Explorer 6 and older
		try {
			XmlHttp  = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {
			try {
				XmlHttp  = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				XmlHttp  = null;
			}
		}
	}
	// get remote document
	if (XmlHttp != false) {
		XmlHttp = new XMLHttpRequest();
		if (XmlHttp) {
			// establish connection
			XmlHttp.open('GET', remoteSite, false);
			XmlHttp.send(null);
			// get image URL
			//source = XmlHttp.responseXML.getElementsByTagName('img')[1].src; // source data no valid XML => RexEx workaround
			var extract = XmlHttp.responseText.match(/<img src="(.+)" title="(.+)" alt/i);
			image = new Array(extract[1], extract[2]); // store URL and title value
		}
	}
	return image;
}
/*}}}*/