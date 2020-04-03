import { joinUrls, getUrlPath, getUrlBase, count, cloneElement } from './utils'


export function resolveFavIconEdgeCases () {
    let icon:HTMLLinkElement = document.querySelector('link[rel*="icon"]')

    if (!icon) {
        const secondSrc:HTMLMetaElement = document.querySelector('meta[itemprop="image"]')

        icon = document.createElement('link')
        icon.type = 'image/x-icon'
        icon.rel = 'shortcut icon'
        icon.href = secondSrc ? secondSrc.content : ''

        document.getElementsByTagName('head')[0].appendChild(icon)
    }
}


export function resolveLazyLoadedLinks () {
    const originalName = getUrlBase(window.ORIGINAL, false)
    const resolver = () => {
        Array
            .from(document.querySelectorAll('a'))
            .forEach((link) => {
                /* Urls lazy loaded and weren't parsed by backend, let's do it again here. */
                const conditions = [
                    !(new RegExp(`\/${originalName}|\/${encodeURIComponent(originalName)}`).test(link.href)),
                    /^#|javascript/.test(link.href) === false,
                    count('/http', link.href) === 0
                ]

                if (conditions.every(c => c)) {
                    let parsedLink:string

                    if (!link.href.startsWith(origin)) {
                        parsedLink = encodeURIComponent(link.href)
                    } else {
                        const urlPath = link.href.startsWith('http') ? getUrlPath(link.href) : link.href
                        const originalBase= getUrlBase(window.ORIGINAL, true)

                        parsedLink = encodeURIComponent(joinUrls(originalBase, urlPath))
                    }

                    /* Some websites have predefined click events, cloning gets rid of them 🔎 */
                    const clonedLink = cloneElement(link)

                    clonedLink.href = parsedLink
                    clonedLink.onclick = (event:Event) => {
                        event.preventDefault()
                        window.location.href = parsedLink
                    }
                }
            })
    }

    resolver()
    return setInterval(resolver, 1500)
}
