/***
|''Name:''|ContactMacroPlugin|
|''Description:''|Manipulate contact information held as tiddlers|
|''Version:''|1.0.0|
|''Date:''|Jun 11, 2007|
|''Source:''|http://www.tiddlywiki.com/#ContactMacroPlugin|
|''Author:''|PaulDowney (paul.downey (at) whatfettle (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.2|
***/

//{{{
// Ensure that the ContactMacroPlugin Plugin is only installed once.
if(!version.extensions.ContactMacroPlugin) {
version.extensions.ContactMacroPlugin = {installed:true};

config.macros.contact = {

	debug: false,
	offline: false,

	hCardFields: [
		{hcard: 'org', names: ['Company','company','Organization','Organization','Org']},
		{hcard: 'fn', names: ['FullName', 'Fullname', 'fullName', 'fullname', 'name']},
		{hcard: 'fn.given-name', names: ['FirstName','First','Given','Firstname','GivenName']},
		{hcard: 'fn.additional-name', names: ['AdditionalName','MiddleName','Middlename','Middle','Additional','AdditionalName']},
		{hcard: 'fn.family-name', names: ['LastName','Lastname','Last','FamilyName','Surname']},

		{hcard: 'adr.street-address', names: ['Street','Street Address']},
		{hcard: 'adr.locality', names: ['Locality','City']},
		{hcard: 'adr.region', names: ['Region','State','County','Province']},
		{hcard: 'adr.postal-code', names: ['PostalCode','PostCode','Zip'],uri: 'http://maps.google.com/maps?q='},
		{hcard: 'adr.country-name', names: ['CountryName','Country']},

		{hcard: 'tel', names: ['tel','TEL','Tel','Telephone','Phone']},
		{hcard: 'tel.work', names: ['WorkTel','TelWork','WorkPhone','workPhone']},
		{hcard: 'tel.home', names: ['HomeTel','HomeTel','HomePhone','homePhone']},
		{hcard: 'tel.mobile', names: ['Mobile','MobileTel','Cell','CellNumber','CellNo']},

		{hcard: 'email', names: ['Email','email']},
		{hcard: 'email.work', names: ['EmailWork','WorkEmail']},
		{hcard: 'email.home', names: ['EmailHome','HomeEmail']},

		{hcard: 'im.AIM', names: ['AIM'], uri: 'aim:goim?screenname=',className: 'url'},
		{hcard: 'im.MSN', names: ['MSN','WindowsLive','MicrosoftMessenger'],uri: 'msn:',className: 'url'},
		{hcard: 'im.Jabber', names: ['Jabber','XMPP'],uri: 'xmpp:',className: 'url'},
		{hcard: 'im.YIM', names: ['YIM','Yahoo','Yahoo!'],uri: 'ymsgr:sendIM?',className: 'url'},
	],

	fieldDictionary: {},

	squash: function (str) {
		return str.toLowerCase().replace(/[\s(),.\-!\?:\[\]]/g,'');
	},

	init: function () {
		if(this.initialised) 
			return;

	s= "/* content macro plugin style */"
        +".contact {background-color: #666; padding: 1em; margin: 2em 5em 2em 5em;}"
        +".vcard {margin: -3em 0 0 -3em; border: thin solid #999; padding: 2em; left: -1px; top: -1px; background-color: #eee; color: black;}"
        +".org {float: right; font-weight: bold; font-size: 1em;}"
        +".fn {font-weight: bold; font-size: 3em;}"
        +".phone {margin-top:1em;}"
        +".type:after {content: ': ';}"
        +".adr {float:right;margin: 1em 1em 1em 1em;font-size: 1.5em;}"
        +".im {margin-top:1em;}"
        +".emails {margin-top:1em;}"
        +".vcardEnd {clear:right;}"
        +".url {display: block;}";
		setStylesheet(s,"contact");


		for(var i=0;i<this.hCardFields.length;i++) {
			var item = this.hCardFields[i];
			var fieldName = this.squash(item.hcard);
			if(!item.element) 
				item.element = 'span';
			if(!item.className) 
				item.className = item.hcard.split('.').pop();
			this.fieldDictionary[fieldName] = this.hCardFields[i];
		}
		this.initialised = true;
	},

	getCardField: function (tiddlerName,fieldName,item) {
		fieldName = this.squash(fieldName);
		if(!item) {
			item = this.fieldDictionary[fieldName];
		}
		if(!item) {
			displayMessage("We didn't expect the '"+fieldName+"' field");
			return "";
		}
		for(var i=0;i<item.names.length;i++) {
			var value = store.getTiddlerSlice(tiddlerName,item.names[i]);
			if(value) return value;
		}
		return "";
	},

	getElementByClass:  function (node,className) {
		var re = new RegExp('\\b'+className+'\\b');
		var element = node.getElementsByTagName('*');
		for(var i = 0; i < element.length; i++) {
			var classes = element[i].className;
			if(re.test(classes)) return element[i];
		}
		return 0;
	},
	
	vCardHolder: function (vcard,element,name) {
		node = this.getElementByClass(vcard,name);
		if(!node) 
			node = createTiddlyElement(vcard,element,null,name);
		return node;
	},

	addItem_element: function (place,item,value) {
		return createTiddlyElement(place,item.element,null,item.className,value);
	},

	addItem_a: function (place,item,value) {
		node = createTiddlyElement(place,'a',null,item.className,value);
		node.setAttribute('href',item.uri+encodeURI(value));
		var type = item.hcard.split('.').pop();
		node.setAttribute('title',type);
		return node;
	},

	addItem_im: function (place,item,value) {
		var holder = this.vCardHolder(place,'div','im');
		holder = createTiddlyElement(holder,'div',null,'line');
		var node = this.addItem_a(holder,item,value);
		return node;
	},

	addItem_email: function (place,item,value) {
		holder = this.vCardHolder(place,'div','emails');
		holder = createTiddlyElement(holder,'div',null,'line');
		if (!item.uri) 
			item.uri = 'mailto:';
		node = this.addItem_a(holder,item,value);
		return node;
	},

	addItem_fn: function (place,item,value) {
		if(item.hcard=='fn') 
			return this.addItem_element(place,item,value);
		node = this.vCardHolder(place,'div','fn');
		return createTiddlyElement(node,'span',null,item.className,value);
	},

	addItem_adr: function (place,item,value) {
		holder = this.vCardHolder(place,'div','adr');
		holder = createTiddlyElement(holder,'div',null,'line');
		return createTiddlyElement(holder,'span',null,item.className,value);
	},

	addItem_adr_postalcode: function (place,item,value) {
		holder = this.vCardHolder(place,'div','adr');
		holder = createTiddlyElement(holder,'div',null,'line');
		return this.addItem_a(holder,item,value);
	},

	addItem_tel: function (place,item,value) {
		holder = this.vCardHolder(place,'div','phone');
		holder = createTiddlyElement(holder,'div',null,'line');
		node = createTiddlyElement(holder,'span',null,'tel');
		var type = item.hcard.split('.').pop();
		if (type=='tel') 
			type='other';
		createTiddlyElement(node,'span',null,'type',type);
		createTiddlyElement(node,'span',null,'value',value);
		createTiddlyButton(holder,'☏','Click here to dial this number',this.onClickDial);
	},

	addItem: function (place,item,value) {
		if(!value) return;
		path = item.hcard.split('.');
		while (path.length) {
			adder = 'addItem_'+this.squash(path.join('_'));
			if(this[adder]) 
				return this[adder](place,item,value);
			path.pop();
		}
		return this.addItem_element(place,item,value);
	},

	createTiddlyhCard: function (place,tiddlerName) {
		this.init();
		var contact = createTiddlyElement(place,'div',null,'contact',null);
		var container = createTiddlyElement(contact,'div',null,'vcardContainer',null);
		var vcard = createTiddlyElement(container,'div',null,'vcard',null);

		for(var i=0;i<this.hCardFields.length;i++) {
			var item = this.hCardFields[i];
			this.addItem(vcard,item,this.getCardField(tiddlerName,item.hcard,item));
		}

		// TBD: editing a tiddler should cause the vcard to update?
		createTiddlyLink(vcard,tiddlerName,tiddlerName,'editVcard');

		// TBD: ideally split WikiName and set as first child node ..
		if(!this.getElementByClass(vcard,'fn'))
			this.addItem_element(vcard,this.fieldDictionary['fn'],tiddlerName);

		createTiddlyElement(vcard,'div',null,'vcardEnd',null);

		return contact;
	},

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		params = paramString.parseParams('name',null,true,false,false);
		var tiddlerName = getParam(params,'name',null);

		// TBD - name beginning with '+' is a group name, for conference calling
		if(0) {
			this.createTiddlyhCard(place,tiddlerName);
		} else {
			if(!store.tiddlerExists(tiddlerName)) {
				createTiddlyError(place,'The tiddler \'' + tiddlerName + '\' does not yet exist after all even after looking for it twice');
				return;
			}
			this.createTiddlyhCard(place,tiddlerName);
		}
	},

	telURI: function (no) {
		return encodeURIComponent('tel:'+no);
	},

	onClickDial: function (e) {
	        var macro = config.macros.contact;
	        var callingParty = macro.getCardField(config.options.txtUserName,'tel.mobile');
	        var calledParty = macro.getElementByClass(this.previousSibling,'value').firstChild.data;

		var body = 'callingParty=' + macro.telURI(callingParty) + '&calledParty=' + macro.telURI(calledParty);

		if(macro.debug)
			displayMessage('call info:' + body );

		var callback = function(status,params,responseText,url,xhr) {
			displayMessage(status?'call made':'call failed');
			if(config.macros.contact.debug)
				displayMessage(responseText);
		};

		// BT Web21C SDK http://sdk.bt.com
		// exposed as a web form at http://whatfetttle.com for demonstration purposes
		// you need authentication to use this!
		if(!macro.offline) {
			var req = doHttp('POST', 'http://web21c.whatfettle.com/calls/new', body, null, null,null, callback);
			if(macro.debug)
				displayMessage(req);
		}
	}

},

