/***
|Name|ZonePlugin|
|Description|Partition a single-page-plugin-powered tiddlywiki into zones|
|Source|http://tiddlyguv.org/ZonePlugin.html#ZonePlugin|
|Documentation|http://tiddlyguv.org/ZonePlugin.html#ZonePluginInfo|
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

/*******************************************************************************
* Initialisation and hijacking
*******************************************************************************/

var latestTiddler = null;

var origRestart = restart;
var zonesByTag = {};

window.restart = function() {
  origRestart();
  buildZonesMap(); // TODO call on refresh
  startZone();
}

origDisplayTiddler = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(dontCare, tiddler, etc, etc) {
  origDisplayTiddler.apply(this, arguments);
  startZone();
}

/*******************************************************************************
* Zone plugin functions
*******************************************************************************/

function startZone() {
  var tiddler = getFirstTiddlerInStory();
  log("tiddler", tiddler);
  if (!tiddler) return;
  var zone = findZone(tiddler);
  window.eval(store.getRecursiveTiddlerText(zone+"ZoneInit", "", 10));
  setStylesheet(store.getRecursiveTiddlerText(zone+"ZoneStylesheet", "", 10));
}

function buildZonesMap() {
  var zonesTiddler = store.getTiddler("Zones");
  var zoneSlices = store.calcAllSlices("Zones");
  for (var zone in zoneSlices) {
    var tags = zoneSlices[zone].split(",");
    for (var i=0; i<tags.length; i++) {
      var tag = trim(tags[i]);
      zonesByTag[tag] = zone;
    }
  }
}

function findZone(tiddler) {
  for (var i=0; i<tiddler.tags.length; i++) {
    var tag = tiddler.tags[i];
    log("tiddler tag ", tag);
    if (zonesByTag[tag]) return zonesByTag[tag];
  }
}

/*******************************************************************************
* TiddlyWiki Generic
*******************************************************************************/

function getFirstTiddlerInStory() {
  var currentTiddlerEl = story.getContainer().firstChild;
  log("current", currentTiddlerEl);
  if (currentTiddlerEl) {
    var currentTiddlerTitle = currentTiddlerEl.getAttribute("tiddler");
    return store.getTiddler(currentTiddlerTitle);
  }
}

/*******************************************************************************
* Generic
*******************************************************************************/

function trim(s) { return s.replace(/^\s+|\s+$/g,""); }
function log() { console.log.apply(null, arguments); }
