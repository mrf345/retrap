rm -rf ./retrap/

node ./crossPackage.js
npx nvm use
npx pkg package.json --out-path retrap/

mkdir dist/
mkdir retrap/puppeteer/

# Linux
cp -R ./node_modules/puppeteer/.local-chromium/linux* retrap/puppeteer/
cp ./node_modules/ngrok/bin/linuxx64_ngrok retrap/ngrok
zip -r -9 dist/retrap_linux.zip retrap/puppeteer retrap/ngrok retrap/retrap-linux
rm -rf retrap/puppeteer/*
rm -rf retrap/ngrok/*

# Windows 64
cp -R ./node_modules/puppeteer/.local-chromium/win* retrap/puppeteer/
cp ./node_modules/ngrok/bin/win32x64_ngrok.exe retrap/ngrok.exe
zip -r -9 dist/retrap_win64.zip retrap/puppeteer retrap/ngrok.exe retrap/retrap-win.exe
rm -rf retrap/puppeteer/*
rm -rf retrap/ngrok/*

# MacOS
cp -R ./node_modules/puppeteer/.local-chromium/mac* retrap/puppeteer/
cp -R ./node_modules/ngrok/bin/darwinx64_ngrok retrap/ngrok
zip -r -9 dist/retrap_macos.zip retrap/puppeteer retrap/ngrok retrap/retrap-macos


rm -rf retrap/
