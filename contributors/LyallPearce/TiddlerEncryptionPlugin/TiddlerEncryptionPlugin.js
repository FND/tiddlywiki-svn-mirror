/***
|Name|TiddlerEncryptionPlugin|
|Author|Lyall Pearce|
|Source|http://www.Remotely-Helpful.com/TiddlyWiki/TiddlerEncryptionPlugin.html|
|License|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|Version|3.1.1|
|~CoreVersion|2.3.0|
|Requires|None|
|Overrides|store.getSaver().externalizeTiddler(), store.getTiddler() and store.getTiddlerText()|
|Description|Encrypt/Decrypt Tiddlers with a Password key|

!!!!!Usage
<<<
* Tag a tiddler with Encrypt(prompt)
** Consider the 'prompt' something to help you remember the password with. If multiple tiddlers can be encrypted with the same 'prompt' and you will only be asked for the password once.
* Upon save, the Tiddler will be encrypted and the tag replaced with Decrypt(prompt).
** Failure to encrypt (by not entering a password) will leave the tiddler unencrypted and will leave the Encrypt(prompt) tag in place. This means that the next time you save, you will be asked for the password again.
** To have multiple tiddlers use the same password - simply use the same 'prompt'.
** Tiddlers that are encrypted may be automatically tagged 'excludeSearch' as there is no point in searching encrypted data - this is configurable by an option - you still may want to search the titles of encrypted tiddlers
** Tiddlers that are encrypted may be automatically tagged 'excludeLists', if you have them encrypted, you may also want to keep them 'hidden' - this is configurable by an option.
** Automatic removal of excludeLists and excludeSearch tags is performed, if the above two options are set, only if these two tags are the last 2 tags for a tiddler, if they are positioned somewhere else in the tags list, they will be left in place, meaning that the decrypted tiddler will not be searchable and/or will not appear in lists.
** Encrypted tiddlers are stored as displayable hex, to keep things visibly tidy, should you display an encrypted tiddler. There is nothing worse than seeing a pile of gobbledy gook on your screen. Additionally, the encrypted data is easily cut/paste/emailed if displayed in hex form.
* Tiddlers are decrypted only if you click the decrypt button or the decryptAll button, not when you load the TiddlyWiki
** If you don't display a tiddler, you won't have the option to decrypt it (unless you use the {{{<<EncryptionDecryptAll>>}}} macro)
** Tiddlers will re-encrypt automatically on save.
** Decryption of Tiddlers does not make your TiddlyWiki 'dirty' - you will not be asked to save if you leave the page.
* Errors are reported via diagnostic messages.
** Empty passwords, on save, will result in the tiddler being saved unencrypted - this should only occur with new tiddlers, decrypted tiddlers or with tiddlers who have had their 'prompt' tag changed.
** Encrypted tiddlers know if they are decrypted successfully - failure to decrypt a tiddler will ''not'' lose your data.
** Editing of an encrypted (that has not been unencrypted) tiddler will result in loss of that tiddler as the SHA1 checksums will no longer match, upon decryption. To this end, it is best that you do not check the option.
** To change the password on a Tiddler, change the Encrypt('prompt') tag to a new prompt value, after decrypting the tiddler.
** You can edit the tags of an encrypted tiddler, so long as you do not edit the text.
** To change the password for all tiddlers of a particular prompt, use the {{{<<EncryptionChangePassword ["button text" ["tooltip text" ["prompt string" ["accessKey"]]]]>>}}} macro.
** To decrypt all tiddlers of a particular "prompt string", use the {{{<<EncryptionDecryptAll ["button text" ["tooltip text" ["prompt string" ["accessKey"]]]]>>}}} macro - this will make tiddlers encrypted with "prompt string" searchable - or prompt for all 'prompt strings', if none is supplied.
<<<
!!!!!Configuration
<<<
Useful Buttons: 
<<EncryptionChangePassword>> - Change passwords of encrypted tiddlers.
<<EncryptionDecryptAll>> - Decrypt ALL tiddlers - enables searching contents of encrypted tiddlers.
<<option chkExcludeEncryptedFromSearch>> - If set, Encrypted Tiddlers are excluded from searching by tagging with excludeSearch. If Clear, excludeSearch is not added and it is also removed from existing Encrypted Tiddlers only if it is the last Tag. Searching of Encrypted Tiddlers is only meaningful for the Title and Tags.
<<option chkExcludeEncryptedFromLists>> - If set, Encrypted Tiddlers are excluded from lists by tagging with excludeLists. If Clear, excludeLists is not added and it is also removed from existing Encrypted Tiddlers only if it is the last Tag. Preventing encrypted tiddlers from appearing in lists effectively hides them.
<<<
!!!!!Revision History
<<<
* 3.1.1 - Obscure bug whereby if an encrypted tiddler was a certain length, it would refuse to decrypt.
* 3.1.0 - When creating a new Encrypt(prompt) tiddler and you have not previously decrypted a tiddler with the same prompt, on save, you will be prompted for the password to encrypt the tiddler. Prior to encrypting, an attempt to decrypt all other tiddlers with the same prompt, is performed. If any tiddler fails to decrypt, the save is aborted - this is so you don't accidentally have 2 (or more!) passwords for the same prompt. Either you enter the correct password, change the prompt string and try re-saving or you cancel (and the tiddler is saved unencrypted).
* 3.0.1 - Allow Enter to be used for password entry, rather than having to press the OK button.
* 3.0.0 - Major revamp internally to support entry of passwords using forms such that passwords are no longer visible on entry. Completely backward compatible with old encrypted tiddlers. No more using the javascript prompt() function.
<<<
!!!!!Additional work

***/
//{{{
version.extensions.TiddlerEncryptionPlugin = {major: 3, minor: 1, revision: 1, date: new Date(2008,9,18)};

