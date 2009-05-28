
scp index.html pauldowney@amp.dreamhost.com:/home/pauldowney/tiddlypocketbook.com/

#ssh pauldowney@amp.dreamhost.com mkdir -p /home/pauldowney/tiddlypocketbook.com/books/psd/
#scp TiddlyWikiPocketBook.pdf pauldowney@amp.dreamhost.com:/home/pauldowney/tiddlypocketbook.com/books/psd

(
	cd ..
	(
	    echo TiddlyPocketBook/index.html
	    echo TiddlyPocketBook/TiddlySaver.jar
	    echo TiddlyPocketBook/backups
	) | zip -@ TiddlyPocketBook/TiddlyPocketBook.zip
)

scp TiddlyPocketBook.zip pauldowney@amp.dreamhost.com:/home/pauldowney/tiddlypocketbook.com/
