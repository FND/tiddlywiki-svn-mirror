/***
|Name|TagSuggest|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

!StyleSheet
.ac_results {
	padding: 0px;
	border: 1px solid WindowFrame;
	background-color: Window;
	overflow: hidden;
}

.ac_results ul {
	width: 100%;
	list-style-position: outside;
	list-style: none;
	padding: 0;
	margin: 0;
}

.ac_results iframe {
	display:none;
	position:absolute;
	top:0;
	left:0;
	z-index:-1;
	filter:mask();
	width:3000px;
	height:3000px;
}

.ac_results li {
	margin: 0px;
	padding: 2px 5px;
	cursor: pointer;
	display: block;
	width: 100%;
	font: menu;
	font-size: 12px;
	overflow: hidden;
}

.ac_loading {
	background : Window url('./indicator.gif') right center no-repeat;
}

.ac_over {
	background-color: Highlight;
	color: HighlightText;
}

.tagSuggest { margin-top: 2px; }
.tagView { float: left; padding: 5px 10px 5px 0; }
.tagView div { float: left; }
.tagSuggest button { margin-left: 5px; }
.tagDelete { cursor: pointer; color: #00b; margin: auto 5px; }
.clearance { clear: both; height: 1px; }

!Javascript
{{{
***/

(function($) {

  version.extensions.tagSuggest = {installed:true};
  version.extensions.tagHelper = {installed:true};

  version.extensions.tagHelper.getTagRecords = function(options) {

    var settings = $.extend({
      filterTag: null,
      excludeTags: ["systemConfig", "systemTheme", "excludeSearch", "excludeLists"],
      prefix: null
    }, options);

    var tiddlers = settings.filterTag ? store.getTaggedTiddlers(settings.filterTag) : store.getTiddlers();
    var tagRecords = [];
    _.each(tiddlers, function(tiddler) {
      _.each(tiddler.tags, function(tag) {
        if (  (!settings.excludeTags || settings.excludeTags.indexOf(tag)==-1)
           && (!settings.prefix || tag.substr(0,settings.prefix.length)==settings.prefix) ) {
          var tagRecord =
            _.detect(tagRecords, function(tagRecord) { return tagRecord.tag==tag; }) 
            || tagRecords.push({ tag: tag, count: 0 });
          tagRecord.count++;
        }
      });
    });
    if (options.quantity) {
      tagRecords.sort(function(a,b) { return a.count > b.count ? 1 : -1; });
      tagRecords = tagRecords.slice(0,options.quantity);
    }
    tagRecords.sort(function(a,b) { return a.tag > b.tag ? 1 : -1; });
    return tagRecords;
  };

  version.extensions.tagHelper.getTags = function(options) {
    return _.pluck(version.extensions.tagHelper.getTagRecords(options), "tag");
  };

  version.extensions.tagSuggest.enhanceEditTemplate = function() {
    var template = config.shadowTiddlers.EditTemplate;
    if ((/tagSuggest/g).test(template)) return; // already enhanced
    var tagsDiv =       "<div class='editor' macro='edit tags'></div>";
    var tagsDivHidden = "<div class='editor' macro='edit tags' style='display:block;></div>";
    var tagSuggestDiv = "<div class='tagSuggest' macro='tagSuggest'></div>";
    config.shadowTiddlers.EditTemplate = template.replace(tagsDiv,tagSuggestDiv+"\n"+tagsDivHidden);
  };

  var macro = config.macros.tagSuggest = {

    init: function() {
      var stylesheet = store.getTiddlerText("TagSuggest##StyleSheet");
      config.shadowTiddlers["StyleSheetTagSuggest"] = stylesheet;
      store.addNotification("StyleSheetTagSuggest", refreshStyles);
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var $tagsContainer = $("<div/>")
        .appendTo(place)
        .data("tiddler", tiddler)
        .data("params", paramString.parseParams());
      var prefix = getParam(paramString.parseParams(), "prefix") || "";
      var unprefixedTags = _.select(tiddler.tags, function(tag) {
        return tag.indexOf(prefix)===0;
      });
      unprefixedTags = _.map(unprefixedTags, function(tag) {
        return tag.replace(prefix, "");
      });
      $tagsContainer.data("tags", unprefixedTags);
      var $tagInput = $("<input class='tagInput'/>")
        .keydown(function(ev) {
          if (ev.keyCode==13) {
            if ($(".ac_results").css("display")=="none") addTag(ev.target.value, $tagsContainer);
            return false;
          }
        })
        .appendTo($tagsContainer);
      var $add = $("<button>add tag</button>").appendTo($tagsContainer)
        .click(function() {
          addTag($(this).siblings(".tagInput").val(), $tagsContainer);
        });
      $tags = $("<div class='tagsView'/>").appendTo($tagsContainer);
      $("<div class='.clearance'>&nbsp;</div>").appendTo($tagsContainer);
      updateTags($tagsContainer);
      makeAutoComplete($tagsContainer);
    }

  };

  function addTag(tagName, $tagsContainer) {
    var tags = $tagsContainer.data("tags");
    if (tags.indexOf(tagName)==-1) {
      $tagsContainer.data("tags").push(tagName);
      updateTags($tagsContainer);
    }
    $(".tagInput", $tagsContainer).val("");
  }

  function updateTags($tagsContainer) {
    $tagsContainer.data("tags").sort();
    var $tagsView = $(".tagsView", $tagsContainer).empty();
    $.each($tagsContainer.data("tags"), (function(i, tag) {
      var $tag = $("<div class='tagView'>").appendTo($tagsView);
      $("<div class='tagName'/>").text(tag).appendTo($tag);
      $("<div class='tagDelete'/>").text("x").appendTo($tag).click(function() {
        $tagsContainer.data("tags").remove(tag);
        updateTags($tagsContainer);
      });
    }));

    var $realTags = $tagsContainer.parents(".tiddler").find("[edit=tags]");
    console.log("TC", $tagsContainer.length, $tagsContainer, "RT", $realTags.length, "sel", $realTags.selector);
    if (!$realTags.length) return;
    var prefix = getParam($tagsContainer.data("params"), "prefix") || "";
    var unprefixedRealTags = _.select($realTags.val().split(/ +/), function(tag) {
      return tag.indexOf(prefix)!=0;
    });
    chosenPrefixedTags = $tagsContainer.data("tags").map(function(tag) {
      return prefix+tag;
    });
    $realTags.val((unprefixedRealTags.concat(chosenPrefixedTags)).sort().join(" "));
    // makeAutoComplete($tagsContainer);
  };

  function makeAutoComplete($tagsContainer) {
    var params = $tagsContainer.data("params"),
      chosenTags = $tagsContainer.data("tags")
      prefix = getParam(params, "prefix");
    var candidateTags = version.extensions.tagHelper.getTags({
      filterTag: getParam(params, "filterTag"),
      excludeTags: (getParam(params, "excludeTags") || "").split(","),
      prefix: prefix
    });
    console.log("cand 2", candidateTags, "chosen", chosenTags);
    candidateTags = _.select(candidateTags, function(tag) {
      return chosenTags.indexOf(tag)==-1;
    });
    console.log("cand after", candidateTags);
    if (prefix) candidateTags = _.map(candidateTags, function(tag) {
      return tag.replace(prefix, "");
    });
    $(".tagInput", $tagsContainer).autocompleteArray(candidateTags, { 
      onItemSelect: function(li) {
        addTag(li.innerHTML, $tagsContainer);
      }
    });
  }

// http://project.mahemoff.com/autocomplete
// adapted from http://www.pengoworks.com/workshop/jquery/autocomplete.htm 
jQuery.autocomplete = function(input, options) {
	// Create a link to self
	var me = this;

	// Create jQuery object for input element
	var $input = $(input).attr("autocomplete", "off");

	// Apply inputClass if necessary
	if (options.inputClass) $input.addClass(options.inputClass);

	// Create results
	var results = document.createElement("div");
	// Create jQuery object for results
	var $results = $(results);
	$results.hide().addClass(options.resultsClass).css("position", "absolute");
	if( options.width > 0 ) $results.css("width", options.width);

	// Add to body element
	$("body").append(results);

	input.autocompleter = me;

	var timeout = null;
	var prev = "";
	var active = -1;
	var cache = {};
	var keyb = false;
	var hasFocus = false;
	var lastKeyPressCode = null;

	// flush cache
	function flushCache(){
		cache = {};
		cache.data = {};
		cache.length = 0;
	};

	// flush cache
	flushCache();

	// if there is a data array supplied
	if( options.data != null ){
		var sFirstChar = "", stMatchSets = {}, row = [];

		// no url was specified, we need to adjust the cache length to make sure it fits the local data store
		if( typeof options.url != "string" ) options.cacheLength = 1;

		// loop through the array and create a lookup structure
		for( var i=0; i < options.data.length; i++ ){
			// if row is a string, make an array otherwise just reference the array
			row = ((typeof options.data[i] == "string") ? [options.data[i]] : options.data[i]);

			// if the length is zero, don't add to list
			if( row[0].length > 0 ){
				// get the first character
				sFirstChar = row[0].substring(0, 1).toLowerCase();
				// if no lookup array for this character exists, look it up now
				if( !stMatchSets[sFirstChar] ) stMatchSets[sFirstChar] = [];
				// if the match is a string
				stMatchSets[sFirstChar].push(row);
			}
		}

		// add the data items to the cache
		for( var k in stMatchSets ){
			// increase the cache size
			options.cacheLength++;
			// add to the cache
			addToCache(k, stMatchSets[k]);
		}
	}

	$input
	.keydown(function(e) {
		// track last key pressed
		lastKeyPressCode = e.keyCode;
		switch(e.keyCode) {
			case 38: // up
				e.preventDefault();
				moveSelect(-1);
				break;
			case 40: // down
				e.preventDefault();
				moveSelect(1);
				break;
			case 9:  // tab
			case 13: // return
				if( selectCurrent() ){
					e.preventDefault();
				}
				break;
			case 32: // space
				if( selectCurrent() ){
					e.preventDefault();
				}
				break;
			default:
				active = -1;
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(function(){onChange();}, options.delay);
				break;
		}
	})
	.focus(function(){
		// track whether the field has focus, we shouldn't process any results if the field no longer has focus
		hasFocus = true;
	})
	.blur(function() {
		// track whether the field has focus
		hasFocus = false;
		hideResults();
	});

	hideResultsNow();

	function onChange() {
		// ignore if the following keys are pressed: [del] [shift] [capslock]
		if( lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32) ) return $results.hide();
    var v = $input.val().replace(/^.*?(\S+)$/, "$1");
		if (v == prev) return;
		prev = v;
		if (v.length >= options.minChars) {
			$input.addClass(options.loadingClass);
			requestData(v);
		} else {
			$input.removeClass(options.loadingClass);
			$results.hide();
		}
	};

 	function moveSelect(step) {

		var lis = $("li", results);
		if (!lis) return;

		active += step;

		if (active < 0) {
			active = 0;
		} else if (active >= lis.size()) {
			active = lis.size() - 1;
		}

		lis.removeClass("ac_over");

		$(lis[active]).addClass("ac_over");

		// Weird behaviour in IE
		// if (lis[active] && lis[active].scrollIntoView) {
		// 	lis[active].scrollIntoView(false);
		// }

	};

	function selectCurrent() {
		var li = $("li.ac_over", results)[0];
		if (!li) {
			var $li = $("li", results);
			if (options.selectOnly) {
				if ($li.length == 1) li = $li[0];
			} else if (options.selectFirst) {
				li = $li[0];
			}
		}
		if (li) {
			selectItem(li);
			return true;
		} else {
			return false;
		}
	};

	function selectItem(li) {
		if (!li) {
			li = document.createElement("li");
			li.extra = [];
			li.selectValue = "";
		}
		var v = $.trim(li.selectValue ? li.selectValue : li.innerHTML);
		input.lastSelected = v;
		prev = v;
		$results.html("");
    $input.val($input.val().replace(/(\S+)$/, v+" "));
		hideResultsNow();
		if (options.onItemSelect) setTimeout(function() { options.onItemSelect(li); }, 1);
	};

	// selects a portion of the input string
	function createSelection(start, end){
		// get a reference to the input element
		var field = $input.get(0);
		if( field.createTextRange ){
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart("character", start);
			selRange.moveEnd("character", end);
			selRange.select();
		} else if( field.setSelectionRange ){
			field.setSelectionRange(start, end);
		} else {
			if( field.selectionStart ){
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
		field.focus();
	};

	// fills in the input box w/the first match (assumed to be the best match)
	function autoFill(sValue){
		// if the last user key pressed was backspace, don't autofill
		if( lastKeyPressCode != 8 ){
			// fill in the value (keep the case the user has typed)
			$input.val($input.val() + sValue.substring(prev.length));
			// select the portion of the value not typed by the user (so the next character will erase)
			createSelection(prev.length, sValue.length);
		}
	};

	function showResults() {
		// get the position of the input field right now (in case the DOM is shifted)
		var pos = findPos(input);
		// either use the specified width, or autocalculate based on form element
		var iWidth = (options.width > 0) ? options.width : $input.width();
		// reposition
		$results.css({
			width: parseInt(iWidth) + "px",
			top: (pos.y + input.offsetHeight) + "px",
			left: pos.x + "px"
		}).show();
	};

	function hideResults() {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(hideResultsNow, 200);
	};

	function hideResultsNow() {
		if (timeout) clearTimeout(timeout);
		$input.removeClass(options.loadingClass);
		if ($results.is(":visible")) {
			$results.hide();
		}
		if (options.mustMatch) {
			var v = $input.val();
			if (v != input.lastSelected) {
				selectItem(null);
			}
		}
	};

	function receiveData(q, data) {
		if (data) {
			$input.removeClass(options.loadingClass);
			results.innerHTML = "";

			// if the field no longer has focus or if there are no matches, do not display the drop down
			if( !hasFocus || data.length == 0 ) return hideResultsNow();

			if ($.browser.msie) {
				// we put a styled iframe behind the calendar so HTML SELECT elements don't show through
				$results.append(document.createElement('iframe'));
			}
			results.appendChild(dataToDom(data));
			// autofill in the complete box w/the first match as long as the user hasn't entered in more data
			if( options.autoFill && ($input.val().toLowerCase() == q.toLowerCase()) ) autoFill(data[0][0]);
			showResults();
		} else {
			hideResultsNow();
		}
	};

	function parseData(data) {
		if (!data) return null;
		var parsed = [];
		var rows = data.split(options.lineSeparator);
		for (var i=0; i < rows.length; i++) {
			var row = $.trim(rows[i]);
			if (row) {
				parsed[parsed.length] = row.split(options.cellSeparator);
			}
		}
		return parsed;
	};

	function dataToDom(data) {
		var ul = document.createElement("ul");
		var num = data.length;

		// limited results to a max number
		if( (options.maxItemsToShow > 0) && (options.maxItemsToShow < num) ) num = options.maxItemsToShow;

		for (var i=0; i < num; i++) {
			var row = data[i];
			if (!row) continue;
			var li = document.createElement("li");
			if (options.formatItem) {
				li.innerHTML = options.formatItem(row, i, num);
				li.selectValue = row[0];
			} else {
				li.innerHTML = row[0];
				li.selectValue = row[0];
			}
			var extra = null;
			if (row.length > 1) {
				extra = [];
				for (var j=1; j < row.length; j++) {
					extra[extra.length] = row[j];
				}
			}
			li.extra = extra;
			ul.appendChild(li);
			$(li).hover(
				function() { $("li", ul).removeClass("ac_over"); $(this).addClass("ac_over"); active = $("li", ul).indexOf($(this).get(0)); },
				function() { $(this).removeClass("ac_over"); }
			).click(function(e) { e.preventDefault(); e.stopPropagation(); selectItem(this) });
		}
		return ul;
	};

	function requestData(q) {
		if (!options.matchCase) q = q.toLowerCase();
		var data = options.cacheLength ? loadFromCache(q) : null;
		// recieve the cached data
		if (data) {
			receiveData(q, data);
		// if an AJAX url has been supplied, try loading the data now
		} else if( (typeof options.url == "string") && (options.url.length > 0) ){
			$.get(makeUrl(q), function(data) {
				data = parseData(data);
				addToCache(q, data);
				receiveData(q, data);
			});
		// if there's been no data found, remove the loading class
		} else {
			$input.removeClass(options.loadingClass);
		}
	};

	function makeUrl(q) {
		var url = options.url + "?q=" + encodeURI(q);
		for (var i in options.extraParams) {
			url += "&" + i + "=" + encodeURI(options.extraParams[i]);
		}
		return url;
	};

	function loadFromCache(q) {
		if (!q) return null;
		if (cache.data[q]) return cache.data[q];
		if (options.matchSubset) {
			for (var i = q.length - 1; i >= options.minChars; i--) {
				var qs = q.substr(0, i);
				var c = cache.data[qs];
				if (c) {
					var csub = [];
					for (var j = 0; j < c.length; j++) {
						var x = c[j];
						var x0 = x[0];
						if (matchSubset(x0, q)) {
							csub[csub.length] = x;
						}
					}
					return csub;
				}
			}
		}
		return null;
	};

	function matchSubset(s, sub) {
		if (!options.matchCase) s = s.toLowerCase();
		var i = s.indexOf(sub);
		if (i == -1) return false;
		return i == 0 || options.matchContains;
	};

	this.flushCache = function() {
		flushCache();
	};

	this.setExtraParams = function(p) {
		options.extraParams = p;
	};

	this.findValue = function(){
		var q = $input.val();

		if (!options.matchCase) q = q.toLowerCase();
		var data = options.cacheLength ? loadFromCache(q) : null;
		if (data) {
			findValueCallback(q, data);
		} else if( (typeof options.url == "string") && (options.url.length > 0) ){
			$.get(makeUrl(q), function(data) {
				data = parseData(data)
				addToCache(q, data);
				findValueCallback(q, data);
			});
		} else {
			// no matches
			findValueCallback(q, null);
		}
	}

	function findValueCallback(q, data){
		if (data) $input.removeClass(options.loadingClass);

		var num = (data) ? data.length : 0;
		var li = null;

		for (var i=0; i < num; i++) {
			var row = data[i];

			if( row[0].toLowerCase() == q.toLowerCase() ){
				li = document.createElement("li");
				if (options.formatItem) {
					li.innerHTML = options.formatItem(row, i, num);
					li.selectValue = row[0];
				} else {
					li.innerHTML = row[0];
					li.selectValue = row[0];
				}
				var extra = null;
				if( row.length > 1 ){
					extra = [];
					for (var j=1; j < row.length; j++) {
						extra[extra.length] = row[j];
					}
				}
				li.extra = extra;
			}
		}

		if( options.onFindValue ) setTimeout(function() { options.onFindValue(li) }, 1);
	}

	function addToCache(q, data) {
		if (!data || !q || !options.cacheLength) return;
		if (!cache.length || cache.length > options.cacheLength) {
			flushCache();
			cache.length++;
		} else if (!cache[q]) {
			cache.length++;
		}
		cache.data[q] = data;
	};

	function findPos(obj) {
		var curleft = obj.offsetLeft || 0;
		var curtop = obj.offsetTop || 0;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
		return {x:curleft,y:curtop};
	}
}

jQuery.fn.autocomplete = function(url, options, data) {
	// Make sure options exists
	options = options || {};
	// Set url as option
	options.url = url;
	// set some bulk local data
	options.data = ((typeof data == "object") && (data.constructor == Array)) ? data : null;

	// Set default values for required options
	options.inputClass = options.inputClass || "ac_input";
	options.resultsClass = options.resultsClass || "ac_results";
	options.lineSeparator = options.lineSeparator || "\n";
	options.cellSeparator = options.cellSeparator || "|";
	options.minChars = options.minChars || 1;
	options.delay = options.delay || 400;
	options.matchCase = options.matchCase || 0;
	options.matchSubset = options.matchSubset || 1;
	options.matchContains = options.matchContains || 0;
	options.cacheLength = options.cacheLength || 1;
	options.mustMatch = options.mustMatch || 0;
	options.extraParams = options.extraParams || {};
	options.loadingClass = options.loadingClass || "ac_loading";
	options.selectFirst = options.selectFirst || false;
	options.selectOnly = options.selectOnly || false;
	options.maxItemsToShow = options.maxItemsToShow || -1;
	options.autoFill = options.autoFill || false;
	options.width = parseInt(options.width, 10) || 0;

	this.each(function() {
		var input = this;
		new jQuery.autocomplete(input, options);
	});

	// Don't break the chain
	return this;
}

jQuery.fn.autocompleteArray = function(data, options) {
	return this.autocomplete(null, options, data);
}

jQuery.fn.indexOf = function(e){
	for( var i=0; i<this.length; i++ ){
		if( this[i] == e ) return i;
	}
	return -1;
};

// underscore
(function(){var j=this,n=j._,i=function(a){this._wrapped=a},m=typeof StopIteration!=="undefined"?StopIteration:"__break__",b=j._=function(a){return new i(a)};if(typeof exports!=="undefined")exports._=b;var k=Array.prototype.slice,o=Array.prototype.unshift,p=Object.prototype.toString,q=Object.prototype.hasOwnProperty,r=Object.prototype.propertyIsEnumerable;b.VERSION="0.5.7";b.each=function(a,c,d){try{if(a.forEach)a.forEach(c,d);else if(b.isArray(a)||b.isArguments(a))for(var e=0,f=a.length;e<f;e++)c.call(d,
a[e],e,a);else{var g=b.keys(a);f=g.length;for(e=0;e<f;e++)c.call(d,a[g[e]],g[e],a)}}catch(h){if(h!=m)throw h;}return a};b.map=function(a,c,d){if(a&&b.isFunction(a.map))return a.map(c,d);var e=[];b.each(a,function(f,g,h){e.push(c.call(d,f,g,h))});return e};b.reduce=function(a,c,d,e){if(a&&b.isFunction(a.reduce))return a.reduce(b.bind(d,e),c);b.each(a,function(f,g,h){c=d.call(e,c,f,g,h)});return c};b.reduceRight=function(a,c,d,e){if(a&&b.isFunction(a.reduceRight))return a.reduceRight(b.bind(d,e),c);
var f=b.clone(b.toArray(a)).reverse();b.each(f,function(g,h){c=d.call(e,c,g,h,a)});return c};b.detect=function(a,c,d){var e;b.each(a,function(f,g,h){if(c.call(d,f,g,h)){e=f;b.breakLoop()}});return e};b.select=function(a,c,d){if(a&&b.isFunction(a.filter))return a.filter(c,d);var e=[];b.each(a,function(f,g,h){c.call(d,f,g,h)&&e.push(f)});return e};b.reject=function(a,c,d){var e=[];b.each(a,function(f,g,h){!c.call(d,f,g,h)&&e.push(f)});return e};b.all=function(a,c,d){c=c||b.identity;if(a&&b.isFunction(a.every))return a.every(c,
d);var e=true;b.each(a,function(f,g,h){(e=e&&c.call(d,f,g,h))||b.breakLoop()});return e};b.any=function(a,c,d){c=c||b.identity;if(a&&b.isFunction(a.some))return a.some(c,d);var e=false;b.each(a,function(f,g,h){if(e=c.call(d,f,g,h))b.breakLoop()});return e};b.include=function(a,c){if(b.isArray(a))return b.indexOf(a,c)!=-1;var d=false;b.each(a,function(e){if(d=e===c)b.breakLoop()});return d};b.invoke=function(a,c){var d=b.rest(arguments,2);return b.map(a,function(e){return(c?e[c]:e).apply(e,d)})};b.pluck=
function(a,c){return b.map(a,function(d){return d[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);var e={computed:-Infinity};b.each(a,function(f,g,h){g=c?c.call(d,f,g,h):f;g>=e.computed&&(e={value:f,computed:g})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);var e={computed:Infinity};b.each(a,function(f,g,h){g=c?c.call(d,f,g,h):f;g<e.computed&&(e={value:f,computed:g})});return e.value};b.sortBy=function(a,c,d){return b.pluck(b.map(a,
function(e,f,g){return{value:e,criteria:c.call(d,e,f,g)}}).sort(function(e,f){e=e.criteria;f=f.criteria;return e<f?-1:e>f?1:0}),"value")};b.sortedIndex=function(a,c,d){d=d||b.identity;for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?(e=g+1):(f=g)}return e};b.toArray=function(a){if(!a)return[];if(a.toArray)return a.toArray();if(b.isArray(a))return a;if(b.isArguments(a))return k.call(a);return b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=function(a,c,d){return c&&!d?k.call(a,
0,c):a[0]};b.rest=function(a,c,d){return k.call(a,b.isUndefined(c)||d?1:c)};b.last=function(a){return a[a.length-1]};b.compact=function(a){return b.select(a,function(c){return!!c})};b.flatten=function(a){return b.reduce(a,[],function(c,d){if(b.isArray(d))return c.concat(b.flatten(d));c.push(d);return c})};b.without=function(a){var c=b.rest(arguments);return b.select(a,function(d){return!b.include(c,d)})};b.uniq=function(a,c){return b.reduce(a,[],function(d,e,f){if(0==f||(c===true?b.last(d)!=e:!b.include(d,
e)))d.push(e);return d})};b.intersect=function(a){var c=b.rest(arguments);return b.select(b.uniq(a),function(d){return b.all(c,function(e){return b.indexOf(e,d)>=0})})};b.zip=function(){for(var a=b.toArray(arguments),c=b.max(b.pluck(a,"length")),d=new Array(c),e=0;e<c;e++)d[e]=b.pluck(a,String(e));return d};b.indexOf=function(a,c){if(a.indexOf)return a.indexOf(c);for(var d=0,e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,c){if(a.lastIndexOf)return a.lastIndexOf(c);for(var d=
a.length;d--;)if(a[d]===c)return d;return-1};b.range=function(a,c,d){var e=b.toArray(arguments),f=e.length<=1;a=f?0:e[0];c=f?e[0]:e[1];d=e[2]||1;e=Math.ceil((c-a)/d);if(e<=0)return[];e=new Array(e);f=a;for(var g=0;;f+=d){if((d>0?f-c:c-f)>=0)return e;e[g++]=f}};b.bind=function(a,c){var d=b.rest(arguments,2);return function(){return a.apply(c||j,d.concat(b.toArray(arguments)))}};b.bindAll=function(a){var c=b.rest(arguments);if(c.length==0)c=b.functions(a);b.each(c,function(d){a[d]=b.bind(a[d],a)});
return a};b.delay=function(a,c){var d=b.rest(arguments,2);return setTimeout(function(){return a.apply(a,d)},c)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(b.rest(arguments)))};b.wrap=function(a,c){return function(){var d=[a].concat(b.toArray(arguments));return c.apply(c,d)}};b.compose=function(){var a=b.toArray(arguments);return function(){for(var c=b.toArray(arguments),d=a.length-1;d>=0;d--)c=[a[d].apply(this,c)];return c[0]}};b.keys=function(a){if(b.isArray(a))return b.range(0,a.length);
var c=[];for(var d in a)q.call(a,d)&&c.push(d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=function(a){return b.select(b.keys(a),function(c){return b.isFunction(a[c])}).sort()};b.extend=function(a,c){for(var d in c)a[d]=c[d];return a};b.clone=function(a){if(b.isArray(a))return a.slice(0);return b.extend({},a)};b.tap=function(a,c){c(a);return a};b.isEqual=function(a,c){if(a===c)return true;var d=typeof a;if(d!=typeof c)return false;if(a==c)return true;if(!a&&c||a&&!c)return false;
if(a.isEqual)return a.isEqual(c);if(b.isDate(a)&&b.isDate(c))return a.getTime()===c.getTime();if(b.isNaN(a)&&b.isNaN(c))return true;if(b.isRegExp(a)&&b.isRegExp(c))return a.source===c.source&&a.global===c.global&&a.ignoreCase===c.ignoreCase&&a.multiline===c.multiline;if(d!=="object")return false;if(a.length&&a.length!==c.length)return false;d=b.keys(a);var e=b.keys(c);if(d.length!=e.length)return false;for(var f in a)if(!b.isEqual(a[f],c[f]))return false;return true};b.isEmpty=function(a){return b.keys(a).length==
0};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=function(a){return!!(a&&a.concat&&a.unshift)};b.isArguments=function(a){return a&&b.isNumber(a.length)&&!a.concat&&!a.substr&&!a.apply&&!r.call(a,"length")};b.isFunction=function(a){return!!(a&&a.constructor&&a.call&&a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};b.isNumber=function(a){return a===+a||p.call(a)==="[object Number]"};b.isDate=function(a){return!!(a&&a.getTimezoneOffset&&a.setUTCFullYear)};
b.isRegExp=function(a){return!!(a&&a.test&&a.exec&&(a.ignoreCase||a.ignoreCase===false))};b.isNaN=function(a){return b.isNumber(a)&&isNaN(a)};b.isNull=function(a){return a===null};b.isUndefined=function(a){return typeof a=="undefined"};b.noConflict=function(){j._=n;return this};b.identity=function(a){return a};b.breakLoop=function(){throw m;};var s=0;b.uniqueId=function(a){var c=s++;return a?a+c:c};b.templateSettings={start:"<%",end:"%>",interpolate:/<%=(.+?)%>/g};b.template=function(a,c){var d=b.templateSettings;
a=new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+a.replace(/[\r\t\n]/g," ").replace(new RegExp("'(?=[^"+d.end[0]+"]*"+d.end+")","g"),"\t").split("'").join("\\'").split("\t").join("'").replace(d.interpolate,"',$1,'").split(d.start).join("');").split(d.end).join("p.push('")+"');}return p.join('');");return c?a(c):a};b.forEach=b.each;b.foldl=b.inject=b.reduce;b.foldr=b.reduceRight;b.filter=b.select;b.every=b.all;b.some=b.any;b.head=b.first;b.tail=b.rest;
b.methods=b.functions;var l=function(a,c){return c?b(a).chain():a};b.each(b.functions(b),function(a){var c=b[a];i.prototype[a]=function(){var d=b.toArray(arguments);o.call(d,this._wrapped);return l(c.apply(b,d),this._chain)}});b.each(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var c=Array.prototype[a];i.prototype[a]=function(){c.apply(this._wrapped,arguments);return l(this._wrapped,this._chain)}});b.each(["concat","join","slice"],function(a){var c=Array.prototype[a];i.prototype[a]=
function(){return l(c.apply(this._wrapped,arguments),this._chain)}});i.prototype.chain=function(){this._chain=true;return this};i.prototype.value=function(){return this._wrapped}})();

})(jQuery);

/*}}}*/
