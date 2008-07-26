/***
|''Name:''|MD5 Unwound Plugin|
|''Description:''|Faster wersion of MD5 with unwound loops|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/MD5UnwoundPlugin.js |
|''Version:''|0.0.3|
|''Date:''|Jul 25,2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|

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
		str += String.fromCharCode((le[i>>5]>>>(i%32))&0xff);
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
	return Crypto.md5(Crypto.strToLe32s(str),str.length);
};

Crypto.md5 = function(x,blen){
	var len = blen*8;
	function a32(a,b){var lsw = (a&0xFFFF)+(b&0xFFFF);var msw = (a>>16)+(b>>16)+(lsw>>16);return (msw<<16)|(lsw&0xFFFF);}
	function add4(a,b,c,d){var lsw=(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF);var msw=(a>>16)+(b>>16)+(c>>16)+(d>>16)+(lsw>>16);return (msw<<16)|(lsw&0xFFFF);}
	function R(n,c){ return (n<<c)|(n>>>(32-c)); }
	function FF(a,b,c,d,x,s,t){return a32(R(add4(a,(b&c)|((~b)&d),x,t),s),b);}
	function GG(a,b,c,d,x,s,t){return a32(R(add4(a,(b&d)|(c&(~d)),x,t),s),b);}
	function HH(a,b,c,d,x,s,t){return a32(R(add4(a,b^c^d,x,t),s),b);}
	function II(a,b,c,d,x,s,t){return a32(R(add4(a,c^(b|(~d)),x,t),s),b);}

	x[len>>5]|=0x80<<((len)%32);
	x[(((len+64)>>>9)<<4)+14]=len;

	var h0 = 0x67452301;
	var h1 = 0xefcdab89;
	var h2 = 0x98badcfe;
	var h3 = 0x10325476;

	var x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,xA,xB,xC,xD,xE,xF;
	for(var i=0; i<x.length; i+=16){
		var a=h0;
		var b=h1;
		var c=h2;
		var d=h3;

		x0=x[i];
		x1=x[i+1];
		x2=x[i+2];
		x3=x[i+3];
		x4=x[i+4];
		x5=x[i+5];
		x6=x[i+6];
		x7=x[i+7];
		x8=x[i+8];
		x9=x[i+9];
		xA=x[i+10];
		xB=x[i+11];
		xC=x[i+12];
		xD=x[i+13];
		xE=x[i+14];
		xF=x[i+15];

		a=FF(a,b,c,d,x0,7 ,0xd76aa478);
		d=FF(d,a,b,c,x1,12,0xe8c7b756);
		c=FF(c,d,a,b,x2,17,0x242070db);
		b=FF(b,c,d,a,x3,22,0xc1bdceee);
		a=FF(a,b,c,d,x4,7 ,0xf57c0faf);
		d=FF(d,a,b,c,x5,12,0x4787c62a);
		c=FF(c,d,a,b,x6,17,0xa8304613);
		b=FF(b,c,d,a,x7,22,0xfd469501);
		a=FF(a,b,c,d,x8,7 ,0x698098d8);
		d=FF(d,a,b,c,x9,12,0x8b44f7af);
		c=FF(c,d,a,b,xA,17,0xffff5bb1);
		b=FF(b,c,d,a,xB,22,0x895cd7be);
		a=FF(a,b,c,d,xC,7 ,0x6b901122);
		d=FF(d,a,b,c,xD,12,0xfd987193);
		c=FF(c,d,a,b,xE,17,0xa679438e);
		b=FF(b,c,d,a,xF,22,0x49b40821);

		a=GG(a,b,c,d,x1,5 ,0xf61e2562);
		d=GG(d,a,b,c,x6,9 ,0xc040b340);
		c=GG(c,d,a,b,xB,14,0x265e5a51);
		b=GG(b,c,d,a,x0,20,0xe9b6c7aa);
		a=GG(a,b,c,d,x5,5 ,0xd62f105d);
		d=GG(d,a,b,c,xA,9 ,0x2441453);
		c=GG(c,d,a,b,xF,14,0xd8a1e681);
		b=GG(b,c,d,a,x4,20,0xe7d3fbc8);
		a=GG(a,b,c,d,x9,5 ,0x21e1cde6);
		d=GG(d,a,b,c,xE,9 ,0xc33707d6);
		c=GG(c,d,a,b,x3,14,0xf4d50d87);
		b=GG(b,c,d,a,x8,20,0x455a14ed);
		a=GG(a,b,c,d,xD,5 ,0xa9e3e905);
		d=GG(d,a,b,c,x2,9 ,0xfcefa3f8);
		c=GG(c,d,a,b,x7,14,0x676f02d9);
		b=GG(b,c,d,a,xC,20,0x8d2a4c8a);

		a=HH(a,b,c,d,x5,4 ,0xfffa3942);
		d=HH(d,a,b,c,x8,11,0x8771f681);
		c=HH(c,d,a,b,xB,16,0x6d9d6122);
		b=HH(b,c,d,a,xE,23,0xfde5380c);
		a=HH(a,b,c,d,x1,4 ,0xa4beea44);
		d=HH(d,a,b,c,x4,11,0x4bdecfa9);
		c=HH(c,d,a,b,x7,16,0xf6bb4b60);
		b=HH(b,c,d,a,xA,23,0xbebfbc70);
		a=HH(a,b,c,d,xD,4 ,0x289b7ec6);
		d=HH(d,a,b,c,x0,11,0xeaa127fa);
		c=HH(c,d,a,b,x3,16,0xd4ef3085);
		b=HH(b,c,d,a,x6,23,0x4881d05);
		a=HH(a,b,c,d,x9,4 ,0xd9d4d039);
		d=HH(d,a,b,c,xC,11,0xe6db99e5);
		c=HH(c,d,a,b,xF,16,0x1fa27cf8);
		b=HH(b,c,d,a,x2,23,0xc4ac5665);

		a=II(a,b,c,d,x0,6 ,0xf4292244);
		d=II(d,a,b,c,x7,10,0x432aff97);
		c=II(c,d,a,b,xE,15,0xab9423a7);
		b=II(b,c,d,a,x5,21,0xfc93a039);
		a=II(a,b,c,d,xC,6 ,0x655b59c3);
		d=II(d,a,b,c,x3,10,0x8f0ccc92);
		c=II(c,d,a,b,xA,15,0xffeff47d);
		b=II(b,c,d,a,x1,21,0x85845dd1);
		a=II(a,b,c,d,x8,6 ,0x6fa87e4f);
		d=II(d,a,b,c,xF,10,0xfe2ce6e0);
		c=II(c,d,a,b,x6,15,0xa3014314);
		b=II(b,c,d,a,xD,21,0x4e0811a1);
		a=II(a,b,c,d,x4,6 ,0xf7537e82);
		d=II(d,a,b,c,xB,10,0xbd3af235);
		c=II(c,d,a,b,x2,15,0x2ad7d2bb);
		b=II(b,c,d,a,x9,21,0xeb86d391);

		h0=a32(h0,a);
		h1=a32(h1,b);
		h2=a32(h2,c);
		h3=a32(h3,d);
	}
	return [h0,h1,h2,h3];
};

} // end of "install only once"
//}}}
