jQuery(document).ready(function() {

	jqMock.addShortcut();

	module('DependentInputs: creating new rows', {
		setup: function() {
			$('body').append('<form id="test-form"><input type="submit" /></form>');
		},
		teardown: function() {
			if(DependentInputs.setDecoy.restore) {
				DependentInputs.setDecoy.restore();
			}
			$('#test-form').remove();
			DependentInputs.rows = [];
		}
	});

	test("when I add a field, all rows should check for dependencies, starting with the one I just added", function() {
		var mock = new jqMock.Mock(DependentInputs,"checkAll");
		mock.modify().args(0,"field");
		DependentInputs.createRow('#test-form');
		mock.verify();
		mock.restore();
	});

	test("when I change a field, all rows should check for dependencies, starting with the one I just added", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		var mock = new jqMock.Mock(DependentInputs,"checkRow");
		mock.modify().args(i,'field');
		$row.field.trigger("change");
		mock.verify();
		mock.restore();
	});

	test("when I change a value drop-down, all rows should check for dependencies, starting with the one I just added", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var mock = new jqMock.Mock(DependentInputs,"checkRow");
		mock.modify().args(i,'value');
		$row.val.trigger("change");
		mock.verify();
		mock.restore();
	});

	// general stye: when a row finds it matches a dependency, it should update its values to the given list
	test("when a row finds its field is 'Operational Country', it should update its values to the countries list", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		same($row.val.find('option').length-2,DependentInputs.values.countries.length);
		same($row.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Registered Country', it should update its values to the countries list", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Registered Country');
		$row.field.trigger("change");
		same($row.val.find('option').length-2,DependentInputs.values.countries.length);
		same($row.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Operational State' and there is a row with field 'Operational Country' with a value of 'United States', it should update its values to the states of the United States", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		$row.val.val('United States');
		$row.val.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val('Operational State');
		$row2.field.trigger("change");
		same($row2.val.find('option').length-2,DependentInputs.values.us_states.length);
		same($row2.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Operational State' and there is a row with field 'Operational Country' with a value of 'Australia', it should update its values to the states of Australia", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		$row.val.val('Australia');
		$row.val.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val('Operational State');
		$row2.field.trigger("change");
		same($row2.val.find('option').length-2,DependentInputs.values.aus_states.length);
		same($row2.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Operational State' and there is a row with field 'Operational Country' with a value of 'Canada', it should update its values to the states of Canada", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		$row.val.val('Canada');
		$row.val.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val('Operational State');
		$row2.field.trigger("change");
		same($row2.val.find('option').length-2,DependentInputs.values.ca_states.length);
		same($row2.find('input:visible').length,0);
	});
	
	test("given a row with a field of 'Operational State' and another row with a field of 'Operational Country' and a value of 'United States', when I change the country row to a value of 'Australia', the states row should update its drop-down to a drop-down of the states of Australia", function() {
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row.field.val("Operational State").change();
		var $row2 = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row2.field.val("Operational Country").change();
		$row2.val.val("United States").change();
		same($row.values,DependentInputs.values.us_states);
		$row2.val.val("Australia").change();
		same($row.values,DependentInputs.values.aus_states);
	});

	test("when a row changes its input to a drop-down, it should create a single drop-down and a single remove button", function() {
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row.field.val('Operational Country').change();
		same($row.find('select').length,2);
		same($row.find('button').length,1);
	});

	test("when I create a row, I should create a button after the row that removes it when clicked", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		var $button = $row.find('button');
		same($button.length,1);
		triggerEvent($button[0],"click");
		same($('.advSearchLine').length,0);
	});

	test("when I remove a row, all the rows should check for dependencies", function() {
		var i = DependentInputs.createRow('#test-form');
		$button = DependentInputs.rows[i].find('button');
		var mock = new jqMock.Mock(DependentInputs,"checkAll");
		mock.modify().args(i,"field");
		triggerEvent($button[0],"click");
		mock.verify();
		mock.restore();
	});
	
	test("when I remove a row, all the rows should update their field and value names so the indices are correct", function() {
		var i = DependentInputs.createRow('#test-form');
		var j = DependentInputs.createRow('#test-form');
		var k = DependentInputs.createRow('#test-form');
		var l = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[j];
		triggerEvent($row.button[0],"click");
		same(DependentInputs.rows[1].field.attr('name').indexOf(2),-1);
		same(DependentInputs.rows[1].val.attr('name').indexOf(2),-1);
		same(DependentInputs.rows[2].field.attr('name').indexOf(3),-1);
		same(DependentInputs.rows[2].val.attr('name').indexOf(3),-1);
	});
	
	test("when I remove a row, the row should be removed from the DependentInputs.rows array", function() {
		DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		triggerEvent($row.button[0],"click");
		same(DependentInputs.rows.length,1);
	});
	
	test("when I change to a drop-down, the remove button should appear after the drop-down", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country").change();
		same($row.find("button ~ :visible").length,0);	
	});
	
	test("when I change from a drop-down back to an input, the remove button should appear after the input", function() {
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row.field.val("Operational Country").change();
		$row.field.val("Legal Name").change();
		ok($row.find('input').next().is('button'));
	});
	
	test("when I change from one drop-down to another, the remove button should appear after the hidden input", function() {
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row.field.val("Operational Country").change();
		$row.field.val("Registered Country").change();
		same($row.val.next().is('input'),true);
		same($row.val.next().next().is('button'),true);
	});
	
	test("when I change from one drop-down to another by changing a field, dependencies should still be checked", function() {
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row.field.val("Operational Country").change();
		var $row2 = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		$row2.field.val("Operational State").change();
		$row.field.val("Registered Country").change();
		same($row2.val.is("input"),true);
	});

	test("when a row changes its values to a drop-down, it should create an empty hidden input field after the values", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		same($row.find('input:hidden').length,1);
	});

	test("when a row changes its values to a drop-down and there was a pre-existing value, it should use that as the drop-down's value, if possible", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		var expected = "United States";
		var code = "USA";
		$row.val.val(code);
		$row.field.val('Operational Country');
		$row.field.trigger('change');
		same($row.val.val(),expected);
	});

	test("when a value drop-down changes, it should update the value of its hidden input field to the search API-compatible code of the new value", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		$row.val.val("United Kingdom");
		$row.val.trigger("change");
		same($row.find('input:hidden').val(),"GBR");
	});

	test("when I add a row, the field drop-down should get a name of adv_i_field, where i is the index of the row, starting at 0", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		same($row.field.attr("name"),"adv_"+i+"_field");
	});
	
	test("when I add a row, the value input should get a name of adv_i_value, where i is the index of the row, starting at 0", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		same($row.val.attr("name"),"adv_"+i+"_value");
	});

	test("when a row changes its values to a drop-down, the drop-down's name should have '_ignore_' prepended", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var name = $row.find('input:hidden').attr('name');
		same($row.val.attr("name"),"_ignore_"+name);
	});
	
	test("dependencies should be triggered no matter which order two inter-dependent rows were added", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational State");
		$row.field.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val("Operational Country");
		$row2.field.trigger("change");
		$row2.val.val("Australia");
		$row2.val.trigger("change");
		same($row.val.find('option').length-2,DependentInputs.values.aus_states.length);
		same($row.find('input:visible').length,0);
	});

	test("when a field is changed and no dependencies are hit, the value should be changed back to an input if it is a drop-down", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		same($row.find('input:visible').length,0);
		$row.field.val("Legal Name");
		$row.field.trigger("change");
		same($row.find('input:visible').length,1);
	});
	
	test("when a value is changed back to an input from a drop-down, the new input should replace the drop-down in the DOM", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country").change();
		$row.field.val("Legal Name").change();
		same($row.field.next()[0],$row.val[0]);
	});
	
	test("when a value is changed back to an input from a drop-down, the hidden input field should pass on its name and value to the new input", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var $hid = $row.find('input:hidden');
		var expected = {
			'name': $hid.attr('name'),
			'val': $hid.val()
		};
		$row.field.val("Legal Name");
		$row.field.trigger("change");
		same($row.find('input:hidden').length,0);
		var $vis = $row.find('input:visible');
		var actual = {
			'name': $vis.attr('name'),
			'val': $vis.val()
		};
		same(expected,actual);
	});
	
	test("when a value is changed back to an input from a drop-down, it should get its className from the drop-down it is replacing", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var expected = $row.val.get(0).className;
		$row.field.val("Legal Name");
		$row.field.trigger("change");
		var actual = $row.val.get(0).className;
		same(expected,actual);
	});
	
	test("when replacing values with a drop-down, if there's already a hidden input field, don't create another one", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		same($row.find('input:hidden').length,1);
		$row.field.val("Registered Country");
		$row.field.trigger("change");
		same($row.find('input:hidden').length,1);
	});
	
	test("when replacing values with a drop-down, the default option should be 'Please select...'", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country").change();
		var expected = "Please select...";
		same($row.val.val(),expected);
	});
	
	test("when submitting a form, any drop-downs still with 'Please select...' as their value should be set to a blank value before submission", function() {
		//stop();
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country").change();
		$('form').submit(function() {
			same($row.val.val(),"");
			//start();
			return false;
		});
		triggerEvent($('input:submit')[0],"click");
	});
	
	test("if the last row if removed, no dependency checking happens", function() {
		var $row = DependentInputs.rows[DependentInputs.createRow('#test-form')];
		var mock = new jqMock.Mock(DependentInputs.dependencies,0);
		mock.modify().args(is.anything,is.anything).multiplicity(0);
		triggerEvent($row.button[0],"click");
		mock.verify();
		mock.restore();
	});
	
	module('DependentInputs: converting existing rows', {
		setup: function() {
			$('body').append('<form id="test-form"><label for="operational_state">Operational State</label><input type="text" name="operational_state" /><label for="operational_country">Operational Country</label><input type="text" name="operational_country" /><input type="submit" /></form>');
			DependentInputs.rows = [];
			DependentInputs.dependencies = [];
			DependentInputs.addDependency(function($row,changed) {
				if(changed==="field" && $row.field.val()==="Operational Country") {
						$row.valueMap = ISO_3166.countries;
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
		},
		teardown: function() {
			if(DependentInputs.setDecoy.restore) {
				DependentInputs.setDecoy.restore();
			}
			$('#test-form').remove();
		}
	});
	
	test("when I convert an existing row, I can specify the selectors for the field and val properties", function() {
		var n = DependentInputs.addRow('#test-form','label','input',0);
		var $row = DependentInputs.rows[n];
		var expectedField = $('#test-form label')[0];
		var expectedVal = $('#test-form :text')[0];
		same($row.field.get(0),expectedField);
		same($row.val.get(0),expectedVal);
		n = DependentInputs.addRow('#test-form','label',':input',1);
		$row = DependentInputs.rows[n];
		expectedField = $('#test-form label')[1];
		expectedVal = $('#test-form select')[0];
		same($row.field.get(0),expectedField);
		same($row.val.get(0),expectedVal);
	});
	
	test("when I add a row, all the other row dependencies are checked", function() {
		var mock = new jqMock.Mock(DependentInputs,"checkAll");
		mock.modify().args(is.anything,is.anything).multiplicity(1);
		DependentInputs.addRow('#test-form','label',':input');
		mock.verify();
		mock.restore();
	});
	
	test("when I add batch of rows via a selector, the dependencies are all checked afterwards", function() {
		var mock = new jqMock.Mock(DependentInputs,"checkAll");
		mock.modify().args(is.anything,is.anything).multiplicity(1);
		DependentInputs.addRows('#test-form','label',':text');
		mock.verify();
		mock.restore();
	});
	
	test("when I add a row with a label as its field, it should set the field.val() to the innerHTML of the label", function() {
		var i = DependentInputs.addRow('#test-form', 'label', ':text');
		var $row = DependentInputs.rows[i];
		same($row.field.val(),$('#test-form label')[0].innerHTML);
	});
	
	test("when I add a batch of rows that includes a field of 'Operational Country', it should replace the input with a country drop-down", function() {
		var i = DependentInputs.addRows('#test-form','label',':text');
		var $row = DependentInputs.rows[i];
		same($('select').length,1);
		same($row.values,DependentInputs.values.countries);
	});
	
	test("after adding two rows where one has a field of 'Operational State' and the other 'Operational Country', if I change the second value to 'United States', the first value should be replaced with a drop-down of US states", function() {
		var i = DependentInputs.addRows('#test-form','label',':text');
		var $row2 = DependentInputs.rows[i];
		$row2.val.val('United States').change();
		var $row = DependentInputs.rows[0];
		same($row.values,DependentInputs.values.us_states);
	});
});
