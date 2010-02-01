#ssh pauldowney@amp.dreamhost.com mkdir /home/pauldowney/whatfettle.com/2010/01/APL/
rsync -avz -e ssh index.html images pauldowney@amp.dreamhost.com:/home/pauldowney/whatfettle.com/2010/01/APL/

exit

(
	cd ..
	(
	    echo APL/index.html
	    echo APL/TiddlySaver.jar
	    echo APL/backups
	    ls -1 APL/images/*
	) | zip -@ APL/APL.zip
)

scp APL.zip pauldowney@amp.dreamhost.com:/home/pauldowney/whatfettle.com/2010/01/APL/
