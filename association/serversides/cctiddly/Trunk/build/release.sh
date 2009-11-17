
if [ -z "$1" ]              # Tested variable is quoted.
then
 echo "ERROR - You need to provide the release number....."  # Need quotes to escape #
exit 1
fi

echo "Are you sure you wish to release ccTiddly $1"

PS3=""
OPTIONS="y n"
select i in $OPTIONS; do
    if [ "$i" = "y" ]; then
		cd ../
		svn up
		php fetchPluginTiddlers.php
		cd ../
		mkdir Trunk-$1
		echo "copying folder..."
		ditto -V Trunk Trunk-$1
		cd Trunk-$1
		cd ../
		svn copy Trunk-$1 http://svn.tiddlywiki.org/Tags/association/serversides/cctiddly/$1 -m 'ccTiddly - Automated Release - $1 '
		svn export http://svn.tiddlywiki.org/Tags/association/serversides/cctiddly/$1 $1
#		rm -R -f build
#		rm -R -f tests
#		rm -f fetchPluginTiddlers.php


#		zip -r $1.zip $1
##  Upload File to a server 
## Post a message to the google groups and blogs.

        exit 1
    elif [ "$i" = "n" ]; then
        echo "You have cancelled the release of ccTiddly $1"
        exit 1 
    fi
done

echo "Complete"
exit 1
