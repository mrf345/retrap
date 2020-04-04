import * as Path from 'path'
import * as FS from 'fs'
import { uuid } from 'uuidv4'
import fetch from 'node-fetch'
import * as Cheerio from 'cheerio'

import { resolveRelativeUrl, localizeExternalUrl, joinUrls, getUrlBase, isFileUrl, getUrlFileExtension } from './utils'
import { note } from '../bin/styles'


interface Cache {
    [key:string]: string
}

interface Tries {
    [key:string]: number
}


export default class FakeBrowser {
    tries:Tries
    cache:Cache
    app:any
    serverUrl:string
    defaultLink:string
    timeout:number
    retries:number
    maxRetries:number
    cacheDir:string

    constructor(serverUrl:string, cacheDir:string, defaultLink:string, retries = 2, timeout = 30) {
        this.serverUrl = serverUrl
        this.cacheDir = cacheDir
        this.defaultLink = defaultLink
        this.timeout = timeout
        this.retries = retries
        this.maxRetries = retries * 2
        this.tries = {}
        this.cache = {}
    }

    private async callAndCache(link:string, reqHeaders:any) {
        const contentType = 'text/html; charset=UTF-8'
        const cacheName = `/${uuid()}.html`

        const cachePath = Path.join(this.cacheDir, cacheName)
        const headers = {
            'User-Agent': reqHeaders['user-agent'],
            'Content-Type': contentType,
            'Accept-language': reqHeaders['accept-language']
        }
        const content = await <Promise<string>>Promise.race([
            new Promise((_, r) => setTimeout(() => r('Timeout'), this.timeout * 1000)),
            fetch(link, {headers}).then((r:any) => r.text())
        ])

        return { content, cachePath, cacheName }
    }

    private parseHTMLContent(link:string, content:string) {
        const $ = Cheerio.load(content)

        $('form').each((i, e) => {
            const action = $(e).attr('action')
            const linkBase = getUrlBase(link)

            if (action.startsWith('/')) $(e).attr('action', '/' + joinUrls(linkBase, action))
        })

        $('a').each((i, e) => {
            const href = $(e).attr('href')

            if (href) $(e).attr('href', localizeExternalUrl(href, link, this.serverUrl))
        })

        $('link').each((i, e) => {
            const href = $(e).attr('href')

            if (href) $(e).attr('href', resolveRelativeUrl(href, link))
        })

        $('meta[itemprop="image"]').each((i, e) => {
            const metaContent = $(e).attr('content')

            if (metaContent) $(e).attr('content', resolveRelativeUrl(metaContent, link))
        })

        $('script, img, audio, video').each((i, e) => {
            const src = $(e).attr('src')

            $(e).removeAttr('srcset')
            if (src) $(e).attr('src', resolveRelativeUrl(src, link, true))
            if (/audio|video/.test(e.tagName)) e.children.forEach((ee) => {
                const innerSrc = $(ee).attr('src')

                if (innerSrc) $(e).attr('src', resolveRelativeUrl(src, link, true))
            })
        })

        $('body').append(`<script type="text/javascript">window.ORIGINAL = "${link}"</script>`)
        $('body').append('<script type="text/javascript" src="/guest.js"></script>')

        return $.html()
    }

    async get(link:string, headers:any) {
        const cache = this.cache[link]
        if (cache) return cache

        /* If it's not an HTML, we'll redirect to the default link
           , Any format other than HTML is useless for this use-case 💡
        */
        if (isFileUrl(link) && getUrlFileExtension(link) !== 'html') {
            link = this.defaultLink
        }

        try {
            const { content, cacheName, cachePath } = await this.callAndCache(link, headers)

            FS.writeFileSync(cachePath, this.parseHTMLContent(link, content))
            return this.cache[link] = cacheName
        } catch (err) {
            console.warn('\n' + note('Warning: ') + `Failed to fetch and write cache for ${link}\n`)
            console.log(err, '\n')

            const counter = this.tries[link] || 1
            this.tries[link] = counter + 1

            if (this.tries[link] > this.maxRetries) throw err
            return this.tries[link] >= this.retries
                ? this.get(this.defaultLink, headers)
                : this.get(link, headers)
        }
    }
}
