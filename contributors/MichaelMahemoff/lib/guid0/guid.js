/* TODO:
   - Support for ISO GUID stanard
   - Interactive demo to tweak params
*/

window.onload = function() {
  var guid = new Guid({chars: Guid.constants.alphas, epoch: Guid.constants.epoch(2008)});
  for (var i=1; i<=10; i++) {
    document.getElementById("guids").innerHTML += "<tr><td class='count'>" + i + "</td><td>" + guid.generate() + "</td></tr>";
  }
}

function Guid(options) {
  this.options = options || {};
  this.chars = this.options.chars || Guid.constants.alphanumerics;
  this.epoch = this.options.epoch || Guid.constants.epoch1970;
  this.counterSequenceLength = this.options.counterSequenceLength || 1;
  this.randomSequenceLength = this.options.randomSequenceLength || 2;
}

Guid.prototype.generate = function() {
  var now = (new Date()).getTime() - this.epoch;
  var guid = this.baseN(now);

  this.counterSeq = (now==this.lastTime ? this.counterSeq+1 : 1);
  guid += this.counterSeq;

  for (var i=0; i<this.randomSequenceLength; i++) {
    guid += this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  return guid;
}

Guid.prototype.baseN = function(val) {
  if (val==0) return "";
  var rightMost = val % this.chars.length;
  var rightMostChar = this.chars[rightMost];
  var remaining = Math.floor(val / this.chars.length);
  return this.baseN(remaining) + rightMostChar;
}

Guid.constants = {};
Guid.constants.numbers = "0123456789";
Guid.constants.alphas = "abcdefghijklmnopqrstuvwxyz";
Guid.constants.lowerAlphanumerics = "0123456789abcdefghijklmnopqrstuvwxyz";
Guid.constants.alphanumerics = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
// http://tools.ietf.org/html/rfc1924
Guid.constants.base85 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+-;<=>?@^_`{|}~";


Guid.constants.epoch1970 = (new Date(0));
// Guid.constants.epoch2008 = (new Date("Jan 1 2008")).getTime();
Guid.constants.epoch = function(year) { return (new Date("Jan 1 " + year)).getTime(); }

function log() { console.log.apply(null, arguments); }
