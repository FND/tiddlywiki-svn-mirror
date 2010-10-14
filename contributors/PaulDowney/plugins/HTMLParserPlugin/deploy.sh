#ssh ${TW_DEPLOY_HOST:?} mkdir ${TW_DEPLOY_DIR?:?}/HTMLParserPlugin/
scp index.html simple.html HTMLParserPlugin.js ${TW_DEPLOY_HOST:?}:${TW_DEPLOY_DIR?:?}/HTMLParserPlugin/
