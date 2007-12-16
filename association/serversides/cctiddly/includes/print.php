<?php
//////////////////////////////////////////////////////// description ////////////////////////////////////////////////////////
	/**description
		print functions that printout code into tiddly wiki to change its action. 
	*/

	/**
		author: CoolCold
		email: cctiddly.coolcold@dfgh.net
	*/
	
	/**
		license:
			This is licensed under GPL v2
			http://www.gnu.org/licenses/gpl.txt
	*/

	/**
		requirement:
			config.php
			functions.php (including config.php, language.php)
	*/
	if( !isset($tiddlyCfg) )
	{
		exit($ccT_msg['error']['config_not_found']);
	}
//////////////////////////////////////////////////////////////include TW function/////////////////////////////////////////////////////////////
	//!	@fn cct_print_includes($standalone)
	//!	@brief print all includes javascript, usually external ones
	//!	@param $standalone check if it is a standalone version
	function cct_print_includes($standalone)
	{
		global $tiddlyCfg;
		$tw = "./tiddlywiki/".$tiddlyCfg['pref']['tw_ver'].".js";
		
		if( $standalone )
		{
			//get tiddlywiki.js content and output it
			$fhandle = fopen($tw,'r');
			if( $fhandle===FALSE )
			{
				logerror($ccT_msg['error']['js_file_open'],1
					,$ccT_msg['error']['js_file_open'].$ccT_msg['msg']['file']." $tw.js");
			}
			if( ($tmp=fread($fhandle,filesize($tw)))===FALSE )
			{
				logerror($ccT_msg['error']['js_file_read'],1
					,$ccT_msg['error']['js_file_read'].$ccT_msg['msg']['file']." $tw.js");
			}
			
			if( strcmp($tiddlyCfg['pref']['language'],"en") != 0 )
			{
				$fhandle = fopen("./plugins/".$tiddlyCfg['pref']['language'].".js",'r');
				if( $fhandle===FALSE )
				{
					logerror($ccT_msg['error']['js_file_open'],1
						,$ccT_msg['error']['js_file_open'].$ccT_msg['msg']['file']." $tw.js");
				}
				if( ($tmp.=fread($fhandle,filesize($tw)))===FALSE )
				{
					logerror($ccT_msg['error']['js_file_read'],1
						,$ccT_msg['error']['js_file_read'].$ccT_msg['msg']['file']." $tw.js");
				}
			}
			
			return "<script type=\"text/javascript\">\n".$tmp."\n</script>";
		}
		//include tw
		$r = '<script type="text/javascript" src="'.$tw.'"></script>';
		
		//include language file
		if( strcmp($tiddlyCfg['pref']['language'],"en") != 0 )
		{
			$r .= "\n".'<script type="text/javascript" src="./plugins/'.$tiddlyCfg['pref']['language'].'.js"></script>';
		}
		return $r."\n";
	}

