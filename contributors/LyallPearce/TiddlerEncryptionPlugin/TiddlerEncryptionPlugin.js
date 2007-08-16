/***
|''Name:''|TiddlerEncryptionPlugin|
|''Author:''|Lyall Pearce|
|''Source:''|http://www.Remotely-Helpful.com/TiddlyWiki/TiddlerEncryptPlugin.html|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Version:''|1.5.2|
|''~CoreVersion:''|2.2.4|
|''Requires:''| |
|''Overrides:''|store.getSaver().externalizeTiddler(), store.getTiddler() and store.getTiddlerText()|
|''Description:''|Encrypt/Decrypt Tiddlers with a Password key|

!!!!!Usage
<<<
* Tag a tiddler with Encrypt(prompt)
** Consider the 'prompt' something to help you remember the password with. If multiple tiddlers can be encrypted with the same 'prompt' and you will only be asked for the password once.
* Upon save, the Tiddler will be encrypted and the tag replaced with Decrypt(prompt).
** Failure to encrypt (by not entering a password) will leave the tiddler unencrypted and will leave the Encrypt(prompt) tag in place. This means that the next time you save, you will be asked for the password again.
** To have multiple tiddlers use the same password - simply use the same 'prompt'.
** Tiddlers that are encrypted are also tagged 'excludeSearch' as there is no point in searching encrypted data
** Encrypted tiddlers are stored as displayable hex, to keep things visibly tidy, should you display an encrypted tiddler. There is nothing worse than seeing a pile of gobbledy gook on your screen.
* Tiddlers are decrypted on initial display
** If you don't display a tiddler, you won't decrypt it.
** Tiddlers will re-encrypt automatically on save.
** Decryption of Tiddlers does not make your TiddlyWiki 'dirty' - you will not be asked to save if you leave the page.
* Errors are reported either by displaying the shadow tiddler DecryptionFailed or displaying the encrypted tiddler contents. This is configurable in AdvancedOptions
** Empty passwords, on save, will result in the tiddler being saved unencrypted - this should only occur with new tiddlers or with tiddlers who have had their 'prompt' tag changed.
** Encrypted tiddlers know if they are decrypted successfully - failure to decrypt a tiddler will ''not'' lose your data.
** Editing of an encrypted (that has not been unencrypted) tiddler will result in loss of that tiddler as the SHA1 checksums will no longer match, upon decryption. To this end, it is best that you do not check the option in AdvancedOptions
** To change the password on a Tiddler, change the 'prompt' to a new value, after decrypting the tiddler.
** You can edit the tags of an encrypted tiddler, so long as you do not edit the text.
** To change the password for all tiddlers of a particular prompt, use the {{{<<EncryptionChangePassword ["button text" ["tooltip text" ["prompt string"]]]>>}}} macro.
** To decrypt all tiddlers of a particular "prompt string", use the {{{<<EncryptionDecryptAll ["button text" ["tooltip text" ["prompt string"]]]>>}}} macro - this will make tiddlers encrypted with "prompt string" searchable - or prompt for all 'prompt strings', if none is supplied.
<<<
!!!!!Revision History
<<<
* 1.0.0 - Initial release
* 1.1.0 - Cached passwords across tiddlers (not per tiddler) plus use Shadow tiddlers for display on failed decryptions.
* 1.2.0 - catch 'cancel' on password entry and options to not use the shadow tiddler reporting mechanism
* 1.3.0 - Change password caching mechansim slightly. Change the decryption hook so we now capture {{{<<tiddler encryptedTiddlers>>}}}. Ditched the shadow tiddler diagnostics - either display encrypted tiddler or pretend the encrypted tiddler does not exist, when decryption fails.
* 1.4.0 - Added Change password macro and decrypt all macro. Also make use of the displayMessage() method. <<EncryptionChangePassword>><<EncryptionDecryptAll>>
* 1.5.0 - Password change macro now has button text, tooltip and default prompt string parameters. Password change now sets store to dirty. Re-instated DecryptionFailed shadow tiddler, which is shown as tiddler contents if decryption fails and the AdvancedOptions checkbox is not checked.
* 1.5.1 - Invoke autosave after changing passwords - which may result in prompting for passwords of unencrypted tiddlers that require encryption and whose passwords have not been entered yet. Also improved integration with regard to retrieving tiddlerText
* 1.5.2 - Use parameter parsing on the prompt string allowing dynamic prompt generation {{{ {{javascript}} }}} in EncryptionChangePassword and EncryptionDecryptAll macros.
<<<
!!!!!Additional work
<<<
* If the tiddler is encryptable, do not include it's body in an RSS feed. 
* Obscure the password on entry.
<<<

***/
//{{{
version.extensions.TiddlerEncryptionPlugin = {major: 1, minor: 5, revision: 2, date: new Date(2007,8,7)};

