/***
|''Name:''|gmap|
|''Description:''|Display locations on a Google map|
|''~CoreVersion:''|2.6.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.GMapPlugin) {
version.extensions.GMapPlugin = {installed:true};

currentPos = {lat:0.0,lng:0.0,set:false};
userProfile = {fields:{}};

function getProfile(name)
{
	var urlTemplate = "%0/bags/%1/tiddlers/profile.json";
	var host = "http://openbritain.labs.osmosoft.com";

	var options = {type:'GET'};
	options.url = urlTemplate.format([host,name]);

	options.complete = function(xhr,textStatus) {
		if(jQuery.httpSuccess(xhr)) {
			try {
				var info = jQuery.parseJSON(xhr.responseText);
				userProfile = info;
			} catch (ex) {
				return;
			}
		} else {
			return;
		}
	};
	ajaxReq(options);
}

function getLocation(callback,params)
{
	console.log('getLocation');
	var success = function(pos) {
		currentPos.lat = pos.coords.latitude;
		currentPos.lng = pos.coords.longitude;
		currentPos.set = true;

		var latlng = new GLatLng(pos.coords.latitude,pos.coords.longitude);
		map.setCenter(latlng,12);
		var hereIcon = new GIcon(G_DEFAULT_ICON);
		hereIcon.image = "http://www.google.com/mapfiles/arrow.png";
		var marker = new GMarker(latlng,{icon:hereIcon});
		map.addOverlay(marker);
		if(callback) {
			callback(params);
		}
	};

	var error = function(err) {
		console.log('error');
		if (err.code == 1) {
			displayMessage("User said no");
		}
	};

	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success,error,{maximumAge:60000});
	}
}


function nearestToilets(params)
{
	if(currentPos.set) {
		getNearestToilets();
	} else {
		getLocation(getNearestToilets);
	}
}

function getNearestToilets()
{
	var urlTemplate = "%0/bags/openbritain/tiddlers.json?near=%1,%2,100km&sort=_geo.proximity&limit=%3";
	console.log('fields',userProfile.fields);
	if(userProfile && userProfile.fields.mobility=="1") {
		// mobility impaired
		urlTemplate = "%0/bags/openbritain/tiddlers.json?mobility:1&near=%1,%2,100km&sort=_geo.proximity&limit=%3";
	}
	var host = "http://openbritain.labs.osmosoft.com";
	var limit = 5;

	var options = {type:'GET'};
	options.url = urlTemplate.format([host,currentPos.lat,currentPos.lng,limit]);

	options.complete = function(xhr,textStatus) {
		console.log('complete');
		if(jQuery.httpSuccess(xhr)) {
			try {
				var infos = jQuery.parseJSON(xhr.responseText);
				console.log('info',infos[0]);
				for(var i=0;i<infos.length;i++) {
					var fields = infos[i]['fields'];
					var lat = parseFloat(fields['geo.lat']);
					var lng = parseFloat(fields['geo.long']);
					var latlng = new GLatLng(lat,lng);
					var icon = new GIcon(G_DEFAULT_ICON);
					icon.image = "http://www.google.com/mapfiles/marker"+String.fromCharCode(i+"A".charCodeAt(0))+".png";
					var title = infos[i].title;
					var marker = new GMarker(latlng,{icon:icon,title:title});
					map.addOverlay(marker);
					marker.bindInfoWindowHtml(title+'<br /><a href="'+fields.link+'">disabledgo</a>');
				}
			} catch (ex) {
				return;
			}
		} else {
			return;
		}
	};
	ajaxReq(options);
	return true;
}

config.macros.gmap = {};

config.macros.gmap.handler = function(place,macroName,params)
{
	//map = new GMap2(document.getElementById('mapDisplay'));
	map = new GMap2(place);
	map.setUIToDefault();
	if(params[0]) {
		nearestToilets(params[0]);
	} else {
		map.setCenter(new GLatLng(currentPos.lat,currentPos.lng), 12);
	}
};

} //# end of 'install only once'
//}}}
