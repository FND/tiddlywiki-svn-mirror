ssh ${TW_DEPLOY_HOST:?} mkdir ${TW_DEPLOY_DIR?:?}/TatePlugin/
scp index.html ${TW_DEPLOY_HOST:?}:${TW_DEPLOY_DIR?:?}/TatePlugin/