// where I cache the passwords - for want of a better place.
config.encryptionPasswords = new Array();
config.encryptionReEnterPasswords = false;

if(config.options.chkExcludeEncryptedFromSearch == undefined) config.options.chkExcludeEncryptedFromSearch = false;
if(config.options.chkExcludeEncryptedFromLists == undefined) config.options.chkExcludeEncryptedFromLists = false;

config.macros.EncryptionChangePassword = {};
config.macros.EncryptionChangePassword.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
    var theButton = createTiddlyButton(place,
				       (params[0] && params[0].length > 0) ? params[0] : "Change Passwords", 
				       (params[1] && params[1].length > 0) ? params[1] : "Change Passwords" + (params[2] ? " for prompt "+params[2] : ""), 
				       onClickEncryptionChangePassword,
				       null,
				       null,
				       params[3]);
    if(params[2] && params[2].length > 0) {
	theButton.setAttribute("promptString", params[2]);
    }
};

config.macros.EncryptionDecryptAll = {};
config.macros.EncryptionDecryptAll.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
    var theButton = createTiddlyButton(place,
				       (params[0] && params[0].length > 0) ? params[0] : "Decrypt All", 
				       (params[1] && params[1].length > 0) ? params[1] : "Decrypt All Tiddlers" + ((params[2] && params[2].length > 0) ? " for prompt "+params[2] : " for a given 'prompt string'"), 
				       onClickEncryptionDecryptAll,
				       null,
				       null,
				       params[3]);
    if(params[2] && params[2].length > 0) {
	theButton.setAttribute("promptString", params[2]);
    }
};

