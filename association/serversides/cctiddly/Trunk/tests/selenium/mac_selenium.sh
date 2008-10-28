#!/bin/sh
cd /Applications/xampp/xamppfiles/htdocs/Trunk
svn update
/Applications/xampp/xamppfiles/bin/mysqladmin -u root drop alpha_upgrade -f
/Applications/xampp/xamppfiles/bin/mysqladmin -u root create alpha_upgrade 
/Applications/xampp/xamppfiles/bin/mysql -u root alpha_upgrade< /Applications/xampp/xamppfiles/htdocs/install.sql
cp  /Applications/xampp/xamppfiles/htdocs/tests/selenium/configs/default_config.php   /Applications/xampp/xamppfiles/htdocs/Trunk/includes/config.php
java -jar /Users/simonmcmanus/selenium-server/selenium-server.jar -interactive &
"/Applications/Firefox.app/Contents/MacOS/firefox"  -url http://127.0.0.1/Trunk/tests/selenium/tests/setup_test.php
