// ---------------------------------------------------------------------------------
// Crypto functions and associated conversion routines
// ---------------------------------------------------------------------------------

// Crypto "namespace"
function Crypto() {}

// Convert a string to an array of big-endian 32-bit words
Crypto.strToBe32s = function(str)
{
	var be = Array();
	var len = Math.floor(str.length/4);
	var i, j;
	for(i=0, j=0; i<len; i++, j+=4)
		{
		be[i] = ((str.charCodeAt(j)&0xff) << 24)|((str.charCodeAt(j+1)&0xff) << 16)|((str.charCodeAt(j+2)&0xff) << 8)|(str.charCodeAt(j+3)&0xff);
		}
	while (j<str.length)
		{
		be[j>>2] |= (str.charCodeAt(j)&0xff)<<(24-(j*8)%32);
		j++;
		}
	return be;
}

// Convert an array of big-endian 32-bit words to a string
Crypto.be32sToStr = function(be)
{
	var str = "";
	for(var i=0;i<be.length*32;i+=8)
		str += String.fromCharCode((be[i>>5]>>>(24-i%32)) & 0xff);
	return str;
}

// Convert an array of big-endian 32-bit words to a hex string
Crypto.be32sToHex = function(be)
{
	var hex = "0123456789ABCDEF";
	var str = "";
	for(var i=0;i<be.length*4;i++)
		str += hex.charAt((be[i>>2]>>((3-i%4)*8+4))&0xF) + hex.charAt((be[i>>2]>>((3-i%4)*8))&0xF);
	return str;
}

// Return, in hex, the SHA-1 hash of a string
Crypto.hexSha1Str = function(str)
{
	return Crypto.be32sToHex(Crypto.sha1Str(str));
}

// Return the SHA-1 hash of a string
Crypto.sha1Str = function(str)
{
	return Crypto.sha1(Crypto.strToBe32s(str),str.length);
}