config.macros.EncryptionDecryptThis = {};
config.macros.EncryptionDecryptThis.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
    var theButton = createTiddlyButton(place,
				       (params[0] && params[0].length > 0) ? params[0] : "Decrypt", 
				       (params[1] && params[1].length > 0) ? params[1] : "Decrypt this Tiddler", 
				       onClickEncryptionDecryptThis,
				       null,
				       null,
				       params[3]);
    if(params[2] && params[2].length > 0) {
	theButton.setAttribute("theTiddler", params[2]);
    }
};
// Called by the EncryptionChangePassword macro/button
// Also invoked by the callback for password entry
function onClickEncryptionChangePassword(eventObject) {
    var promptString;
    if(!promptString && this.getAttribute) {
	promptString = this.getAttribute("promptString");
    }
    // I do call this function directly
    if(!promptString && typeof(eventObject) == "string") {
	promptString = eventObject;
    }
    if(!promptString) {
	promptString = prompt("Enter 'prompt string' to change password for:","");
    }
    if(!promptString) {
	return;
    }
    if(! config.encryptionPasswords[promptString]) {
	var changePasswordContext = {changePasswordPromptString: promptString,
				     callbackFunction: MyChangePasswordPromptCallback_TiddlerEncryptionPlugin};
	MyPrompt_TiddlerEncryptionPlugin(promptString,"",changePasswordContext);
	return;
	// Callback function will re-invoke this function
    }

    // Decrypt ALL tiddlers for that prompt
    onClickEncryptionDecryptAll(promptString);
    // Now ditch the cached password, this will force the re-request for the new password, on save.
    displayMessage("Save TiddlyWiki to set new password for '"+promptString+"'");
    config.encryptionPasswords[promptString] = null;
    // mark store as dirty so a save will be requrested.
    store.setDirty(true);
    autoSaveChanges(); 
    return;
};
// Called by the password entry form when the user clicks 'OK' button.
function MyChangePasswordPromptCallback_TiddlerEncryptionPlugin(context) {
    config.encryptionPasswords[context.passwordPrompt] = context.password;
    onClickEncryptionChangePassword(context.changePasswordPromptString);
    return;
}
// Called by the EncryptionDecryptThis macro/button
function onClickEncryptionDecryptThis() {
    var theTiddler = this.getAttribute("theTiddler");
    if(!theTiddler) {
	return;
    }
    config.encryptionReEnterPasswords = true;
    try {
	theTiddler = store.getTiddler(theTiddler);
	config.encryptionReEnterPasswords = false;
	story.refreshAllTiddlers();
    } catch (e) {
	if(e == "DecryptionFailed") {
	    displayMessage("Decryption failed");
	    return;
	}
    } // catch
    return;
};
// called by the EncryptionDecryptAlll macro/button
// Also called by the callback after the user clicks 'OK' button on the password entry form
function onClickEncryptionDecryptAll(eventObject) {
    var promptString;
    if(!promptString && this.getAttribute) {
	promptString = this.getAttribute("promptString");
    }
    // I do call this function directly
    if(!promptString && typeof(eventObject) == "string") {
	promptString = eventObject;
    }
    if(!promptString) {
	promptString = "";
    }

    // Loop through all tiddlers, looking to see if there are any Decrypt(promptString) tagged tiddlers
    // If there are, check to see if their password has been cached.
    // If not, ask for the first one that is missing, that we find
    // the call back function will store that password then invoke this function again, 
    // which will repeat the whole process. If we find all passwords have been cached
    // then we will finally do the decryptAll functionality, which will then
    // be able to decrypt all the required tiddlers, without prompting.
    // We have to do this whole rigmarole because we are using a 'form' to enter the password
    // rather than the 'prompt()' function - which shows the value of the password.
    var tagToSearchFor="Decrypt("+promptString;
    config.encryptionReEnterPasswords = true; 
    var promptGenerated = false;
    store.forEachTiddler(function(store,tiddler) {
	    // Note, there is no way to stop the forEachTiddler iterations
	    if(!promptGenerated && tiddler && tiddler.tags) {
		for(var ix=0; ix<tiddler.tags.length && !promptGenerated; ix++) {
		    if(tiddler.tags[ix].indexOf(tagToSearchFor) == 0) {
			var tag = tiddler.tags[ix];
			var lastBracket=tag.lastIndexOf(")");
			if(lastBracket >= 0) {
			    // Ok, tagged with Encrypt(passwordPrompt)
			    // extract the passwordPrompt name
			    var passwordPromptString=tag.substring(8,lastBracket);
			    if(!config.encryptionPasswords[passwordPromptString]) {
				// no password cached, prompt and cache it, rather than decryptAll
				// callback from prompting form will resume decryptAll attempt.
				var decryptAllContext = {decryptAllPromptString: promptString,
							 callbackFunction: MyDecryptAllPromptCallback_TiddlerEncryptionPlugin};
				MyPrompt_TiddlerEncryptionPlugin(passwordPromptString,"",decryptAllContext);
				promptGenerated = true;
			    } // if(!config.encryptionPasswords
			} // if(lastBracket
		    } // if(tiddler.tags[ix]..
		} // for
	    } // if
	}); // store.forEachTiddler
    // If we get here, all passwords have been cached.
    if(!promptGenerated) {
	config.encryptionReEnterPasswords = false;
	// Now do the decrypt all functionality
	try {
	    store.forEachTiddler(function(store,tiddler) {
		    // Note, there is no way to stop the forEachTiddler iterations
		    if(tiddler && tiddler.tags) {
			for(var ix=0; ix<tiddler.tags.length; ix++) {
			    if(tiddler.tags[ix].indexOf(tagToSearchFor) == 0) {
				try {
				    CheckTiddlerForDecryption_TiddlerEncryptionPlugin(tiddler);
				} catch (e) {
				    displayMessage("Decryption of '"+tiddler.title+"' failed.");
				    // throw e;
				}
			    } // if(tiddler.tags
			} // for
		    } // if
		}); // store.forEachTiddler
	    displayMessage("All tiddlers" + (promptString != "" ? " for '"+promptString+"'" : "") + " have been decrypted");
	} catch (e) {
	    if(e == "DecryptionFailed") {
		return;
	    }
	} // catch
    }
    return;
};

