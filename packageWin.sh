rm -rf ./retrap/

node ./crossPackage.js
npx nvm use
npx pkg package.json --out-path retrap/

mkdir dist/
mkdir retrap/puppeteer/

# Windows 64, NOTE: Make sure to run it on Windows. Linux results in Error: segmentation fault.
cp -R ./node_modules/puppeteer/.local-chromium/win* retrap/puppeteer/
cp ./node_modules/ngrok/bin/win32x64_ngrok.exe retrap/ngrok.exe
zip -r -9 dist/retrap_win64.zip retrap/puppeteer retrap/ngrok.exe retrap/retrap-win.exe
rm -rf retrap/puppeteer/*
rm -rf retrap/ngrok/*
