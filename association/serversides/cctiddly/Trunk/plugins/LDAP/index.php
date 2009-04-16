<?php

// include the addition header files. 
// change sha1 setting

// LDAP Plugin Definitions

$m = new Plugin('LDAP Plugin','0.1','simonmcmanus.com');
$m->addEvent("preUserInclude", 'LDAP/files/functions.php');

// LDAP Config Settings 
$tiddlyCfg['users_required_in_db'] = 0;  // means users are not required in the db to login.
$tiddlyCfg['pref']['ldap_enabled'] = 1;	
$tiddlyCfg['pref']['ldap_username']	= "blah ";
$tiddlyCfg['pref']['ldap_base_dn']	="blah";
$tiddlyCfg['pref']['ldap_password'] = "pass";
$tiddlyCfg['pref']['ldap_filter'] = "indentifier=";
$tiddlyCfg['pref']['ldap_connection_string'] = "ldap://server.com:389";

//
?>