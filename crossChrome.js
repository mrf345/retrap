const puppeteer = require('puppeteer')
const platforms = ['mac', 'win64']

platforms.forEach((platform) => {
    const browserFetcher = puppeteer.createBrowserFetcher({ platform })
    const revision = require('puppeteer/package').puppeteer.chromium_revision

    browserFetcher.download(revision)
      .then(() => console.log('Done'))
      .catch(error => console.log('Error', error))
})
