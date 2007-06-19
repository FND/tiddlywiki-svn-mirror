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
		return this.lines.length;
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
