cd frontend/guest/ && npm i . && cd ../../

# Copy over relative paths for Window Git environment
os=`uname`

if [[ $os == MINGW* ]];then
    cp -rf src/utils.ts frontend/guest/src/
    cp -rf global.d.ts frontend/guest/
fi
