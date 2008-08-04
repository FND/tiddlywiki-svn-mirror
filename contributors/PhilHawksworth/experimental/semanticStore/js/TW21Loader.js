//--
//-- TW21Loader (inherits from LoaderBase)
//--

function TW21Loader() {}

TW21Loader.prototype = new LoaderBase();

TW21Loader.prototype.getTitle = function(store,node,shadow) 
{
	if(shadow) {
		var title = null;
		if(node.getAttribute) {
			title = node.getAttribute("title");
			if(!title)
				title = node.getAttribute("tiddler");
		}
		if(!title && node.id) {
			var lenPrefix = store.idPrefix.length;
			if(node.id.substr(0,lenPrefix) == store.idPrefix)
				title = node.id.substr(lenPrefix);
		}
	}
	else {
		var title = $(node).find('a.tiddlerName').attr('name').replace('tiddler:','');
	}
	
	return title;
};

TW21Loader.prototype.internalizeTiddler = function(store,tiddler,title,node,shadow)
{
	if (shadow) {
		var e = node.firstChild;
		var text = null;
		if(node.getAttribute("tiddler")) {
			text = getNodeText(e).unescapeLineBreaks();
		} else {
			while(e.nodeName!="PRE" && e.nodeName!="pre") {
				e = e.nextSibling;
			}
			text = e.innerHTML.replace(/\r/mg,"").htmlDecode();
		}
		var modifier = node.getAttribute("modifier");
		var c = node.getAttribute("created");
		var m = node.getAttribute("modified");
		var created = c ? Date.convertFromYYYYMMDDHHMM(c) : version.date;
		var modified = m ? Date.convertFromYYYYMMDDHHMM(m) : created;
		var tags = node.getAttribute("tags");
		var fields = {};
		var attrs = node.attributes;
		for(var i = attrs.length-1; i >= 0; i--) {
			var name = attrs[i].name;
			if(attrs[i].specified && !TiddlyWiki.isStandardField(name)) {
				fields[name] = attrs[i].value.unescapeLineBreaks();
			}
		}
		tiddler.assign(title,text,modifier,modified,tags,created,fields);		
	}
	else {
		var node = $(node);

		var data = {};
		data['title'] = node.find('h1.tiddlerName').text().replace(/ /g,'_');
		data['text'] = node.find('div.text').html();
		// data['tiddlerLinks'] = t.find('div.text a.tiddlerLink');
		data['tags'] = [];
		node.find('ul.tags li a').each(function(c,e){
			data.tags.push($(e).text());
		});
		data['tags'] = data['tags'].join(' ');

		data.fields = {};
		node.find('ul.meta li').each(function(c,m){
			var name = $(m).find('i').text();
			var val = $(m).find('span').text();
			if(!TiddlyWiki.isStandardField(name)) {
				data.fields[name] = val.unescapeLineBreaks();
			} else {
				if(name == 'modified' || name =='created' || name == 'modifier') {
					data[name] = val;
				}
			}
		});
		// 
		data.created = data.created ? Date.convertFromYYYYMMDDHHMM(data.created) : version.date;
		data.modified = data.modified? Date.convertFromYYYYMMDDHHMM(data.modified) : data.creaed;
		tiddler.assign(title,data.text, data.modifier,data.modified,data.tags,data.created,data.fields);
	}
	
	return tiddler;
};

