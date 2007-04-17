/***
|''Name:''|CryptoTEAPlugin|
|''Description:''|TEA (Tiny Encryption Algorithm) and supporting Cryptographic functions|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/#CryptoTEAPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/CryptoTEAPlugin.js|
|''Version:''|0.1.6|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.3|

Based on [[Movable Type Script|http://www.movable-type.co.uk/scripts/TEAblock.html]]
***/

//{{{
// Ensure that the Crypto TEA Plugin is only installed once.
if(!version.extensions.CryptoTEAPlugin) {
	version.extensions.CryptoTEAPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1) || (version.major == 2 && version.minor == 1 && version.revision <3 ))
	alertAndThrow("CryptoTEAPlugin requires TiddlyWiki 2.1.3 or later.");

Crypto.b64open =  "''Base64''\n/*{{{*/\n";
Crypto.b64close = "\n/*}}}*/\n''Base64''";
Crypto.salt = String.fromCharCode(138,200,184,222,198,210,113,77);
Crypto.iterationCount = 2;

Crypto.passphraseToKey = function(passphrase)
// Use an interated SHA-1 hash of the salted passphrase as a reasonably good key
{
	postSalt = String.fromCharCode(23,160,248,216,146,5,102,239);
	var k = Crypto.sha1Str(Crypto.salt+passphrase+postSalt);
	for(var i = 1;i<Crypto.iterationCount;i++)
		k = Crypto.sha1(k,k.length);
	return k;
};

Crypto.base64armor = function(s)
{
	return Crypto.b64open + Crypto.base64encode(s) + Crypto.b64close;
};

Crypto.base64encode = function(s)
{
	b64code =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var line = '';
	var b64 = '';
	var maxLen4 = 60;
	var i;
	for(i=0;i<=s.length-3;i+=3) {
		if(line.length>maxLen4) {
			b64 += line + '\n';
			line = '';
		}
		line += b64code.charAt(s.charCodeAt(i)>>>2);
		line += b64code.charAt(((s.charCodeAt(i)&3)<<4) | (s.charCodeAt(i+1)>>>4));
		line += b64code.charAt(((s.charCodeAt(i+1)&0x0F)<< 2) | (s.charCodeAt(i+2)>>>6));
		line += b64code.charAt(s.charCodeAt(i+2)&0x3F);
	}
	if(i==s.length-1) {
		line += b64code.charAt(s.charCodeAt(i)>>>2);
		line += b64code.charAt((s.charCodeAt(i)&3)<<4);
		line += '==';
	} else if(i==s.length-2) {
		line += b64code.charAt(s.charCodeAt(i)>>>2);
		line += b64code.charAt(((s.charCodeAt(i)&3)<<4) | (s.charCodeAt(i+1)>>>4));
		line += b64code.charAt((s.charCodeAt(i+1)&0x0F)<<2);
		line += '=';
	}
	if(b64.length > maxLen4) {
		b64 += line + '\n';
		line = '';
	}
	b64 += line;
	return b64;
};

Crypto.base64decode = function(s)
{
	b64code= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var i;
	//# Remove the b64 open and close strings.
	if((i=s.indexOf(Crypto.b64open)) >= 0)
		s = s.substring(i + Crypto.b64open.length,s.length);
	if((i=s.indexOf(Crypto.b64close)) >= 0)
		s = s.substring(0,i);
	//# Ignore any non-base64 characters at the front of the string
	for(i=0;i<s.length;i++) {
		if(b64code.indexOf(s.charAt(i)) != -1)
			break;
	}
	//# Decode the base64 string.
	var j,c;
	var sg = 0;
	var n = 0;
	var b = new Array();
	var d = new Array();
	while(i<s.length) {
		for(j=0;j<4;) {
			if(i>=s.length) {
				if(j>0) {
					displayMessage("truncated");
					return b;
				}
				break;
			}
			c = b64code.indexOf(s.charAt(i));
			if(c>=0) {
				d[j++] = c;
			} else if(s.charAt(i)=='=') {
				d[j++] = 0;
				sg++;
			}
			i++;
		}
		if(j==4) {
			b[n++] = ((d[0]<<2) | (d[1]>>>4)) & 0xFF;
			if(sg<2) {
				b[n++] = ((d[1]<<4) | (d[2]>>>2)) & 0xFF;
				if(sg<1)
					b[n++] = ((d[2]<<6) | d[3]) & 0xFF;
			}
		}
	}
	var r = new Array(b.length);
	for(i=0;i<b.length;i++)
		r[i] = String.fromCharCode(b[i]);
	return r.join('');
};

