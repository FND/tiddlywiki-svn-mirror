Welcome to ccTiddly 1.6

The has some new features including : 

1 .. self service workspaces 
2 .. Database user management


we have taken out some features from the original ccTiddly version to get this version released.  If you cant find a particular feature please ask for help on the ccTiddly google groups. 

http://groups.google.com/group/ccTiddly

We have not written the install script for this version yet so you will need to create the database manually.

STEPS FOR INSTALLATION : 

1 .. Copy contents into folder on your web server 
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


The SQL create three users for you. 

1 .. username
2 .. simon 
3 .. admin

each has a password of password. If you wish to change the passwords you will need to create a sha1 hash of the new password (sha1(password) and add the hash into the user table in the database. 

The admin user is the owner of the root workspace.



Configuring Uploading 

1 .. Create a folder in your root directory called uploads 