// where I cache the passwords - for want of a better place.
config.encryptionPasswords = new Array();

// Setup option for using shadow tiddlers for display of errors or simply show the 'encrypted tiddler'
if(config.options.chkEncryptShowEncrypted == undefined) config.options.chkEncryptShowEncrypted = false;
if(config.optionsDesc.chkEncryptShowEncrypted == undefined) config.optionsDesc.chkEncryptShowEncrypted = "TiddlerEncryptionPlugin\nShow encrypted tiddler contents on decrypt failure.\n<<EncryptionChangePassword>> - Change passwords of encrypted tiddlers\n<<EncryptionDecryptAll>> - Decrypt ALL tiddlers - enables searching.";

config.shadowTiddlers.DecryptionFailed = "Decryption of an encrypted tiddler failed.";

config.macros.EncryptionChangePassword = {};
config.macros.EncryptionChangePassword.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
    var theButton = createTiddlyButton(place,
				       params[0] ? params[0] : "Change Passwords", 
				       params[1] ? params[1] : "Change Passwords" + (params[2] ? " for prompt "+params[2] : ""), 
				       onClickEncryptionChangePassword);
    if(params[2]) {
	theButton.setAttribute("promptString", params[2]);
    }
};

config.macros.EncryptionDecryptAll = {};
config.macros.EncryptionDecryptAll.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
    var theButton = createTiddlyButton(place,
				       params[0] ? params[0] : "Decrypt All", 
				       params[1] ? params[1] : "Decrypt All Tiddlers" + (params[2] ? " for prompt "+params[2] : " for a given 'prompt string'"), 
				       onClickEncryptionDecryptAll);
    if(params[2]) {
	theButton.setAttribute("promptString", params[2]);
    }
};

function onClickEncryptionChangePassword() {
    // Prompt for 'prompt string'
    
    var promptString = this.getAttribute("promptString").readMacroParams();
    if(!promptString) {
	promptString = prompt("Enter 'prompt string' to change password for:", "");
    }
    if(!promptString) {
	return;
    }
    // Prompt for 'old password'
    var oldPassword = GetAndSetPasswordForPrompt(promptString);
    if(!oldPassword) {
	return;
    }
    // Decrypt ALL tiddlers for that prompt
    var decryptTag = "Decrypt("+promptString+")";
    var tiddlersToDecrypt = store.getTaggedTiddlers(decryptTag);
    try {
	for(var ix=0; ix<tiddlersToDecrypt.length; ix++) {
	    CheckTiddlerForDecryption_TiddlerEncryptionPlugin(tiddlersToDecrypt[ix]);
	}
    } catch (e) {
	if(e == "DecryptionFailed") {
	    displayMessage("Password incorrect.");
	    return;
	} else {
	    throw e;
	}
    }
    var newPassword = prompt("Enter new password for '"+promptString+"'", "");
    if(newPassword) {
	var newPasswordAgain = prompt("Enter new password, again, for '"+promptString+"'", "");
	if(newPasswordAgain && newPassword == newPasswordAgain) {
	    config.encryptionPasswords[promptString] = newPasswordAgain;
	    displayMessage("Password for '"+promptString+"' updated.");
	}
    }
    store.setDirty(true);
    autoSaveChanges();
    return;
};

