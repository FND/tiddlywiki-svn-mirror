/***
|''Name:''|DiceRollerMacro |
|''Version:''|1.0.0 |
|''Date:''|<<getversiondate roll "DD MMM YYYY">> |
|''Source:''|http://www.legolas.org/gmwiki/dev/gmwikidev.html#DiceRollerMacro |
|''Author:''|[[DevonJones]] |
|''Type:''|Macro |
|''License:''|Copyright (c) 2005, 2006, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2, TiddlyWiki 2.0, TiddlyLib 0.9.2 or later |
!Description
Allows the inline rolling of dice.

!Syntax
* {{{<<roll [Dice Expression] [Name]>>}}}
* Dice Expression can be in 3 forms:
** Die form: {{{<<roll 1d20>>}}} where the die can get fairly complicated 1d6, 3d4, 1d5+1d4-6, (1d6)d6+5, 3dF (Fudge dice), (1d6)dF all work
** {{{<<roll +5>>}}} where the + or - is added to 1d20.  Used for the D20 system
** {{{<<roll DC20>>}}} where DC# is considered to be a Roll to target on 1d20.  Returns how much it was made or missed by (-5 means it was missed by 5, +3 means it succeeded by 3)
* Name is what is printed in the tiddler in place of the macro.  Defaults to the Dice Expression.

!Sample Output
''Example:'' lists all orphan tiddlers in reverse.
{{{<<roll 1d20>>}}}
<<roll 1d20>>

{{{<<roll 1dF >>}}}
<<roll 1dF >>

{{{<<roll (1d6)dF >>}}}
<<roll (1d6)dF >>

!Known issues

!Notes

!Revision history
v1.0.0 February 3rd 2006 - Addressed breakage from Firefox 1.5.0.1, fixed compatability with IE, fixed compatability with Tiddlywiki 1.2.x
v0.9.4 January 23th 2006 - Updated to TiddlyWiki 2.0, can handle a space in DC expressions now so DC5 or DC 5 are both valid
v0.9.3 October 26th 2005 - Updated to reflect changes in TiddlyLib.
v0.9.2 October 25th 2005 - Added Fudge dice.
v0.9.1 October 20th 2005 - changed name to DiceRollerMacro to better reflect purpose.
v0.9.0 October 19th 2005 - initial release

!Code
***/
//{{{

version.extensions.roll = { major: 0, minor: 9, revision: 5, date: new Date(2006, 2, 3) };

config.macros.roll = {};

config.macros.roll.roller = new DiceRoller();

config.macros.roll.onClick = function(e) {
	var roller = config.macros.roll.roller;
	if (!e) {
		var e = window.event;
	}
	var button = this;
	var title = button.title;
	var exp = title.substr(6);
	var result = roller.rollExpression(exp);
	
	var rollbox = button.parentNode.lastChild;
	try {
		rollbox.style.display = "inherit";
	}
	catch(ex) {
		rollbox.style.display = "block";
	}
	rollbox.innerHTML = "<B>" + result + "</B>";
	e.returnValue = false;
}

config.macros.roll.handler = function(place, macroName, params) {
	// param 0: text button
	// param 1: tiddler name to display
	// param 2: initial display by default

	var dicestring = params[0];
	var title = params[1];
	var titleExists = params[1] != null;
	if(!titleExists) {
		title = dicestring;
	}
	
	var element = createTiddlyElement(place, "span", null, null, title);
	var btn = config.lib.tiddlyLib.createLocalTiddlyButton(element, "*", "Roll: " + dicestring, config.macros.roll.onClick);
	var rollbox = createTiddlyElement(element, "span", null, "rollresult", null);
	rollbox.style.display = "none";
	rollbox.onclick = config.lib.tiddlyLib.hideElementEvent;
	
	try {
		var parentTiddler = findContainingTiddler(place);
	}
	catch(e) {
		var parentTiddler = story.findContainingTiddler(place);
	}
	parentTiddler.ondblclick = config.lib.tiddlyLib.onDblClickTiddlerOverride;
}

// A class to hold all the dice rolling functions
function DiceRoller() {
}

