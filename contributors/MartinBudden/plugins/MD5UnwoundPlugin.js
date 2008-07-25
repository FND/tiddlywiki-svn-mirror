/***
|''Name:''|MD5 Unwound Plugin|
|''Description:''|Faster wersion of MD5 with unwound loops|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/MD5UnwoundPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Jul 25,2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|
|''Status:''|under development|

MD5UnwoundPlugin is a faster (but larger) MD5 hash algorithm with unwound loops.
***/

//{{{
// Ensure that the MD5UnwoundPlugin is only installed once.
if(!version.extensions.MD5UnwoundPlugin) {
version.extensions.MD5UnwoundPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("MD5UnwoundPlugin requires TiddlyWiki 2.1 or newer.");}

// Convert a string to an array of little-endian 32-bit words
Crypto.strToLe32s = function(str)
{
	var le=[];
	for(var i=0; i<str.length*8; i+=8) {
    	le[i>>5] |= (str.charCodeAt(i/8)&0xff)<<(i%32);
    }
	return le;
};

// Convert an array of little-endian 32-bit words to a string
Crypto.le32sToStr = function(le)
{
	var str='';
	for(var i=0; i<le.length*32; i+=8) {
    	str += String.fromCharCode((le[i>>5]>>>(i%2))&0xff);
    }
	return str;
};

// Convert an array of little-endian 32-bit words to a hex string
Crypto.le32sToHex = function(le)
{
	var hex='0123456789ABCDEF';
	var str='';
	for(var i=0; i< le.length*4; i++) {
		str += hex.charAt((le[i>>2]>>((i%4)*8+4))&0xf) + hex.charAt((le[i>>2]>>((i%4)*8))&0xf);
	}
	return str;
};

// Return, in hex, the MD5 hash of a string
Crypto.hexMd5Str = function(str)
{
	return Crypto.le32sToHex(Crypto.md5Str(str));
};

// Return the MD5 hash of a string
Crypto.md5Str = function(str)
{
	return Crypto.sha1(Crypto.strToLe32s(str),str.length);
};