function onClickEncryptionDecryptAll() {
    var promptString = this.getAttribute("promptString").readMacroParams();
    if(!promptString) {
	promptString = "";
    }
    var tagToSearchFor="Decrypt("+promptString;
    try {
	store.forEachTiddler(function(store,tiddler) {
		if(tiddler && tiddler.tags) {
		    for(var ix=0; ix<tiddler.tags.length; ix++) {
			if(tiddler.tags[ix].indexOf(tagToSearchFor) == 0) {
			    try {
				CheckTiddlerForDecryption_TiddlerEncryptionPlugin(tiddler);
			    } catch (e) {
				displayMessage("Decryption of '"+tiddler.title+"' failed.");
				throw e;
			    }
			} // if(tiddler.tags
		    } // for
		} // if
	    }); // store.forEachTiddler
	displayMessage("All encrypted tiddlers have been decrypted" + (promptString != "" ? "for '"+promptString : ""));
    } catch (e) {
	if(e == "DecryptionFailed") {
	    return;
	}
    } // catch
    return;
};

store.getSaver().externalizeTiddler_TiddlerEncryptionPlugin = store.getSaver().externalizeTiddler;
store.getSaver().externalizeTiddler = function(store, tiddler) {
    // Ok, got the tiddler, track down the passwordPrompt in the tags.
    // track down the Encrypt(passwordPrompt) tag
    if(tiddler && tiddler.tags) {
	for(var g=0; g<tiddler.tags.length; g++) {
	    var tag = tiddler.tags[g];
	    if(tag.indexOf("Encrypt(") == 0) {
		var lastBracket=tag.lastIndexOf(")");
		if(lastBracket >= 0) {
		    // Ok, tagged with Encrypt(passwordPrompt)
		    // extract the passwordPrompt name
		    var passwordPrompt=tag.substring(8,lastBracket);
		    // Ok, Encrypt this tiddler!
		    var decryptedSHA1 = Crypto.hexSha1Str(tiddler.text);
		    var password =  GetAndSetPasswordForPrompt(passwordPrompt);
		    if(password) {
			var encryptedText = TEAencrypt(tiddler.text, password);
			encryptedText = StringToHex(encryptedText);
			tiddler.text = "Encrypted("+decryptedSHA1+")\n"+encryptedText;
			// Replace the Tag with the Decrypt() tag
			tiddler.tags[g]="Decrypt("+passwordPrompt+")";
			// let the store know it's dirty
			store.setDirty(tiddler.title, true);
			// prevent searches on encrypted tiddlers, bit pointless really.
			tiddler.tags.push("excludeSearch");
		    } else {
			// do not encrypt - no password entered
		    }
		    break;
		} // if (lastBracket...
	    } // if(tag.indexOf(...
	} // for(var g=0;...
    } // if(tiddler.tags...
    
    // Then, finally, do the save by calling the function we override.

    return store.getSaver().externalizeTiddler_TiddlerEncryptionPlugin(store, tiddler);
};

