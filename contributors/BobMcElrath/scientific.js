/***
|Name|Plugin: Scientific Notation|
|Created by|BobMcElrath|
|Email|my first name at my last name dot org|
|Location|http://bob.mcelrath.org/tiddlyjsmath-2.0.3.html|
|Version|1.0|
|Requires|[[TiddlyWiki|http://www.tiddlywiki.com]] &ge; 2.0.3, [[jsMath|http://www.math.union.edu/~dpvc/jsMath/]] &ge; 3.0, [[Plugin: jsMath]]|
!Description
This plugin will render numbers expressed in scientific notation, such as {{{3.5483e12}}} using the jsMath plugin to display it in an intuitive way such as 3.5483e12.  You may customize the number of significant figures displayed, as well as "normalize" numbers so that {{{47392.387e9}}} is displayed as 47392.387e9.
!Installation
Install the Requirements, above, add this tiddler to your tiddlywiki, and give it the {{{systemConfig}}} tag.
!History
* 1-Feb-06, version 1.0, Initial release
!Code
***/
//{{{
config.formatters.push({
  name: "scientificNotation",
  match: "\\b[0-9]+\\.[0-9]+[eE][+-]?[0-9]+\\b",
  element: "span",
  className: "math",
  normalize: true,                          // set to 'true' to convert numbers to X.XXX \times 10^{y}
  sigfigs: 3,                               // with this many digits in the mantissa
  handler: function(w) {
    var snRegExp = new RegExp("\\b([0-9]+(?:\\.[0-9]+)?)[eE]([-0-9+]+)\\b");
    var mymatch = snRegExp.exec(w.matchText);
    var mantissa = mymatch[1];
    var exponent = parseInt(mymatch[2]);
    // normalize the number.
    if(this.normalize) {
      mantissa = parseFloat(mantissa);
      while(mantissa > 10.0) {
        mantissa = mantissa / 10.0;
        exponent++; 
      }
      while(mantissa < 1.0) {
        mantissa = mantissa * 10.0;
        exponent--;
      }
      var sigfigsleft = this.sigfigs;
      mantissa = parseInt(mantissa) + "." + (Math.round(Math.pow(10,this.sigfigs-1)*mantissa)+"").substr(1,this.sigfigs-1);
    }
    var e = document.createElement(this.element);
    e.className = this.className;
    if(exponent == 0) {
      e.appendChild(document.createTextNode(mantissa));
    } else {
      e.appendChild(document.createTextNode(mantissa + "\\times 10^{" + exponent + "}"));
    }
    w.output.appendChild(e);
  }
});
//}}}
