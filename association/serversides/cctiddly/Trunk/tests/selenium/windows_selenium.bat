cd ../../
svn update
c:\xampp\mysql\bin\mysqladmin -u root drop alpha_upgrade -f
c:\xampp\mysql\bin\mysqladmin -u root create alpha_upgrade 
COPY /Y C:\xampp\htdocs\tests\selenium\configs\default_config.php  C:\xampp\htdocs\includes\config.php
c:\xampp\mysql\bin\mysql -u root alpha_upgrade<C:\xampp\htdocs\install.sql
start java -jar C:\xampp\htdocs\Trunk\tests\selenium\selenium-server.jar -interactive																						
"C:\Program Files\Mozilla Firefox\firefox.exe"  -url http://127.0.0.1/Trunk/tests/selenium/selenium_tests/tests/selenium/tests/test_login.php