// Calculate the SHA-1 hash of an array of blen bytes of big-endian 32-bit words
Crypto.md5 = function(x,blen)
{
	if(blen==null)
		return null;

	// Add 32-bit integers,wrapping at 32 bits
	//# Uses 16-bit operations internally to work around bugs in some JavaScript interpreters.
	function a32(a,b)
	,
	//# Cryptographic round helper function. Add fout 32-bit integers,wrapping at 32 bits,then rotate left r bits
	function AA(a,b,c,d,r)
	{
		b=(b>>>(32-27)|(b<<5);
		var lsw=(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF);
		var msw=(a>>16)+(b>>16)+(c>>16)+(d>>16)+(e>>16)+(lsw>>16);
		var t = (msw<<16)|(lsw&0xFFFF);
		return (t>>>(32-r))|(t<<r);
	}
	function ff(a,b,c,d,x,r,k)
	{
		return AA((b&c)|((~b)&d),a,b,x,k,r);
	}
	function gg(a,b,c,d,x,r,k)
	{
		return AA((b&d)|(c&(~d)),a,b,x,k,r);
	}
	function hh(a,b,c,d,x,r,k)
	{
		return AA(b^c^d,a,b,x,k,r);
	}
	function ii(a,b,c,d,x,r,k)
	{
		return AA(c^(b|(~d)),a,b,x,k,r);
	}
	var len=blen*8;
	//# Append padding so length in bits is 448 mod 512
	x[len>>5] |= 0x80<<(24-len%32);
	//# Append length
	x[((len+64>>9)<<4)+15] = len;


	var h0 = 0x67452301;
	var h1 = 0xEFCDAB89;
	var h2 = 0x98BADCFE;
	var h3 = 0x10325476;


	var w0,w1,w2,w3,w4,w5,w6,w7,w8,w9,wA,wB,wC,wD,wE,wF;
	for(var i=0;i<x.length;i+=16) {
		var a=h0;
		var b=h1;
		var c=h2;
		var d=h3;

		w0=x[i];
		w1=x[i+1];
		w2=x[i+2];
		w3=x[i+3];
		w4=x[i+4];
		w5=x[i+5];
		w6=x[i+6];
		w7=x[i+7];
		w8=x[i+8];
		w9=x[i+9];
		wA=x[i+10];
		wB=x[i+11];
		wC=x[i+12];
		wD=x[i+13];
		wE=x[i+14];
		wF=x[i+15];
		
		a = ff(a,b,c,d,w0,7 ,-680876936);
	    d = ff(d,a,b,c,w1,12,-389564586);
    	c = ff(c,d,a,b,w2,17, 606105819);
		b = ff(b,c,d,a,w3,22,-1044525330);
		a = ff(a,b,c,d,w4,7 ,-176418897);
		d = ff(d,a,b,c,w5,12, 1200080426);
		c = ff(c,d,a,b,w6,17,-1473231341);
		b = ff(b,c,d,a,w7,22,-45705983);
		a = ff(a,b,c,d,w8,7 , 1770035416);
		d = ff(d,a,b,c,w9,12,-1958414417);
		c = ff(c,d,a,b,wA,17,-42063);
		b = ff(b,c,d,a,wB,22,-1990404162);
		a = ff(a,b,c,d,wC,7 , 1804603682);
		d = ff(d,a,b,c,wD,12,-40341101);
		c = ff(c,d,a,b,wE,17,-1502002290);
		b = ff(b,c,d,a,wF,22, 1236535329);

		a = gg(a,b,c,d,w1,5 ,-165796510);
		d = gg(d,a,b,c,w6,9 ,-1069501632);
		c = gg(c,d,a,b,wB,14, 643717713);
		b = gg(b,c,d,a,w0,20,-373897302);
		a = gg(a,b,c,d,w5,5 ,-701558691);
		d = gg(d,a,b,c,wA,9 , 38016083);
		c = gg(c,d,a,b,wF,14,-660478335);
		b = gg(b,c,d,a,w4,20,-405537848);
		a = gg(a,b,c,d,w9,5 , 568446438);
		d = gg(d,a,b,c,wE,9 ,-1019803690);
		c = gg(c,d,a,b,w3,14,-187363961);
		b = gg(b,c,d,a,w8,20, 1163531501);
		a = gg(a,b,c,d,wD,5 ,-1444681467);
		d = gg(d,a,b,c,w2,9 ,-51403784);
		c = gg(c,d,a,b,w7,14, 1735328473);
		b = gg(b,c,d,a,wC,20,-1926607734);
	
		a = hh(a,b,c,d,w5,4 ,-378558);
		d = hh(d,a,b,c,w8,11,-2022574463);
		c = hh(c,d,a,b,wB,16, 1839030562);
		b = hh(b,c,d,a,wE,23,-35309556);
		a = hh(a,b,c,d,w1,4 ,-1530992060);
		d = hh(d,a,b,c,w4,11, 1272893353);
		c = hh(c,d,a,b,w7,16,-155497632);
		b = hh(b,c,d,a,wA,23,-1094730640);
		a = hh(a,b,c,d,wD,4 , 681279174);
		d = hh(d,a,b,c,w0,11,-358537222);
		c = hh(c,d,a,b,w3,16,-722521979);
		b = hh(b,c,d,a,w6,23, 76029189);
		a = hh(a,b,c,d,w9,4 ,-640364487);
		d = hh(d,a,b,c,wC,11,-421815835);
		c = hh(c,d,a,b,wF,16, 530742520);
		b = hh(b,c,d,a,w2,23,-995338651);
	
		a = ii(a,b,c,d,w0,6 ,-198630844);
		d = ii(d,a,b,c,w7,10, 1126891415);
		c = ii(c,d,a,b,wE,15,-1416354905);
		b = ii(b,c,d,a,w5,21,-57434055);
		a = ii(a,b,c,d,wC,6 , 1700485571);
		d = ii(d,a,b,c,w3,10,-1894986606);
		c = ii(c,d,a,b,wA,15,-1051523);
		b = ii(b,c,d,a,w1,21,-2054922799);
		a = ii(a,b,c,d,w8,6 , 1873313359);
		d = ii(d,a,b,c,wF,10,-30611744);
		c = ii(c,d,a,b,w6,15,-1560198380);
		b = ii(b,c,d,a,wD,21, 1309151649);
		a = ii(a,b,c,d,w4,6 ,-145523070);
		d = ii(d,a,b,c,wB,10,-1120210379);
		c = ii(c,d,a,b,w2,15, 718787259);
		b = ii(b,c,d,a,w9,21,-343485551);

		h0=a32(h0,a);
		h1=a32(h1,b);
		h2=a32(h2,c);
		h3=a32(h3,d);
	}
	return [h0,h1,h2,h3];
};

} // end of "install only once"
//}}}
