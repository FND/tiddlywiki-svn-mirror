cd ../../
svn update
c:\xampp\mysql\bin\mysqladmin -u root drop alpha_upgrade -f
c:\xampp\mysql\bin\mysqladmin -u root create alpha_upgrade 
<<<<<<< .mine
COPY C:\xampp\htdocs\Trunk\tests\selenium\configs\default_config.php  C:\xampp\htdocs\Trunk\includes\config.php
=======
COPY tests\selenium\configs\default_config.php  includes/config.php
>>>>>>> .r7263
c:\xampp\mysql\bin\mysql -u root alpha_upgrade<install.sql
<<<<<<< .mine
start java -jar C:\xampp\htdocs\Trunk\tests\selenium\selenium-server.jar -interactive																						
"C:\Program Files\Mozilla Firefox\firefox.exe"  -url http://127.0.0.1/Trunk/tests/selenium/test_login.phps=======
start java -jar C:\xampp\htdocs\Trunk\tests\selenium\selenium-server.jar -interactive																						
"C:\Program Files\Mozilla Firefox\firefox.exe"  -url http://127.0.0.1/Trunk/tests/selenium/selenium_tests/tests/selenium/tests/test_login.php>>>>>>> .r7263
