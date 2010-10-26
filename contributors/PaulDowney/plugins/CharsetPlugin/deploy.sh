ssh ${TW_DEPLOY_HOST:?} mkdir ${TW_DEPLOY_DIR?:?}/CharsetPlugin/
scp index.html ${TW_DEPLOY_HOST:?}:${TW_DEPLOY_DIR?:?}/CharsetPlugin/