function CheckTiddlerForDecryption_TiddlerEncryptionPlugin(tiddler) {
    if(tiddler && tiddler.tags) {
	for(var g=0; g<tiddler.tags.length; g++) {
	    var tag = tiddler.tags[g];
	    if(tag.indexOf("Decrypt(") == 0) {
		var lastBracket=tag.lastIndexOf(")");
		if(lastBracket >= 0) {
		    if(tiddler.text.substr(0,10) == "Encrypted(") {
			var closingSHA1Bracket = tiddler.text.indexOf(")");
			var decryptedSHA1 = tiddler.text.substring(10, closingSHA1Bracket);
			// Ok, tagged with Decrypt(passwordPrompt)
			// extract the passwordPrompt name
			var passwordPrompt=tag.substring(8,lastBracket);
			// Ok, Decrypt this tiddler!
			var decryptedText = tiddler.text.substr(closingSHA1Bracket+2);
			decryptedText = HexToString(decryptedText);
			var password = GetAndSetPasswordForPrompt(passwordPrompt);
			if(password) {
			    decryptedText = TEAdecrypt(decryptedText, password );
			    var thisDecryptedSHA1 = Crypto.hexSha1Str(decryptedText);
			    if(decryptedSHA1 == thisDecryptedSHA1) {
				tiddler.text = decryptedText;
				// Replace the Tag with the Encrypt() tag
				tiddler.tags[g]="Encrypt("+passwordPrompt+")";
				if(tiddler.tags[tiddler.tags.length-1] == 'excludeSearch') {
				    // Remove exclude search only if it's the last entry
				    // as it's automatically put there by encryption
				    tiddler.tags.length--;
				}
			    } else {
				// Did not decrypt, discard the password from the cache
				config.encryptionPasswords[passwordPrompt] = null;
				throw "DecryptionFailed";
			    }
			} else {
			    // no password supplied, dont bother trying to decrypt
			    throw "DecryptionFailed";
			}
		    } else {
			// Tagged as encrypted but not expected format, just leave it unchanged
		    }
		    break; // out of for loop
		} // if (lastBracket...
	    } // if(tag.indexOf(...
	} // for(var g=0;...
    } // if (tiddler && tags)
    return tiddler;
};

store.getTiddler_TiddlerEncryptionPlugin = store.getTiddler;
store.getTiddler = function(title) {
    var tiddler = store.getTiddler_TiddlerEncryptionPlugin(title);
    if(tiddler) { // shadow tiddlers are not expected to be encrypted.
	try {
	    return CheckTiddlerForDecryption_TiddlerEncryptionPlugin(tiddler);
	} catch (e) {
	    if(e == "DecryptionFailed") {
		if(config.options.chkEncryptShowEncrypted) {
		    return tiddler;
		} else {
		    var tiddler = store.getTiddler("DecryptionFailed");
		    if(!tiddler) {
			tiddler = new Tiddler();
			if(store.isShadowTiddler("DecryptionFailed")) {
			    tiddler.set(title,store.getTiddlerText("DecryptionFailed"),config.views.wikified.shadowModifier,version.date,[],version.date);
			} 
		    }
		    return tiddler;
		}
	    }
	} // catch
    } // if(tiddler) {
    return null;
};

store.getTiddlerText_TiddlerEncryptionPlugin = store.getTiddlerText;
store.getTiddlerText = function(title,defaultText) {
    // Simply retrieve the tiddler, normally, if it requires decryption, it will be decrypted
    var decryptedTiddler = store.getTiddler(title);
    if(decryptedTiddler) {
	return decryptedTiddler.text;
    }
    //Ok, rather than duplicate all the core code, the above code should fail if we reach here
    // let the core code take over.
    return  store.getTiddlerText_TiddlerEncryptionPlugin(title,defaultText);
};

// Given a prompt, search our cache to see if we have already entered the password.
// Can return null if the user enters nothing.
function GetAndSetPasswordForPrompt(promptString) {
    if(!config.encryptionPasswords[promptString]) {
	config.encryptionPasswords[promptString] = prompt("Enter password for '"+promptString+"' :", "");
    }
    return config.encryptionPasswords[promptString]; // may be null, prompt can be cancelled.
}

// Make the encrypted tiddlies look a little more presentable.
function StringToHex(theString) {
    var theResult = "";
    for(var i=0; i<theString.length; i++) {
	var theHex = theString.charCodeAt(i).toString(16);
	if(theHex.length<2) {
	    theResult += "0"+theHex;
	} else {
	    theResult += theHex;
	}
	if(i && i % 32 == 0)
	    theResult += "\n";
    }
    return theResult;
}

function HexToString(theString) {
    var theResult = "";
    for(var i=0; i<theString.length; i+=2) {
	if(theString.charAt(i) == "\n") {
	    i++;
	}
	theResult += String.fromCharCode(parseInt(theString.substr(i, 2),16));
    }
    return theResult;
}

