
cd ../../
svn update
../bin/mysqladmin -u root drop cctiddly_selenium_testing_db -f
../bin/mysqladmin -u root create cctiddly_selenium_testing_db 
../bin/mysql -u root cctiddly_selenium_testing_db < install.sql
cp  tests/selenium/configs/default_config.php   includes/config.php
java -jar tests/selenium/selenium-server.jar -interactive &
"/Applications/Firefox3.app/Contents/MacOS/firefox"  -url http://127.0.0.1/tests/selenium/tests/setup_test.php