//////////////////////////////////////////////////////////////ccT plugins/////////////////////////////////////////////////////////////
	
	//!	@fn cct_print_divConfig($standalone)
	//!	@brief print plugins required for ccT
	//!	@param $standalone check if it is a standalone version
	function cct_print_plugins($standalone)
	{
		global $tiddlyCfg;
		global $ccT_msg;
		//compulsory
		print "\n<script type=\"text/javascript\">\n";
		
		//find server name and root path
	//	$url = $_SERVER['PHP_SELF'];

		//in cct online mode
		if( !$standalone )
		{
?>
//<![CDATA[
//cctPlugin

var serverside={
	url: "http://<?php echo $_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>",		//server url, for use in local TW or TW hosted elsewhere
	handle:{		//path of file for handling request, can be used to put in GET variable
		rss: "../../<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>",
		uploadStoreArea: "../../<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>",		//for uploading the whole storearea
		saveTiddler: "../..<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>",
		removeTiddler: "../../<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>",
		revisionList: "../../<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?action=revisionList&<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>",
		revisionDisplay: "../../<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?action=revisionDisplay&<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>",
		login: "../../<?php print $tiddlyCfg['pref']['base_folder'];?>/msghandle.php?<?php print queryString()?>&instance=<?php echo $tiddlyCfg['pref']['instance_name'];?>"
	},
	handle_msg:{		//message sent to server for action, used for posting message to server. null = not used
		rss: "action=rss",
		uploadStoreArea: "action=upload",
		saveTiddler: "action=saveTiddler",
		removeTiddler: "action=removeTiddler",
		login: null
	},
	debug: <?php print $tiddlyCfg['developing'] ?>,		//debug mode, display alert box for each action
	passwordTime: 0,		//defines how long password variable store in cookie. 0 = indefinite
	messageDuration: 5000,				//displayMessage autoclose duration (in milliseconds), 0=leave open
	lingo:{		//message for different language
		uploadStoreArea: "<?php print $ccT_msg['notice']['uploadStoreArea'] ?>",
		rss: "<?php print $ccT_msg['notice']['uploadRSS'] ?>",
		timeOut: "<?php print $ccT_msg['notice']['timeOut'] ?>",
		anonymous: "<?php print $ccT_msg['loginpanel']['anoymous'] ?>",
		login:{
			login: "<?php print $ccT_msg['loginpanel']['login'] ?>",
			loginFailed: "<?php print $ccT_msg['loginpanel']['loginFailed'] ?>",
			loginPrompt: "<?php print $ccT_msg['loginpanel']['loginPrompt'] ?>",
			logout: "<?php print $ccT_msg['loginpanel']['logout'] ?>",
			logoutPrompt: "<?php print $ccT_msg['loginpanel']['logoutPrompt'] ?>",
		},
		revision:{
			text: "<?php print $ccT_msg['word']['revision'] ?>",
			tooltip: "<?php print $ccT_msg['misc']['revision_tooltip'] ?>",
			popupNone: "<?php print $ccT_msg['warning']['no_revision'] ?>",
			notExist: "<?php print $ccT_msg['error']['revision_not_found'] ?>"
		}
	},
	loggedIn:<?php echo  $usr_val?user_session_validate():0;?>,
	fn:{}		//server-side function
};


cctPlugin = {
	lingo:{
		autoUpload:"<?php print $ccT_msg['optionPanel']['autoUpload'] ?>"
	}
};

window.cct_tweak = function(){

	//add new option to options panel
	// OLD config.shadowTiddlers.OptionsPanel = "<<ssUploadStoreArea>>\n<<ssUploadRSS>>\n<<option chkAutoSave>> "+cctPlugin.lingo.autoUpload+"\n<<option chkRegExpSearch>>"+config.shadowTiddlers.OptionsPanel.substring(config.shadowTiddlers.OptionsPanel.search(/<<option chkRegExpSearch>>/)+26);
 config.shadowTiddlers.OptionsPanel = "\n<<ccCreateWorkspace>><<option chkAutoSave>> "+cctPlugin.lingo.autoUpload+"\n<<option chkRegExpSearch>>"+config.shadowTiddlers.OptionsPanel.substring(config.shadowTiddlers.OptionsPanel.search(/<<option chkRegExpSearch>>/)+26);
	
	
	//change SideBarOption panel to add login panel
	config.shadowTiddlers.SideBarOptions = "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal 'DD MMM YYYY'>><<tiddler '<?php print $ccT_msg['loginpanel']['name']?>'>><<slider chkSliderOptionsPanel OptionsPanel '<?php print $ccT_msg['sidebaroption']['options']?> »' 'Change TiddlyWiki advanced options'>>";
	config.shadowTiddlers.ViewTemplate = config.shadowTiddlers.ViewTemplate.replace(/references jump/,'references revisions jump');
	//change saveChange label to upload
	config.macros.saveChanges.label = "<?php print $ccT_msg['saveChanges']['upload'] ?>";
	config.macros.saveChanges.prompt = "<?php print $ccT_msg['saveChanges']['uploadPrompt'] ?>";

<?php
		}
		//exist in standalone mode
?>

	//force [[link|url]] to open in [- = current window, + = new window]
	window.createExternalLink_cct = window.createExternalLink;
	window.createExternalLink = function (place,url)
	{
		//save previous config
		var tmp = config.options.chkOpenInNewWindow;
		
		//change chkOpenInNewWindow
		if( url.substring(0,1) == "\-" ){
			config.options.chkOpenInNewWindow = false;
			url = url.substring(1,url.length);
		}else{
			if( url.substring(0,1) == "\+" ){
				config.options.chkOpenInNewWindow = true;
				url = url.substring(1,url.length);
			}
		}
			
		var theLink = window.createExternalLink_cct(place,url);
		
		//restore chkOpenInNewWindow
		config.options.chkOpenInNewWindow = tmp;
		return(theLink);
	}
	
	// time (in minutes, from now) for password to stay in cookie [0= default i.e. year 2038]
	//config.macros.option.passwordTime = <?php print $tiddlyCfg['pref']['session_expire'];?>;
	
	
	
	
<?php
	$usr = user_getUsername();
	$usr_val = user_session_validate();
	$usr = $usr_val?$usr:$ccT_msg['loginpanel']['anoymous'];
?>
	//login panel
	config.options.txtUser = "<?php print $usr ?>";
	config.shadowTiddlers.<?php print $ccT_msg['loginpanel']['name']?> ="<?php if($usr_val==0){?> \nYou are not logged in :\n\n [[Please Login]]<?php } else {?> <html><p>Welcome <?php echo $usr?></p><a href='?logout=1&'>Logout</a></html><?php } ?>";
//	config.shadowTiddlers.<?php print $ccT_msg['loginpanel']['name']?> ="<<ccLogin>>";

};

<?php
		print "//]]>\n";
		print "</script>\n";

		if( !$standalone )		//online version only
		{
			print '<script type="text/javascript" src="cctplugins.js"></script>'."\n";
			print '<script type="text/javascript" src="serverside.js"></script>'."\n";
		}
		return '';
	}
?>