// http://www.movable-type.co.uk/scripts/tea-block.html
//
// TEAencrypt: Use Corrected Block TEA to encrypt plaintext using password
//             (note plaintext & password must be strings not string objects)
//
// Return encrypted text as string
//
function TEAencrypt(plaintext, password)
{
    if (plaintext.length == 0) return('');  // nothing to encrypt
    // 'escape' plaintext so chars outside ISO-8859-1 work in single-byte packing, but keep
    // spaces as spaces (not '%20') so encrypted text doesn't grow too long (quick & dirty)
    var asciitext = escape(plaintext).replace(/%20/g,' ');
    var v = strToLongs(asciitext);  // convert string to array of longs
    if (v.length <= 1) v[1] = 0;  // algorithm doesn't work for n<2 so fudge by adding a null
    var k = strToLongs(password.slice(0,16));  // simply convert first 16 chars of password as key
    var n = v.length;

    var z = v[n-1], y = v[0], delta = 0x9E3779B9;
    var mx, e, q = Math.floor(6 + 52/n), sum = 0;

    while (q-- > 0) {  // 6 + 52/n operations gives between 6 & 32 mixes on each word
        sum += delta;
        e = sum>>>2 & 3;
        for (var p = 0; p < n; p++) {
            y = v[(p+1)%n];
            mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
            z = v[p] += mx;
        }
    }

    var ciphertext = longsToStr(v);

    return escCtrlCh(ciphertext);
}

//
// TEAdecrypt: Use Corrected Block TEA to decrypt ciphertext using password
//
function TEAdecrypt(ciphertext, password)
{
    if (ciphertext.length == 0) return('');
    var v = strToLongs(unescCtrlCh(ciphertext));
    var k = strToLongs(password.slice(0,16)); 
    var n = v.length;

    var z = v[n-1], y = v[0], delta = 0x9E3779B9;
    var mx, e, q = Math.floor(6 + 52/n), sum = q*delta;

    while (sum != 0) {
        e = sum>>>2 & 3;
        for (var p = n-1; p >= 0; p--) {
            z = v[p>0 ? p-1 : n-1];
            mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
            y = v[p] -= mx;
        }
        sum -= delta;
    }

    var plaintext = longsToStr(v);

    // strip trailing null chars resulting from filling 4-char blocks:
    plaintext = plaintext.replace(/\0+$/,'');

    return unescape(plaintext);
}


// supporting functions

function strToLongs(s) {  // convert string to array of longs, each containing 4 chars
    // note chars must be within ISO-8859-1 (with Unicode code-point < 256) to fit 4/long
    var l = new Array(Math.ceil(s.length/4));
    for (var i=0; i<l.length; i++) {
        // note little-endian encoding - endianness is irrelevant as long as 
        // it is the same in longsToStr() 
        l[i] = s.charCodeAt(i*4) + (s.charCodeAt(i*4+1)<<8) + 
               (s.charCodeAt(i*4+2)<<16) + (s.charCodeAt(i*4+3)<<24);
    }
    return l;  // note running off the end of the string generates nulls since 
}              // bitwise operators treat NaN as 0

function longsToStr(l) {  // convert array of longs back to string
    var a = new Array(l.length);
    for (var i=0; i<l.length; i++) {
        a[i] = String.fromCharCode(l[i] & 0xFF, l[i]>>>8 & 0xFF, 
                                   l[i]>>>16 & 0xFF, l[i]>>>24 & 0xFF);
    }
    return a.join('');  // use Array.join() rather than repeated string appends for efficiency
}

function escCtrlCh(str) {  // escape control chars etc which might cause problems with encrypted texts
    return str.replace(/[\0\t\n\v\f\r\xa0'"!]/g, function(c) { return '!' + c.charCodeAt(0) + '!'; });
}

function unescCtrlCh(str) {  // unescape potentially problematic nulls and control characters
    return str.replace(/!\d\d?\d?!/g, function(c) { return String.fromCharCode(c.slice(1,-1)); });
}

//}}}