function MyDecryptAllPromptCallback_TiddlerEncryptionPlugin(context) {
    config.encryptionPasswords[context.passwordPrompt] = context.password;
    // restart the decryptAll process again after the user has entered a password.
    onClickEncryptionDecryptAll(context.decryptAllPromptString);
    return;
}

saveChanges_TiddlerEncryptionPlugin = saveChanges;
saveChanges = function(onlyIfDirty,tiddlers) {
    // Loop through all tiddlers, looking to see if there are any Encrypt(string) tagged tiddlers
    // If there are, check to see if their password has been cached.
    // If not, ask for the first one that is missing, that we find
    // the call back function will store that password then invoke this function again, 
    // which will repeat the whole process. If we find all passwords have been cached
    // then we will finally call the original saveChanges() function, which will then
    // be able to save the tiddlers.
    // We have to do this whole rigmarole because we are using a 'form' to enter the password
    // rather than the 'prompt()' function - which shows the value of the password.
    config.encryptionReEnterPasswords = true; 
    var promptGenerated = false;
    store.forEachTiddler(function(store,tiddler) {
	    if(!promptGenerated && tiddler && tiddler.tags) {
		for(var ix=0; ix<tiddler.tags.length && !promptGenerated; ix++) {
		    if(tiddler.tags[ix].indexOf("Encrypt(") == 0) {
			var tag = tiddler.tags[ix];
			var lastBracket=tag.lastIndexOf(")");
			if(lastBracket >= 0) {
			    // Ok, tagged with Encrypt(passwordPrompt)
			    // extract the passwordPrompt name
			    var passwordPrompt=tag.substring(8,lastBracket);
			    if(!config.encryptionPasswords[passwordPrompt]) {
				// no password cached, prompt and cache it, rather than save
				var saveContext = {onlyIfDirty: onlyIfDirty, 
						   tiddlers: tiddlers, 
				                   callbackFunction: MySavePromptCallback_TiddlerEncryptionPlugin};
				MyPrompt_TiddlerEncryptionPlugin(passwordPrompt,"",saveContext);
				promptGenerated = true;
			    } // if(!config.encryptionPasswords
			} // if(lastBracket
		    } // if(tiddler.tags[ix]..
		} // for
	    } // if
	}); // store.forEachTiddler
    // If we get here, all passwords have been cached.
    if(!promptGenerated) {
	config.encryptionReEnterPasswords = false;
	saveChanges_TiddlerEncryptionPlugin(onlyIfDirty,tiddlers);
    }
    return;
}

