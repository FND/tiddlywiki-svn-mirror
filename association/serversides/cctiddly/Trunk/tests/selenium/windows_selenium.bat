mkdir selenium_tests\
mkdir selenium_core\
svn co http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/Trunk/ selenium_tests/
c:\xampp\mysql\bin\mysqladmin -u root drop cctiddly17 -f
c:\xampp\mysql\bin\mysql -u root<selenium_testssinstall.sql
start java -jar C:\xampp\htdocs\Trunk\tests\selenium\selenium-server.jar -interactive
C:\Program Files\Mozilla Firefox\firefox.exe -url http://127.0.0.1/selenium/GoogleTest.php