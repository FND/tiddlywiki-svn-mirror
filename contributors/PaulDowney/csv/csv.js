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
		for (n in lines) {
			this.line.push(this.parseLine(lines[n]));
		}
	};

	CSV.prototype.parseLine = function(line) {
		data = line.split(/,(?=(?:[^"]*"[^"]*")*(?![^"]*"))/);
		for(var n in data) {
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

	CSV.prototype.getLine = function(n) {
		return this.line[n];
	};
}