function MySavePromptCallback_TiddlerEncryptionPlugin(context) {
    config.encryptionPasswords[context.passwordPrompt] = context.password;
    // validate the password entered by attempting to decrypt all tiddlers
    // with the same encryption prompt string.
    onClickEncryptionDecryptAll(context.passwordPrompt);

    // restart the save process again
    saveChanges(context.onlyIfDirty, context.tiddlers);
    return;
}

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
		    var password =  GetAndSetPasswordForPrompt_TiddlerEncryptionPlugin(passwordPrompt);
		    if(password) {
			var encryptedText = TEAencrypt(tiddler.text, password);
			encryptedText = StringToHext_TiddlerEncryptionPlugin(encryptedText);
			tiddler.text = "Encrypted("+decryptedSHA1+")\n"+encryptedText;
			// Replace the Tag with the Decrypt() tag
			tiddler.tags[g]="Decrypt("+passwordPrompt+")";
			// let the store know it's dirty
			store.setDirty(tiddler.title, true);
			// prevent searches on encrypted tiddlers, still nice to search on title though.
			if(config.options.chkExcludeEncryptedFromSearch == true) {
			    tiddler.tags.push("excludeSearch");
			}
			// prevent lists of encrypted tiddlers
			if(config.options.chkExcludeEncryptedFromLists == true) {
			    tiddler.tags.push("excludeLists");
			}
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
			decryptedText = HexToString_TiddlerEncryptionPlugin(decryptedText);
                        // prompt("Decryption request for Tiddler '"+tiddler.title+"'");
			var password = GetAndSetPasswordForPromptToDecrypt_TiddlerEncryptionPlugin(passwordPrompt);
			if(password) {
			    decryptedText = TEAdecrypt(decryptedText, password );
			    var thisDecryptedSHA1 = Crypto.hexSha1Str(decryptedText);
			    if(decryptedSHA1 == thisDecryptedSHA1) {
				tiddler.text = decryptedText;
				// Replace the Tag with the Encrypt() tag
				tiddler.tags[g]="Encrypt("+passwordPrompt+")";
				if(tiddler.tags[tiddler.tags.length-1] == 'excludeLists') {
				    // Remove exclude lists only if it's the last entry
				    // as it's automatically put there by encryption
				    tiddler.tags.length--;
				}
				if(tiddler.tags[tiddler.tags.length-1] == 'excludeSearch') {
				    // Remove exclude search only if it's the last entry
				    // as it's automatically put there by encryption
				    tiddler.tags.length--;
				}
			    } else {
				// Did not decrypt, discard the password from the cache
				config.encryptionPasswords[passwordPrompt] = null;
				config.encryptionReEnterPasswords = false;
				throw "DecryptionFailed";
			    }
			} else {
			    // no password supplied, dont bother trying to decrypt
			    config.encryptionReEnterPasswords = false;
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
		var tiddler = store.getTiddler("DecryptionFailed");
		if(!tiddler) {
		    tiddler = new Tiddler();
		    tiddler.set(title,
				"<<EncryptionDecryptThis \"Decrypt\" \"Decrypt this tiddler\" \""+title+"\">>",
				config.views.wikified.shadowModifier,
				version.date,[],version.date);
		} 
		return tiddler;
	    } // if(e)
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
function MyPrompt_TiddlerEncryptionPlugin(promptString,defaultValue,context) {
    if(!context) {
	context = {};
    }
    context.passwordPrompt = promptString;
    PasswordPrompt.prompt(MyPromptCallback_TiddlerEncryptionPlugin, context);
    return;
}

function MyPromptCallback_TiddlerEncryptionPlugin(context) {
    if(context.callbackFunction) {
	context.callbackFunction(context);
    } else {
	config.encryptionPasswords[context.passwordPrompt] = context.password;
	story.refreshAllTiddlers(true);
    }
    return;
}

function GetAndSetPasswordForPrompt_TiddlerEncryptionPlugin(promptString) {
    if(!config.encryptionPasswords[promptString]) {
	config.encryptionPasswords[promptString] = MyPrompt_TiddlerEncryptionPlugin(promptString, "");
    }
    return config.encryptionPasswords[promptString]; // may be null, prompt can be cancelled.
}

function GetAndSetPasswordForPromptToDecrypt_TiddlerEncryptionPlugin(promptString) {
    if(config.encryptionReEnterPasswords) {
	return GetAndSetPasswordForPrompt_TiddlerEncryptionPlugin(promptString);
    } else {
	return config.encryptionPasswords[promptString];
    }
}

// Make the encrypted tiddlies look a little more presentable.
function StringToHext_TiddlerEncryptionPlugin(theString) {
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

function HexToString_TiddlerEncryptionPlugin(theString) {
    var theResult = "";
    for(var i=0; i<theString.length; i+=2) {
	if(theString.charAt(i) == "\n") {
	    i--;	// cause us to skip over the newline and resume
	    continue;
	}
	theResult += String.fromCharCode(parseInt(theString.substr(i, 2),16));
    }
    return theResult;
}
//
// Heavily leveraged from http://trac.tiddlywiki.org/browser/Trunk/contributors/SaqImtiaz/verticals/Hesperian/PasswordPromptPlugin.js  Revision 5635
//
PasswordPrompt ={
  prompt : function(callback,context){
	if (!context) {
	    context = {};
	}
	var box = createTiddlyElement(document.getElementById("contentWrapper"),'div','passwordPromptBox');
	box.innerHTML = store.getTiddlerText('PasswordPromptTemplate');
	box.style.position = 'absolute';
	this.center(box);
	document.getElementById('promptDisplayField').value = context.passwordPrompt;
	var passwordInputField = document.getElementById('passwordInputField');
	passwordInputField.onkeyup = function(ev) {
	    var e = ev || window.event;
	    if(e.keyCode == 10 || e.keyCode == 13) { // Enter
		PasswordPrompt.submit(callback, context);
	    }
	};
	passwordInputField.focus();
	document.getElementById('passwordPromptSubmitBtn').onclick = function(){PasswordPrompt.submit(callback,context);};
	document.getElementById('passwordPromptCancelBtn').onclick = function(){PasswordPrompt.cancel(callback,context);};
    },     
 	       
  center : function(el){
	var size = this.getsize(el);
	el.style.left = (Math.round(findWindowWidth()/2) - (size.width /2) + findScrollX())+'px';
	el.style.top = (Math.round(findWindowHeight()/2) - (size.height /2) + findScrollY())+'px';
    },
 	       
  getsize : function (el){
	var x = {};
	x.width = el.offsetWidth || el.style.pixelWidth;
	x.height = el.offsetHeight || el.style.pixelHeight;
	return x;
    },
 	       
  submit : function(cb,context){
	context.passwordPrompt = document.getElementById('promptDisplayField').value;
	context.password = document.getElementById('passwordInputField').value;
	var box = document.getElementById('passwordPromptBox');
	box.parentNode.removeChild(box);
	cb(context);
	return false;
    },

  cancel : function(cb,context){
	var box = document.getElementById('passwordPromptBox');
	box.parentNode.removeChild(box);
	return false;
    },
 	       
  setStyles : function(){
	setStylesheet(
	    "#passwordPromptBox dd.submit {margin-left:0; font-weight: bold; margin-top:1em;}\n"+
	    "#passwordPromptBox dd.submit .button {padding:0.5em 1em; border:1px solid #ccc;}\n"+
	    "#passwordPromptBox dt.heading {margin-bottom:0.5em; font-size:1.2em;}\n"+
	    "#passwordPromptBox {border:1px solid #ccc;background-color: #eee;padding:1em 2em;}",'passwordPromptStyles');
    },
 	       
  template : '<form action="" onsubmit="return false;" id="passwordPromptForm">\n'+
  '    <dl>\n'+
  '        <dt class="heading">Please enter the password:</dt>\n'+
  '        <dt>Prompt:</dt>\n'+
  '        <dd><input type="text" readonly id="promptDisplayField" class="display"/></dd>\n'+
  '        <dt>Password:</dt>\n'+
  '        <dd><input type="password" tabindex="1" class="input" id="passwordInputField"/></dd>\n'+
  '        <dd class="submit">\n'+
  '            <a tabindex="2" href="javascript:;" class="button" id="passwordPromptSubmitBtn">OK</a>\n'+
  '            <a tabindex="3" href="javascript:;" class="button" id="passwordPromptCancelBtn">Cancel</a>\n'+
  '        </dd>\n'+
  '    </dl>\n'+
  '</form>',
 	                         
  init : function(){
	config.shadowTiddlers.PasswordPromptTemplate = this.template;
	this.setStyles();
    }
};
 	
PasswordPrompt.init();

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
