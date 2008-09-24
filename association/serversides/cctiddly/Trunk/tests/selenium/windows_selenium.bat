mkdir selenium_tests\
mkdir selenium_core\
svn co http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/Trunk/ selenium_tests/
c:\xampp\mysql\bin\mysqladmin -u root drop cctiddly_selenium -f
c:\xampp\mysql\bin\mysqladmin -u root create cctiddly_selenium 
c:\xampp\mysql\bin\mysql -u root -d cctiddly_selenium  < C:\xampp\htdocs\Trunk\tests\selenium_tests\install.sql
//start java -jar C:\xampp\htdocs\Trunk\tests\selenium\selenium-server.jar -interactive
"C:\Program Files\Mozilla Firefox\firefox.exe"  -url http://127.0.0.1/Trunk/tests/selenium/selenium_tests/