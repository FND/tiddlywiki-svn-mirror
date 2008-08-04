//--
//-- TW21Saver (inherits from SaverBase)
//--

function TW21Saver() {}

TW21Saver.prototype = new SaverBase();

TW21Saver.prototype.externalizeTiddler = function(store,tiddler)
{
	try {
		var tagTemplate = "<li><a class='tiddlerLink' href='#tiddler:%0'>%0</a></li>";
		var tagString = '';
		for (var t=0; t < tiddler.tags.length; t++) {
			tagString += tagTemplate.format([tiddler.tags[t]]);
		};
		
		var fieldTemplate = "<li><i>%0</i><span>%1</span></li>";
		var fieldString = '';
		for (var fieldName in tiddler.fields){
			var value = tiddler.fields[fieldName];
			if(typeof value != "string")
				value = "";
			if(!fieldName.match(/^temp\./))
				fieldString += fieldTemplate.format([fieldName,value.escapeLineBreaks().htmlEncode()]);	
		}

		var tiddlerTemplate = "<div class='tiddler'>" +
			"<a class='tiddlerName' name='tiddler:%0'></a>" +
			"<h1 class='tiddlerName'>%0</h1>" +
			"<div class='text'>" +
			"	%1" +
			"</div>" +
			"<ul class='tags'>" +
			"	<h3>tags</h3>" +
			"	%2	</ul>" +
			"<ul class='meta'>" +
			"	<h3>metadata</h3>" +
			"	<li><i>created</i><span>%3</span></li>" +
			"	<li><i>modified</i><span>%4</span></li>" +
			"	<li><i>modifier</i><span>%5</span></li>" +
			"	%6" +
			"</ul>" +
			"</div>";


		return tiddlerTemplate.format([
			tiddler.title.htmlEncode(),
			tiddler.text,//.escapeLineBreaks().htmlEncode(),
			tagString,
			tiddler.created.convertToYYYYMMDDHHMM(),
			tiddler.modified.convertToYYYYMMDDHHMM(),
			tiddler.modifier.htmlEncode(),
			fieldString
			]);
	} catch (ex) {
		throw exceptionText(ex,config.messages.tiddlerSaveError.format([tiddler.title]));
	}
};





