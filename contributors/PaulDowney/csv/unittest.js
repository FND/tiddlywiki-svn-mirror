/*
 *  Behaviour Driven unittesting framework
 *  - psd hack
 */
{
	function UnitTest(results) {
		if (!results) results = 'results';
		this.rdiv = document.getElementById('results');
		this.assertions=0;
		this.passes=0;
		this.failures=0;
		this.errors=0;
	}

	UnitTest.prototype.shouldEqual = function (actual,expected) {
		// may be a cheat too far!
		expected = "" + expected;
		actual = "" + actual;
		(expected == actual) ? this.pass() : this.fail("expected {" + expected + "} got {" + actual + "}");
	}

	UnitTest.prototype.pass = function(message) {
		this.assertions++;
		this.passes++;
	}

	UnitTest.prototype.fail = function(message) {
		this.assertions++;
		this.failures++;
		this.log('failure',message);
	}

	UnitTest.prototype.log = function(className,message) {
		this.rdiv.innerHTML = this.rdiv.innerHTML 
		+ "<div class='" + className + "'>" + message + "</div>";
	}

	UnitTest.prototype.summary = function() {
		var color = (this.assertions==this.passes)?"lightgreen":"red";
		this.rdiv.innerHTML = this.rdiv.innerHTML 
		+ "<div style='background:"+color+";width:100%'>" 
			+ this.assertions + " assertions " 
			+ this.passes + " passes " 
			+ this.failures + " failures " 
			+ this.errors + " errors " 
		+ "</div>";
	}
}
