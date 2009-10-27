DependentInputs = {
	rows: [],
	values: {},
	dependencies: [],
	decoyValue: "Please select...",
	addDependency: function(f) {
		this.dependencies.push(f);
	},
	makeSelect: function($container,values,attrs,addDecoy) {
		var $select = $("<select></select>");
		if(addDecoy) {
			$select.append($("<option>"+this.decoyValue+"</option>"));
		}
		for(var i=0; i<values.length; i++) {
			$select.append($("<option>"+values[i]+"</option>"));
		}
		if(addDecoy) {
			$select.append($("<option></option>"));
		}
		if(attrs) {
			$select.attr(attrs);
		}
		if($container) {
			$container.append($select);
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
		$row.addClass("advSearchLine");
		$row.field = this.makeSelect($row,this.fields,{
			"name":"adv_"+i+"_field"
		});
		$row.field.addClass("advSearchLineField");
		$row.val = this.makeInput($row, {
			"name":"adv_"+i+"_value",
			"size":"35"
		});
		$row.val.addClass("advSearchLineValue");
		$row.button = $("<button>-</button>").appendTo($row).click(function() {
			// have to figure out i again, as it might have changed
			var i = $('.advSearchLine').index($(this).parent());
			DependentInputs.rows.splice(i,1);
			var name;
			$container.find('.advSearchLine:gt('+i+')').each(function(n) {
				$(this).find(':input:not(button)').each(function() {
					name = $(this).attr('name').replace(i+1+n,i+n);
					$(this).attr('name',name);
				});
			});
			$row.remove();
			DependentInputs.checkAll(0,"field");
		});
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
	setDecoy: function() {
		var oldSetDecoy = this.setDecoy;
		var cancelDecoys = function() {
			$(this).find('select').each(function(i) {
				if($(this).val()===DependentInputs.decoyValue) {
					$(this).val("");
				}
			});
		};
		var $row = this.rows[0];
		$row.closest('form').submit(cancelDecoys);
		this.setDecoy = function() {
			return false;
		}
		this.setDecoy.restore = function() {
			DependentInputs.setDecoy = oldSetDecoy;
			$row.closest('form').unbind('submit',cancelDecoys);
		}
	},
	replaceValues: function(i,values) {
		var $row = this.rows[i];
		// prep the form for throwing away decoy values on submission
		this.setDecoy();
		$row.values = values;
		var className = $row.val.get(0).className;
		var $inp = $row.val.remove();
		var inpName = $inp.attr('name');
		var $hid = $('<input type="hidden"></input>');
		$hid.attr({
			"name":inpName
		});
		$row.val = this.makeSelect($row,values,null,true);
		$row.val.attr("name","_ignore_"+inpName);
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
					$row.button.appendTo($row);
				}
				//break;
			}
		}
		// if there are no dependencies matched and we're a drop-down, it's time to change back to an input
		if(!matched && $row.values && changed==="field") {
			delete $row.values;
			delete $row.valuesMap;
			var $hid = $row.find('input:hidden').remove();
			var className = $row.val.remove().get(0).className;
			$row.val = this.makeInput($row, {
				name: $hid.attr('name')
			});
			$row.val.addClass(className);
			$row.button.appendTo($row);
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