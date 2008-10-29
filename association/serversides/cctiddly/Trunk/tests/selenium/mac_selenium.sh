#!/bin/sh
cd ../../
svn update
../bin/mysqladmin -u root drop cctiddly_selenium_testing_db -f
../bin/mysqladmin -u root create cctiddly_selenium_testing_db 
../bin/mysql -u root cctiddly_selenium_testing_db < install.sql
cp  tests/selenium/configs/default_config.php   includes/config.php
/usr/bin/open -a Firefox http://127.0.0.1/tests/selenium/tests/test_login.php
#java -jar tests/selenium/selenium-server.jar -interactive &
