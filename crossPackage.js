const FS = require('fs')
const puppeteer = require('puppeteer')
const downloadNgrok = require('ngrok/download')
const chromePlatforms = ['mac', 'win64']
const ngrokPlatforms = ['darwinx64', 'win32x64', 'linuxx64']


chromePlatforms.forEach(platform => {
    const browserFetcher = puppeteer.createBrowserFetcher({ platform })
    const revision = require('puppeteer/package').puppeteer.chromium_revision

    browserFetcher.download(revision)
      .then(() => console.log(`Chrome for ${platform} is done downloading.`))
      .catch(error => console.log('Error', error))
})

ngrokPlatforms.forEach(arch => {
    const ngrokPath = './node_modules/ngrok/bin'
    const exeFilename = arch.startsWith('win') ? 'ngrok.exe' : 'ngrok'

    downloadNgrok(() => {
        FS.copyFileSync(`${ngrokPath}/${exeFilename}`, `${ngrokPath}/${arch}_${exeFilename}`)
        console.log(`Ngrok for ${arch} is done downloading.`)
    }, { arch, ignoreCache: true })
})
