
scp index.html ${TW_DEPLOY_HOST:?}:/home/pauldowney/tiddlypocketbook.com/

#ssh ${TW_DEPLOY_HOST:?} mkdir -p /home/pauldowney/tiddlypocketbook.com/books/psd/
scp TiddlyWikiPocketBook.pdf ${TW_DEPLOY_HOST:?}:/home/pauldowney/tiddlypocketbook.com/books/psd

(
	cd ..
	(
	    echo TiddlyPocketBook/index.html
	    echo TiddlyPocketBook/TiddlySaver.jar
	    echo TiddlyPocketBook/backups
	) | zip -@ TiddlyPocketBook/TiddlyPocketBook.zip
)

scp TiddlyPocketBook.zip ${TW_DEPLOY_HOST:?}:/home/pauldowney/tiddlypocketbook.com/
