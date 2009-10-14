#	create a tar.gz achieve for deploying tiddlydocs into tiddlyweb 
#
#	Requires 
#		
#		tiddlyweb, tiddlywebwiki, curl, svn
#
#


if [ -z "$1" ]              # Tested variable is quoted.
then
 echo "ERROR - You need to provide the release number....."  # Need quotes to escape #
exit 1
fi

echo "Are you sure you wish to release TiddlyDocs  $1"

PS3=""
OPTIONS="y n"
select i in $OPTIONS; do
    if [ "$i" = "y" ]; then
		
		rm -R -f  builds
		mkdir builds
		cd builds
		twanager --load tiddlywebwiki.config instance tiddlydocs-$1


		cd tiddlydocs-$1
		
		twanager bag tdocs < /dev/null
		twanager bag documents < /dev/null

		curl http://github.com/tiddlyweb/tiddlyweb/raw/master/apache.py >apache.py
		curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atom.py > atom.py
		curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atomplugin.py > atomplugin.py
		curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/htmlatom.py > htmlatom.py
		curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/twstatic/static.py > static.py
		curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlyeditor_plus.py > tiddlyeditor_plus.py
		curl http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/TiddlyDocs/gadget.py > gadget.py
		curl http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/TiddlyDocs/room_script.py > room_script.py
		curl http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/validators/html_validator.py > html_validator.py
		curl http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/validators/tiddlywiki_validator.py > tiddlywiki_validator.py
		
		twanager from_svn documents http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/documents/TheInternet/split.recipe
		twanager from_svn tdocs http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/index.html.recipe
	
		# Revisions 
		twanager from_svn system http://svn.tiddlywiki.org/Trunk/association/plugins/RevisionsCommandPlugin.js
		twanager from_svn system http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/DiffFormatterPlugin.js
		curl http://github.com/FND/tiddlyweb-plugins/raw/master/differ.py > differ.py

		rm tiddlywebconfig.py
		curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlywebconfig.py > tiddlywebconfig.py
		
		
		# get RDF plugin
		mkdir rtf
		curl http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/tiddlyweb/TiddlyWebRTF/rtf/__init__.py > rtf/__init__.py

		#wget http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/form/form.py

		## get recipe files 
		curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/recipes/tiddlydocs > store/recipes/tiddlydocs

		## Get CKEditor 
		mkdir static 
		cd static 
		mkdir ckeditor 
		curl http://download.cksource.com/CKEditor/CKEditor/CKEditor%203.0/ckeditor_3.0.tar.gz > ckeditor_3.0.tar.gz
		tar xvf ckeditor_3.0.tar.gz
		rm ckeditor_3.0.tar.gz
		svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_images/ mydocs_images
		svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_css/ mypage_css
		cd ../

		## TEMP - update permissions on system bag
		rm store/bags/system/policy
		curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/bags/system/policy > store/bags/system/policy

		cd ../

		tar -pczf tiddlydocs-$1.tar.gz tiddlydocs-$1

        exit 1
    elif [ "$i" = "n" ]; then
        echo "You have cancelled the release of TiddlyDocs $1"
        exit 1 
    fi
done



