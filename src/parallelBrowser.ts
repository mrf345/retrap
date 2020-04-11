import * as Path from 'path'
import * as FS from 'fs'
import { uuid } from 'uuidv4'
import * as puppeteer from 'puppeteer'
import * as Cheerio from 'cheerio'

import { resolveRelativeUrl, localizeExternalUrl, joinUrls, getUrlBase, isFileUrl, getUrlFileExtension } from './utils'
import { note } from '../bin/styles'


interface Cache {
    [key:string]: string
}

interface Tries {
    [key:string]: number
}

interface Browsers {
    [key:string]:Browser
}


class Browser {
    limitMinutes:number
    lastAccess:Date
    private _browser:any
    private sessionId:string

    constructor(sessionId:string, limitMinutes = 10) {
        this.limitMinutes = limitMinutes
        this.sessionId = sessionId
        this.lastAccess = new Date()
    }

    get shouldCleanup () {
        return (new Date().getMinutes() - this.limitMinutes) > this.lastAccess.getMinutes()
    }

    async get ():Promise<puppeteer.Browser> {
        this.lastAccess = new Date()

        return this._browser
            ? this._browser
            : this._browser = await puppeteer.launch({defaultViewport: {width: 1920, height: 1080}})
    }
}


export default class ParallelBrowser {
    tries:Tries
    cache:Cache
    app:any
    serverUrl:string
    defaultLink:string
    timeout:number
    retries:number
    maxRetries:number
    cacheDir:string
    browsers:Browsers
    cleaner:NodeJS.Timeout

    private browsersCleaner() {
        this.cleaner = setInterval(() => {
            Object
                .entries(this.browsers)
                .map(async ([sessionId, browser]) => {
                    if (browser.shouldCleanup) {
                        await (await browser.get()).close()
                        delete this.browsers[sessionId]
                    }
                })
        }, 5000)
    }

    constructor(serverUrl:string, cacheDir:string, defaultLink:string, retries = 2, timeout = 30) {
        this.serverUrl = serverUrl
        this.cacheDir = cacheDir
        this.defaultLink = defaultLink
        this.timeout = timeout
        this.retries = retries
        this.maxRetries = retries * 2
        this.tries = {}
        this.cache = {}
        this.browsers = {}
        this.browsersCleaner()
    }

    private async fetchAndCache(link:string, reqHeaders:any, sessionId:string) {
        const cacheName = `/${uuid().split('-').join('')}.html`
        const cachePath = Path.join(this.cacheDir, cacheName)
        const browser = await (this.browsers[sessionId] || new Browser(sessionId)).get()
        const page = await browser.newPage()
        await page.setRequestInterception(true)
        page.on('request', (req) => {
            const headers = req.headers()

            headers['User-Agent'] = reqHeaders['user-agent']
            headers['Accept-Language'] = reqHeaders['accept-language']

            req.continue({ headers })
        })
        await page.goto(link, {timeout: this.timeout * 1000, waitUntil: 'networkidle2'})
        const content = await page.content()
        await browser.close()

        return { content, cachePath, cacheName }
    }

    private parseHTMLContent(link:string, content:string) {
        const $ = Cheerio.load(content)

        $('form').each((i, e) => {
            const action = $(e).attr('action')
            const linkBase = getUrlBase(link)

            if (action) {
                const resolvedAction = action.includes(getUrlBase(link, false))
                    ? joinUrls(this.serverUrl, action)
                    : joinUrls(this.serverUrl, joinUrls(linkBase, action))

                if (action) $(e).attr('action', resolvedAction)
            }
        })

        $('a').each((i, e) => {
            const href = $(e).attr('href')

            if (href) $(e).attr('href', localizeExternalUrl(href, link, this.serverUrl))
            $(e).removeAttr('onclick')
            $(e).removeAttr('onmousedown')
            $(e).removeAttr('onmouseup')
        })

        $('meta[itemprop="image"]').each((i, e) => {
            const metaContent = $(e).attr('content')

            if (metaContent) $(e).attr('content', resolveRelativeUrl(metaContent, link))
        })

        $('script, link, img, audio, video').each((i, e) => {
            const src = $(e).attr('src')
            const href = $(e).attr('href')

            $(e).removeAttr('srcset')
            if (src) $(e).attr('src', resolveRelativeUrl(src, link, true))
            if (href) $(e).attr('href', resolveRelativeUrl(src, link, true))

            if (/audio|video/.test(e.tagName)) e.children.forEach((ee) => {
                const innerSrc = $(ee).attr('src')

                if (innerSrc) $(e).attr('src', resolveRelativeUrl(src, link, true))
            })
        })

        $('body').append(`<script type="text/javascript">window.ORIGINAL = "${link}"</script>`)
        $('body').append('<script type="text/javascript" src="/guest.js"></script>')

        return $.html()
    }

    async get(link:string, headers:any, sessionId:string) {
        const cache = this.cache[link]

        if (cache) return cache
        if (isFileUrl(link) && getUrlFileExtension(link) !== 'html') {
            link = this.defaultLink
        }

        try {
            const { content, cacheName, cachePath } = await this.fetchAndCache(link, headers, sessionId)

            await FS.promises.writeFile(cachePath, this.parseHTMLContent(link, content))
            return this.cache[link] = cacheName
        } catch (err) {
            console.warn('\n' + note('Warning: ') + `Failed to fetch and write cache for ${link}\n`)
            console.log(err, '\n')

            const counter = this.tries[link] || 1
            this.tries[link] = counter + 1

            if (this.tries[link] > this.maxRetries) throw err
            else {
                const destination = this.tries[link] >= this.retries
                    ? this.get(this.defaultLink, headers, sessionId)
                    : this.get(link, headers, sessionId)

                this.tries[link] = 0
                return destination
            }
        }
    }
}
