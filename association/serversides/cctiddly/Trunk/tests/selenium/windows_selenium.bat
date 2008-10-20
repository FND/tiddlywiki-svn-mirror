cd ../../
svn update
c:\xampp\mysql\bin\mysqladmin -u root drop alpha_upgrade -f
c:\xampp\mysql\bin\mysqladmin -u root create alpha_upgrade 
COPY tests\selenium\configs\default_config.php  includes/config.php
c:\xampp\mysql\bin\mysql -u root alpha_upgrade<install.sql
start java -jar C:\xampp\htdocs\Trunk\tests\selenium\selenium-server.jar -interactive																						
"C:\Program Files\Mozilla Firefox\firefox.exe"  -url http://127.0.0.1/Trunk/tests/selenium/selenium_tests/tests/selenium/tests/test_login.php