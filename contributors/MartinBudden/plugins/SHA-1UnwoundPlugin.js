/***
|''Name:''|SHA-1 Unwound Plugin|
|''Description:''|Faster wersion of SHA-1 with unwound loops|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/martinswiki.html#SHA-1UnwoundPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SHA-1UnwoundPlugin.js |
|''Version:''|1.0.2|
|''Date:''|Jul 21, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

SHA1UnwoundPlugin is a faster (but larger) SHA-1 hash algorithm with unwound loops.
***/

//{{{
// Ensure that the SHA1UnwoundPlugin is only installed once.
if(!version.extensions.SHA1UnwoundPlugin) {
version.extensions.SHA1UnwoundPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("SHA-1UnwoundPlugin requires TiddlyWiki 2.1 or newer.");}

// Calculate the SHA-1 hash of an array of blen bytes of big-endian 32-bit words
Crypto.sha1 = function(x,blen)
{
	if(blen==null)
		return null;

	// Add 32-bit integers, wrapping at 32 bits
	//# Uses 16-bit operations internally to work around bugs in some JavaScript interpreters.
	function a32(a,b)
	{
		var lsw = (a&0xFFFF)+(b&0xFFFF);
		var msw = (a>>16)+(b>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	}
	//# Cryptographic round helper function. Add five 32-bit integers, wrapping at 32 bits, second parameter is rotated left 5 bits before the addition
	function AA(a,b,c,d,e)
	{
		b=(b>>>27)|(b<<5);
		var lsw=(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF)+(e&0xFFFF);
		var msw=(a>>16)+(b>>16)+(c>>16)+(d>>16)+(e>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	}
	//# rotate left 1 bit
	function R1(n) { return (n<<1)|(n>>>31); }

	var len=blen*8;
	//# Append padding so length in bits is 448 mod 512
	x[len>>5] |= 0x80<<(24-len%32);
	//# Append length
	x[((len+64>>9)<<4)+15] = len;

	var k1=0x5A827999;
	var k2=0x6ED9EBA1;
	var k3=0x8F1BBCDC;
	var k4=0xCA62C1D6;

	var h0=0x67452301;
	var h1=0xEFCDAB89;
	var h2=0x98BADCFE;
	var h3=0x10325476;
	var h4=0xC3D2E1F0;

	var w0,w1,w2,w3,w4,w5,w6,w7,w8,w9,wA,wB,wC,wD,wE,wF;
	for(var i=0;i<x.length;i+=16) {
		var a=h0;
		var b=h1;
		var c=h2;
		var d=h3;
		var e=h4;

		w0=x[i];   e=AA(e,a,d^(b&(c^d)),w0,k1);b=(b>>>2)|(b<<30);
		w1=x[i+1]; d=AA(d,e,c^(a&(b^c)),w1,k1);a=(a>>>2)|(a<<30);
		w2=x[i+2]; c=AA(c,d,b^(e&(a^b)),w2,k1);e=(e>>>2)|(e<<30);
		w3=x[i+3]; b=AA(b,c,a^(d&(e^a)),w3,k1);d=(d>>>2)|(d<<30);
		w4=x[i+4]; a=AA(a,b,e^(c&(d^e)),w4,k1);c=(c>>>2)|(c<<30);
		w5=x[i+5]; e=AA(e,a,d^(b&(c^d)),w5,k1);b=(b>>>2)|(b<<30);
		w6=x[i+6]; d=AA(d,e,c^(a&(b^c)),w6,k1);a=(a>>>2)|(a<<30);
		w7=x[i+7]; c=AA(c,d,b^(e&(a^b)),w7,k1);e=(e>>>2)|(e<<30);
		w8=x[i+8]; b=AA(b,c,a^(d&(e^a)),w8,k1);d=(d>>>2)|(d<<30);
		w9=x[i+9]; a=AA(a,b,e^(c&(d^e)),w9,k1);c=(c>>>2)|(c<<30);
		wA=x[i+10];e=AA(e,a,d^(b&(c^d)),wA,k1);b=(b>>>2)|(b<<30);
		wB=x[i+11];d=AA(d,e,c^(a&(b^c)),wB,k1);a=(a>>>2)|(a<<30);
		wC=x[i+12];c=AA(c,d,b^(e&(a^b)),wC,k1);e=(e>>>2)|(e<<30);
		wD=x[i+13];b=AA(b,c,a^(d&(e^a)),wD,k1);d=(d>>>2)|(d<<30);
		wE=x[i+14];a=AA(a,b,e^(c&(d^e)),wE,k1);c=(c>>>2)|(c<<30);
		wF=x[i+15];e=AA(e,a,d^(b&(c^d)),wF,k1);b=(b>>>2)|(b<<30);
		w0=R1(wD^w8^w2^w0);d=AA(d,e,c^(a&(b^c)),w0,k1);a=(a>>>2)|(a<<30);
		w1=R1(wE^w9^w3^w1);c=AA(c,d,b^(e&(a^b)),w1,k1);e=(e>>>2)|(e<<30);
		w2=R1(wF^wA^w4^w2);b=AA(b,c,a^(d&(e^a)),w2,k1);d=(d>>>2)|(d<<30);
		w3=R1(w0^wB^w5^w3);a=AA(a,b,e^(c&(d^e)),w3,k1);c=(c>>>2)|(c<<30);

		w4=R1(w1^wC^w6^w4);e=AA(e,a,b^c^d,w4,k2);b=(b>>>2)|(b<<30);
		w5=R1(w2^wD^w7^w5);d=AA(d,e,a^b^c,w5,k2);a=(a>>>2)|(a<<30);
		w6=R1(w3^wE^w8^w6);c=AA(c,d,e^a^b,w6,k2);e=(e>>>2)|(e<<30);
		w7=R1(w4^wF^w9^w7);b=AA(b,c,d^e^a,w7,k2);d=(d>>>2)|(d<<30);
		w8=R1(w5^w0^wA^w8);a=AA(a,b,c^d^e,w8,k2);c=(c>>>2)|(c<<30);
		w9=R1(w6^w1^wB^w9);e=AA(e,a,b^c^d,w9,k2);b=(b>>>2)|(b<<30);
		wA=R1(w7^w2^wC^wA);d=AA(d,e,a^b^c,wA,k2);a=(a>>>2)|(a<<30);
		wB=R1(w8^w3^wD^wB);c=AA(c,d,e^a^b,wB,k2);e=(e>>>2)|(e<<30);
		wC=R1(w9^w4^wE^wC);b=AA(b,c,d^e^a,wC,k2);d=(d>>>2)|(d<<30);
		wD=R1(wA^w5^wF^wD);a=AA(a,b,c^d^e,wD,k2);c=(c>>>2)|(c<<30);
		wE=R1(wB^w6^w0^wE);e=AA(e,a,b^c^d,wE,k2);b=(b>>>2)|(b<<30);
		wF=R1(wC^w7^w1^wF);d=AA(d,e,a^b^c,wF,k2);a=(a>>>2)|(a<<30);
		w0=R1(wD^w8^w2^w0);c=AA(c,d,e^a^b,w0,k2);e=(e>>>2)|(e<<30);
		w1=R1(wE^w9^w3^w1);b=AA(b,c,d^e^a,w1,k2);d=(d>>>2)|(d<<30);
		w2=R1(wF^wA^w4^w2);a=AA(a,b,c^d^e,w2,k2);c=(c>>>2)|(c<<30);
		w3=R1(w0^wB^w5^w3);e=AA(e,a,b^c^d,w3,k2);b=(b>>>2)|(b<<30);
		w4=R1(w1^wC^w6^w4);d=AA(d,e,a^b^c,w4,k2);a=(a>>>2)|(a<<30);
		w5=R1(w2^wD^w7^w5);c=AA(c,d,e^a^b,w5,k2);e=(e>>>2)|(e<<30);
		w6=R1(w3^wE^w8^w6);b=AA(b,c,d^e^a,w6,k2);d=(d>>>2)|(d<<30);
		w7=R1(w4^wF^w9^w7);a=AA(a,b,c^d^e,w7,k2);c=(c>>>2)|(c<<30);

		w8=R1(w5^w0^wA^w8);e=AA(e,a,(b&c)|(d&(b|c)),w8,k3);b=(b>>>2)|(b<<30);
		w9=R1(w6^w1^wB^w9);d=AA(d,e,(a&b)|(c&(a|b)),w9,k3);a=(a>>>2)|(a<<30);
		wA=R1(w7^w2^wC^wA);c=AA(c,d,(e&a)|(b&(e|a)),wA,k3);e=(e>>>2)|(e<<30);
		wB=R1(w8^w3^wD^wB);b=AA(b,c,(d&e)|(a&(d|e)),wB,k3);d=(d>>>2)|(d<<30);
		wC=R1(w9^w4^wE^wC);a=AA(a,b,(c&d)|(e&(c|d)),wC,k3);c=(c>>>2)|(c<<30);
		wD=R1(wA^w5^wF^wD);e=AA(e,a,(b&c)|(d&(b|c)),wD,k3);b=(b>>>2)|(b<<30);
		wE=R1(wB^w6^w0^wE);d=AA(d,e,(a&b)|(c&(a|b)),wE,k3);a=(a>>>2)|(a<<30);
		wF=R1(wC^w7^w1^wF);c=AA(c,d,(e&a)|(b&(e|a)),wF,k3);e=(e>>>2)|(e<<30);
		w0=R1(wD^w8^w2^w0);b=AA(b,c,(d&e)|(a&(d|e)),w0,k3);d=(d>>>2)|(d<<30);
		w1=R1(wE^w9^w3^w1);a=AA(a,b,(c&d)|(e&(c|d)),w1,k3);c=(c>>>2)|(c<<30);
		w2=R1(wF^wA^w4^w2);e=AA(e,a,(b&c)|(d&(b|c)),w2,k3);b=(b>>>2)|(b<<30);
		w3=R1(w0^wB^w5^w3);d=AA(d,e,(a&b)|(c&(a|b)),w3,k3);a=(a>>>2)|(a<<30);
		w4=R1(w1^wC^w6^w4);c=AA(c,d,(e&a)|(b&(e|a)),w4,k3);e=(e>>>2)|(e<<30);
		w5=R1(w2^wD^w7^w5);b=AA(b,c,(d&e)|(a&(d|e)),w5,k3);d=(d>>>2)|(d<<30);
		w6=R1(w3^wE^w8^w6);a=AA(a,b,(c&d)|(e&(c|d)),w6,k3);c=(c>>>2)|(c<<30);
		w7=R1(w4^wF^w9^w7);e=AA(e,a,(b&c)|(d&(b|c)),w7,k3);b=(b>>>2)|(b<<30);
		w8=R1(w5^w0^wA^w8);d=AA(d,e,(a&b)|(c&(a|b)),w8,k3);a=(a>>>2)|(a<<30);
		w9=R1(w6^w1^wB^w9);c=AA(c,d,(e&a)|(b&(e|a)),w9,k3);e=(e>>>2)|(e<<30);
		wA=R1(w7^w2^wC^wA);b=AA(b,c,(d&e)|(a&(d|e)),wA,k3);d=(d>>>2)|(d<<30);
		wB=R1(w8^w3^wD^wB);a=AA(a,b,(c&d)|(e&(c|d)),wB,k3);c=(c>>>2)|(c<<30);

		wC=R1(w9^w4^wE^wC);e=AA(e,a,b^c^d,wC,k4);b=(b>>>2)|(b<<30);
		wD=R1(wA^w5^wF^wD);d=AA(d,e,a^b^c,wD,k4);a=(a>>>2)|(a<<30);
		wE=R1(wB^w6^w0^wE);c=AA(c,d,e^a^b,wE,k4);e=(e>>>2)|(e<<30);
		wF=R1(wC^w7^w1^wF);b=AA(b,c,d^e^a,wF,k4);d=(d>>>2)|(d<<30);
		w0=R1(wD^w8^w2^w0);a=AA(a,b,c^d^e,w0,k4);c=(c>>>2)|(c<<30);
		w1=R1(wE^w9^w3^w1);e=AA(e,a,b^c^d,w1,k4);b=(b>>>2)|(b<<30);
		w2=R1(wF^wA^w4^w2);d=AA(d,e,a^b^c,w2,k4);a=(a>>>2)|(a<<30);
		w3=R1(w0^wB^w5^w3);c=AA(c,d,e^a^b,w3,k4);e=(e>>>2)|(e<<30);
		w4=R1(w1^wC^w6^w4);b=AA(b,c,d^e^a,w4,k4);d=(d>>>2)|(d<<30);
		w5=R1(w2^wD^w7^w5);a=AA(a,b,c^d^e,w5,k4);c=(c>>>2)|(c<<30);
		w6=R1(w3^wE^w8^w6);e=AA(e,a,b^c^d,w6,k4);b=(b>>>2)|(b<<30);
		w7=R1(w4^wF^w9^w7);d=AA(d,e,a^b^c,w7,k4);a=(a>>>2)|(a<<30);
		w8=R1(w5^w0^wA^w8);c=AA(c,d,e^a^b,w8,k4);e=(e>>>2)|(e<<30);
		w9=R1(w6^w1^wB^w9);b=AA(b,c,d^e^a,w9,k4);d=(d>>>2)|(d<<30);
		wA=R1(w7^w2^wC^wA);a=AA(a,b,c^d^e,wA,k4);c=(c>>>2)|(c<<30);
		wB=R1(w8^w3^wD^wB);e=AA(e,a,b^c^d,wB,k4);b=(b>>>2)|(b<<30);
		wC=R1(w9^w4^wE^wC);d=AA(d,e,a^b^c,wC,k4);a=(a>>>2)|(a<<30);
		wD=R1(wA^w5^wF^wD);c=AA(c,d,e^a^b,wD,k4);e=(e>>>2)|(e<<30);
		wE=R1(wB^w6^w0^wE);b=AA(b,c,d^e^a,wE,k4);d=(d>>>2)|(d<<30);
		wF=R1(wC^w7^w1^wF);a=AA(a,b,c^d^e,wF,k4);c=(c>>>2)|(c<<30);

		h0=a32(h0,a);
		h1=a32(h1,b);
		h2=a32(h2,c);
		h3=a32(h3,d);
		h4=a32(h4,e);
	}
	return [h0,h1,h2,h3,h4];
};

} // end of "install only once"
//}}}
