os=`uname`

rm -rf ./retrap/

node ./crossPackage.js
npx nvm use
npx pkg package.json --out-path retrap/

mkdir dist/
mkdir retrap/puppeteer/

if [[ $os == MINGW* ]];then
    # Windows 64, NOTE: generating on Linux results in Error: segmentation fault.
    cp -R ./node_modules/puppeteer/.local-chromium/win* retrap/puppeteer/
    cp ./node_modules/ngrok/bin/ngrok.exe retrap/ngrok.exe
    rm -rf retrap/retrap-linux retrap/retrap-macos
else
    # Linux
    cp -R ./node_modules/puppeteer/.local-chromium/linux* retrap/puppeteer/
    cp ./node_modules/ngrok/bin/linuxx64_ngrok retrap/ngrok
    zip -r -9 dist/retrap_linux.zip retrap/puppeteer retrap/ngrok retrap/retrap-linux
    rm -rf retrap/puppeteer/*
    rm -rf retrap/ngrok/*

    # MacOS
    cp -R ./node_modules/puppeteer/.local-chromium/mac* retrap/puppeteer/
    cp -R ./node_modules/ngrok/bin/darwinx64_ngrok retrap/ngrok
    zip -r -9 dist/retrap_macos.zip retrap/puppeteer retrap/ngrok retrap/retrap-macos

    rm -rf retrap/
fi