Crypto.TEA = {};

Crypto.TEA.name = function()
{
	return 'TEA';
};

Crypto.TEA.base64encode = Crypto.base64armor;
Crypto.TEA.base64decode = Crypto.base64decode;

Crypto.TEA.encipher = function(v,k)
// Encrypt, using TEA, array v with key k
{
	if(v.length == 1) {
		//# algorithm doesn't work for n<2 so fudge by adding nulls
		v[1] = 0;
	}
	var n = v.length;
	var delta = 0x9E3779B9;
	//# 6 + 52/n operations gives between 6 & 32 mixes on each word
	var q = Math.floor(6+52/n);
	n--;
	var sum = 0;
//#	var y = v[0];
	var z = v[n];
	var y,mx,e;
	while(q-- > 0) {
		//# note use of >>> in place of >> due to lack of 'unsigned' type in JavaScript 
		sum += delta;
		e = sum>>>2 & 3;
		for(var p=0; p<n; p++) {
			y = v[p+1];
			mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
			z = v[p] += mx;
		}
		y = v[0];
		mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
		z = v[n] += mx;
	}
};

Crypto.TEA.decipher = function(v,k)
// Decrypt, using TEA, array v with key k
{
	var n = v.length;
	var delta = 0x9E3779B9;
	var sum = delta*Math.floor(6+52/n);
	n--;
	var y = v[0];
//#	var z = v[n];
	var z,mx,e;
	while(sum != 0) {
		e = sum>>>2 & 3;
		for(var p=n; p>0; p--) {
			z = v[p-1];
			mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
			y = v[p] -= mx;
		}
		z = v[n];
		mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
		y = v[0] -= mx;
		sum -= delta;
	}
};

Crypto.TEA.encrypt = function(plaintext,passphrase)
// Encrypt the plaintext
{
	if(plaintext.length == 0)
		return('');// nothing to encrypt
	var v = Crypto.strToBe32s(plaintext);
	Crypto.TEA.encipher(v,Crypto.passphraseToKey(passphrase));
	return Crypto.be32sToStr(v);
};

Crypto.TEA.encryptPassphrase = function(passphrase)
// Encrypt the passphrase with itself
{
	if(passphrase.length == 0)
		return('');// nothing to encrypt
	var v = Crypto.strToBe32s(passphrase);
	Crypto.TEA.encipher(v,Crypto.passphraseToKey(passphrase));
	var s = Crypto.base64encode(Crypto.be32sToStr(v)).substr(0,20);
	return s.replace(/\+/g,'a').replace(/\//g,'a').replace(/=/g,'c');
};

Crypto.TEA.decrypt = function(ciphertext,passphrase)
// Decrypt ciphertext
{
	if(ciphertext.length == 0)
		return('');// nothing to decrypt
	var v = Crypto.strToBe32s(ciphertext);
	Crypto.TEA.decipher(v,Crypto.passphraseToKey(passphrase));
	var plaintext = Crypto.be32sToStr(v);
	if(plaintext.search(/\0/) != -1) {
		//# strip trailing null chars resulting from filling 4-char blocks
		plaintext = plaintext.slice(0,plaintext.search(/\0/));
	}
	return plaintext;
};

} // end of 'install only once'
//}}}