//TBD - wizard to load CSV file into a tidler, then explode them into tiddlers?

config.macros.contactLoadCSV = {
	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		params = paramString.parseParams('name',null,true,false,false);
		tags = "fromCSV";
		var tiddlerName = getParam(params,'name',null);

		text = store.getTiddlerText(tiddlerName);
		// TBD - has to be a better way?
		text = text.replace(/^{{{/, "").replace(/}}}$/, "");
		var csv = new CSV(text);

		for (var n=0; n < csv.nlines(); n++) {
			line = csv.getLine(n);

			//TBD use _fn to construct title
			title = line['firstName']+line['lastName'];
			//csv.line[n].['fn'] = title;

			body = csv.getTiddlerText(n);

			if (title && body) 
				tiddler = store.saveTiddler(title,title,body,config.options.txtUserName);
		}
	}
};


/*
 *  Parse CSV into array of hashes
 */
{
	/*
	 *  parse CSV 
	 */
	function CSV(stringData,columns)
	{
		this.setColumns(columns);
		this.line = [];
		if (stringData) this.parse(stringData);
	}

	CSV.prototype.forceQuotes = true;

	CSV.prototype.parse = function(s) {
		s.replace("\r","");
		var lines = s.split("\n");
		if (!this.columns) {
			line = lines.shift();
			this.setColumns(this.parseLine(line));
		}
		for(var n = 0; n < lines.length; n++) {
			this.line.push(this.parseLine(lines[n]));
		}
	};

	CSV.prototype.parseLine = function(line) {
		data = line.split(/,(?=(?:[^"]*"[^"]*")*(?![^"]*"))/);
		for(var n = 0; n < data.length; n++) {
			if (!data[n]['substr']) continue;
			d = data[n].substr(0,1);
			if (d == '"' || d == "'") {
				data[n] = data[n].substr(1,data[n].length-2);
			}
		}
		return data;
	};

	CSV.prototype.writeLine = function(a) {
		return a.join(",");
	};

	CSV.prototype.setColumns = function(columns) {
		this.columns = columns;
	};

	CSV.prototype.getColumns = function() {
		return this.columns;
	};

	CSV.prototype.nlines = function() {
		return this.line.length;
	};

	CSV.prototype.getLineArray = function(n) {
		return this.line[n];
	};

	CSV.prototype.getLine = function(n) {
		line = this.line[n];
		if (!line) return line;
		a = {}
		for(var c = 0; c < line.length; c++) {
			if (line[c]) {
				a[this.columns[c]] = line[c];
			}
		}
		return a;
	};

	CSV.prototype.getTiddlerText = function(n) {
		line = this.line[n];
		if (!line) return line;
		text = "";
		for(var c = 0; c < line.length; c++) {
			if (line[c])
				text = text.concat("|"+this.columns[c]+"|"+line[c]+"|\n");
		}
		return text;
	};
}



} //# end of "install only once"
//}}}
