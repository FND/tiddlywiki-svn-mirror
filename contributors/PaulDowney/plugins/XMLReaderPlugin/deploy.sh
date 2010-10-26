ssh ${TW_DEPLOY_HOST:?} mkdir ${TW_DEPLOY_DIR?:?}/XMLReaderPlugin/
scp index.html ${TW_DEPLOY_HOST:?}:${TW_DEPLOY_DIR?:?}/XMLReaderPlugin/

ssh ${TW_DEPLOY_HOST:?} mkdir ${TW_DEPLOY_DIR?:?}/XMLReaderPlugin/data/
scp data/one.xml ${TW_DEPLOY_HOST:?}:${TW_DEPLOY_DIR?:?}/XMLReaderPlugin/data/
