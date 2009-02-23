/***
|''Name:''|SiteLicensePlugin|
|''Description:''|Helper macros to set a Creative Commons license on the SiteLicense tiddler |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/SiteLicensePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SiteLicensePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4.1|
!!Documentation
This plugin provides a {{{selectLicense}}} macro which may is a convinience for selecting a [[Creative Commons|http://creativecommons.org]] license for the document. The chosen license is set in the {{{License}}} and {{{Link}}} slices of the [[SiteLicense]] tiddler, and may be displayed using the {{{license}}} macro.

The [[SiteLicense]] tiddler is used by the [[SiteLicenseRSSPlugin|http://whatfettle.com/2008/07/SiteLicenseRSSPlugin/]] and [[SavingAtomPlugin|http://whatfettle.com/2008/07/SavingAtomPlugin/]] plugins. Neither of these plugins depend upon the [[SiteLicensePlugin]].

Choose a license: <<selectLicense>> 
License: <<license>> //requires a page refresh after changing the value//
!!Code
***/
//{{{
if(!version.extensions.SiteLicensePlugin) {
version.extensions.SiteLicensePlugin = {installed:true};

	if(!config.extensions){
                config.extensions = {};
        }

	merge(config.annotations,{SiteLicense: "This shadow tiddler specifies the site license"});

	config.extensions.SiteLicense = {
		licenses: {
			'Creative Commons Attribution': "http://creativecommons.org/licenses/by/3.0/",
			'Creative Commons Attribution-Noncommercial': "http://creativecommons.org/licenses/by-nc/3.0/",
			'Creative Commons Attribution-No Derivative Works': "http://creativecommons.org/licenses/by-nd/3.0/",
			'Creative Commons Attribution NonCommercial-No Derivative Works': "http://creativecommons.org/licenses/by-nc-nd/3.0/",
			'Creative Commons Attribution NonCommercial': "http://creativecommons.org/licenses/by-nc/3.0/",
			'Creative Commons Attribution NonCommercial-Share Alike': "http://creativecommons.org/licenses/by-nc-sa/3.0/",
			'Creative Commons Attribution-Share Alike': "http://creativecommons.org/licenses/by-sa/3.0/",
			'Public Domain': "http://creativecommons.org/licenses/publicdomain/"
		},

		defaultLicense: 'Creative Commons Attribution',
		defaultText: "|License:|[[%0|%1]]|\n|Link:|%1|\n",

		setSiteLicense: function(license) {
			var me = config.extensions.SiteLicense;
			var tiddler = store.createTiddler("SiteLicense");
			tiddler.modifier = config.options.txtUserName;
			tiddler.text = me.defaultText.format([license,me.licenses[license]]);
			store.saveTiddler(tiddler.title);
		},

		getSiteLicense: function() {
			return store.calcAllSlices("SiteLicense");
		}
	};

	if(!store.getTiddler("SiteLicense")) {
		config.extensions.SiteLicense.setSiteLicense(config.extensions.SiteLicense.defaultLicense);
	}

	config.macros.selectLicense = {
		handler: function(place,macroname,params,wikifier,paramstring,tiddler) {

			var options = [];
			var licenses = config.extensions.SiteLicense.licenses;
			for (var key in licenses) {
				options.push({caption: key, name: key});
			}

			var me = config.extensions.SiteLicense;
			var license = me.getSiteLicense();

			createTiddlyDropDown(place, function() {
				if (license.License != options[this.selectedIndex].caption) {
					me.setSiteLicense(options[this.selectedIndex].caption);
				}
			}, options, wikifyPlainText(license.License));
		}
	};

	config.macros.license = {
		handler: function(place,macroname,params,wikifier,paramstring,tiddler) {
			wikify(config.extensions.SiteLicense.getSiteLicense().License,place,null,tiddler);
		}
	};
}
//}}}
