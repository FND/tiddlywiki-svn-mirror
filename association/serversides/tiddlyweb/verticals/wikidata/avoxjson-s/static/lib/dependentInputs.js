DependentInputs = {
	rows: [],
	values: {},
	dependencies: [],
	addDependency: function(f) {
		this.dependencies.push(f);
	},
	makeSelect: function($container,values) {
		var $select = $("<select></select>").appendTo($container);
		for(var i=0; i<values.length; i++) {
			$select.append($("<option>"+values[i]+"</option>"));
		}
		return $select;
	},
	makeInput: function($container,attrs) {
		var $input = $('<input type="text"></input>').appendTo($container);
		if(attrs) {
			$input.attr(attrs);
		}
		return $input;
	},
	createRow: function(container) {
		var $container = $(container);
		var $row = $("<div></div>").appendTo($container);
		var i = this.rows.push($row)-1;
		var id = "adv_"+i+"_value";
		$row.addClass("advSearchLine");
		$row.field = this.makeSelect($row,this.fields);
		$row.field.addClass("advSearchLineField");
		$row.val = this.makeInput($row, {
			"id":id,
			"name":id,
			"size":"35"
		});
		$row.val.addClass("advSearchLineValue");
		$row.change(function(event) {
			var $target = $(event.target);
			var changed;
			if($target.hasClass("advSearchLineField")) {
				changed = "field";
			} else if ($target.hasClass("advSearchLineValue")) {
				changed = "value";
			} else {
				throw new Error("something changed other than field or value in row, index "+i+", class: "+$target.className);
			}
			DependentInputs.checkAll(i,changed);
		});
		this.checkAll(i,"field");
		return i;
	},
	replaceValues: function(i,values) {
		var $row = this.rows[i];
		$row.values = values;
		var className = $row.val.get(0).className;
		var $inp = $row.val.remove();
		var $hid = $('<input type="hidden"></input>');
		$hid.attr({
			"id":$inp.attr("id"),
			"name":$inp.attr("name")
		});
		$row.val = this.makeSelect($row,values);
		$row.val.attr("name","_ignore");
		$row.append($hid);
		$row.val.get(0).className = className;
		var currVal = $inp.val();
		if(currVal) {
			if($row.valueMap) {
				for(var i in $row.valueMap) {
					if($row.valueMap[i]===currVal) {
						currVal = i; // the map is a reverse map in this context
					}
				}
			}
			$row.val.val(currVal);
			$row.val.trigger("change");
		}
	},
	checkAll: function(i,changed) {
		DependentInputs.checkRow(i,changed);
		for(var j=0;j<DependentInputs.rows.length;j++) {
			if(j!==i) {
				// all other lines are candidates for changing their values, so check their dependencies as if they'd just changed their field to its current value
				DependentInputs.checkRow(j,"field");
			}
		}
	},
	checkRow: function(i,changed) {
		var $row = this.rows[i];
		var matched = false;
		var values;
		for(var d=0; d<this.dependencies.length; d++) {
			values = this.dependencies[d]($row,changed);
			if(values) {
				matched = true;
				if(!$row.values) {
					this.replaceValues(i,values);
				}
				//break;
			}
		}
		if(!matched && $row.values && changed==="field") {
			delete $row.values;
			delete $row.valuesMap;
			$row.val.remove();
			var $hid = $row.find('input:hidden').remove();
			$row.val = this.makeInput($row, {
				id: $hid.attr('id'),
				name: $hid.attr('name')
			});
		}
	}
};

DependentInputs.values.countries = (function() {
	var countries = [];
	for(var i in ISO_3166.countries.name2iso) {
		countries.push(i);
	}
	return countries;
})();

DependentInputs.values.us_states = (function() {
	var states = [];
	for(var i in ISO_3166.usa.name2iso) {
		states.push(i);
	}
	return states;
})();

DependentInputs.values.aus_states = (function() {
	var states = [];
	for(var i in ISO_3166["2:AU"].name2iso) {
		states.push(i);
	}
	return states;
})();

DependentInputs.values.ca_states = (function() {
	var states = [];
	for(var i in ISO_3166["2:CA"].name2iso) {
		states.push(i);
	}
	return states;
})();

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational Country") {
		$row.valueMap = ISO_3166.countries.name2iso;
		return DependentInputs.values.countries;
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Registered Country") {
		$row.valueMap = ISO_3166.countries.name2iso;
		return DependentInputs.values.countries;
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Operational Country" && $r.val.val()==="United States") {
				$row.valueMap = ISO_3166.usa.name2iso;
				return DependentInputs.values.us_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Operational Country" && $r.val.val()==="Australia") {
				$row.valueMap = ISO_3166["2:AU"].name2iso;
				return DependentInputs.values.aus_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Operational Country" && $r.val.val()==="Canada") {
				$row.valueMap = ISO_3166["2:CA"].name2iso;
				return DependentInputs.values.ca_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="value") {
		var inpVal = $row.val.val();
		$row.find('input:hidden').val($row.valueMap[inpVal]);
	}
});

DependentInputs.fields = [
	'Legal Name',
	'Previous Name_s_',
	'Trades As Name_s_',
	'Trading Status',
	'Company Website',
	'Registered Country',
	'Operational PO Box',
	'Operational Floor',
	'Operational Building',
	'Operational Street 1',
	'Operational Street 2',
	'Operational Street 3',
	'Operational City',
	'Operational State',
	'Operational Country',
	'Operational Postcode',
	'CABRE'
];