Welcome to ccTiddly 1.7


For the most up to date file and to see known issues with the latest releases please see the URL : 

http://www.tiddlywiki.org/wiki/CcTiddly/Releases


we have taken out some features from the original ccTiddly version to get this version released.  If you cant find a particular feature please ask for help on the ccTiddly google groups. 

http://groups.google.com/group/ccTiddly

We have not written the install script yet so you will need to create the database manually.

STEPS FOR INSTALLATION : 

1 .. Copy files into folder on your web server 
2 .. create database and run the install.sql file to create the tables.
3 .. edit /includes/config.php  to reflect your settings : 

	$tiddlyCfg['db']['host'] = "127.0.0.1";		//sql host
	$tiddlyCfg['db']['login'] = "root";		//login name
	$tiddlyCfg['db']['pass'] = "";		//login password
	$tiddlyCfg['db']['name'] = "cctw";		//db name

4 .. Then you should be able to access ccTiddly over HTTP. eg : 

http://127.0.0.1/cctiddly

If you have any questions please contact : 

http://groups.google.com/group/ccTiddly


The SQL creates three users for you. 

1 .. username
2 .. simon 
3 .. admin

each has a password of password.


Configuring Uploading 

1 .. Create a folder in your root directory called uploads 

2 .. Ensure the folder is owned by the same user that apache is running under. 

3 .. Ensure that the folder can be written by its owner. 

