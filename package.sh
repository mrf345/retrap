npx nvm use
npx pkg package.json --out-path dist/


mkdir dist/puppeteer/

# Linux
cp -R ./node_modules/puppeteer/.local-chromium/linux* dist/puppeteer/
zip -r dist/retrap_linux.zip dist/retrap-linux dist/puppeteer/
rm -rf dist/puppeteer/*

# Windows 64
cp -R ./node_modules/puppeteer/.local-chromium/win* dist/puppeteer/
zip -r dist/retrap_win64.zip dist/retrap-win dist/puppeteer/
rm -rf dist/puppeteer/*

# MacOS
cp -R ./node_modules/puppeteer/.local-chromium/mac* dist/puppeteer/
zip -r dist/retrap_macos.zip dist/retrap-macos dist/puppeteer/

rm -rf dist/
rm dist/retrap-*