DiceRoller.prototype.rollExpression = function(exp) {
	var testRe = /^[\+-]/;
	var testRe2 = /^DC/;
	var total = 0;
	if(testRe.test(exp)) {
		total = this.rollCheckExpression(exp)
	}
	else if(testRe2.test(exp)) {
		total = this.rollDcExpression(exp)
	}
	else {
		total = this.rollDiceExpression(exp)
	}
	return total;
}

DiceRoller.prototype.rollDiceExpression = function(exp) {
	var testRe = /\(.*\)/;
	var testRe2 = /^\d+$/;
	var testRe3 = /^\d*[dD][\dfF]+$/;
	var testRe4 = /^\d*[dD][\dfF]+[\+-].*/;
	var total = 0;
	var execRe;
	if (testRe.test(exp)) {
		execRe = /\((.*)\)/;
		var ret = execRe.exec(exp);
		var center = this.rollDiceExpression(ret[1]);
		var replaceRe = /(\(.*\))/;
		total = this.rollDiceExpression(exp.replace(replaceRe, center));
	}
	else if (testRe2.test(exp)) {
		total = parseInt(exp);
	}
	else if (testRe3.test(exp)) {
		execRe = /(\d*)[dD]([\dfF]+)/;
		var ret = execRe.exec(exp);
		var num = ret[1];
		var die = ret[2];

		if(num == "") {
			num = 1;
		}
		if(die == "f" || die == "F") {
			total = this.rollDiceFudge(parseInt(num));
		}
		else {
			total = this.rollDice(parseInt(num), parseInt(die));
		}
	}
	else if (testRe4.test(exp)) {
		execRe = /(\d*)[dD]([\dfF]+)([\+-])(.*)/;
		var ret = execRe.exec(exp);
		var num = ret[1];
		var die = ret[2];
		var sign = ret[3];
		var subexp = ret[4];
		var dieRoll = 0;
		var dieRoll2 = 0;

		if(num == "") {
			num = 1;
		}
		if(die == "f" || die == "F") {
			dieRoll = this.rollDiceFudge(parseInt(num));
		}
		else {
			dieRoll = this.rollDice(parseInt(num), parseInt(die));
		}
		dieRoll2 = this.rollDiceExpression(subexp);
		if (sign == "-") {
			total = dieRoll - dieRoll2;
		}
		else if (sign == "+") {
			total = dieRoll + dieRoll2;
		}
	}
	return total;
}

DiceRoller.prototype.rollDcExpression = function(exp) {
	return this.rollDcExpression(exp, 0);
}

DiceRoller.prototype.rollDcExpression = function(exp, plus) {
	var total = 0;
	if(!plus) {
		plus = 0;
	}
	var testRe = /[Dd][Cc] ?\d+$/;
	if(testRe.test(exp)) {
		var execRe = /[Dd][Cc] ?(\d+)$/;
		var ret = execRe.exec(exp);
		var dc = parseInt(ret[1]);
		var roll = this.rollDice(1,20);
		total = roll + plus - dc;
	}
	return total;
}

DiceRoller.prototype.rollCheckExpression = function(exp) {
	var testRe = /^[\+-]\d+$/;
	var total = 0;
	if(testRe.test(exp)) {
		var execRe = /^([\+-])(\d+)$/;
		var ret = execRe.exec(exp);
		var sign = ret[1];
		var num = parseInt(ret[2]);
		var roll = this.rollDice(1,20);
		if (sign == "-") {
			total = roll - num;
		}
		else if (sign == "+") {
			total = roll + num;
		}
	}
	return total;
}

DiceRoller.prototype.rollDice = function(number, size) {
	var total = 0;
	for(var i = 0; i < number; i++) {
		var roll = Math.floor((size) * Math.random()) + 1;
		total += roll;
	}
	return total;
}

DiceRoller.prototype.rollDiceFudge = function(number) {
	total = 0;
	for(var i = 0; i < number; i++) {
		var roll = Math.floor((3) * Math.random()) - 1;
		total += roll;
	}
	return total;
}
//}}}