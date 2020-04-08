export function count (toCount:string, toCountIn:string):number {
    return toCountIn.split(toCount).length - 1
}


export function getUrlBase (url:string, protocol = true) {
    try {
       return new URL(url)[protocol ? 'origin' : 'host']
    } catch (err) { return url }
}


export function getUrlPath (url:string) {
    try {
        const urlObj = new URL(url)

        return urlObj.pathname + urlObj.search
    } catch (err) { return url }
}


export function isValidUrl (url:string):boolean {
    const host = new URL(url).hostname

    try { return 2 >= count('.', host) && host.includes('.') }
    catch (err) { return false }
}


export function isFileUrl (url:string) {
    const chunks = url.split('?')[0].split('/')

    if (url.includes('http') && chunks.length === 3) return false

    return count('.', (chunks.slice(-1)[0] || '')) === 1
}


export function getUrlFileExtension (url:string) {
    return (url.split('/').slice(-1)[0] || '').split('?')[0].split('.')[1]
}


export function joinUrls (firstUrl:string, secondUrl:string) {
    if (!firstUrl.endsWith('/')) firstUrl += '/'
    if (secondUrl.startsWith('/')) secondUrl = secondUrl.slice(1)

    return secondUrl.includes(firstUrl)
        ? secondUrl
        : firstUrl.includes(secondUrl)
            ? firstUrl
            : firstUrl + secondUrl
}


export function wwwify (url:string) {
    if (url.includes('www.')) return url

    const chunks = url.split('//', 2)
    return `${chunks[0]}//www.${chunks[1]}`
}


export function httpify (url:string) {
    if (url.startsWith('http:')) return url
    if (url.startsWith('https:')) return url.replace('https:', 'http:')

    return `http://${url}`
}


export function resolveRelativeUrl (url:string, remoteUrl:string, www = false):string {
    let remoteBase = getUrlBase(remoteUrl, true)
    if (www && count('.', remoteBase) === 1) remoteBase = wwwify(remoteBase)


    if (url && url.startsWith('//')) url = 'http:' + url
    else if (url && !url.startsWith('http')) url = joinUrls(remoteBase, url)

    return url
}


export function localizeExternalUrl (url:string, remoteUrl:string, localUrl:string) {
    if (/^#|javascritp/.test(url)) return url
    if (url.startsWith('//')) return 'http:' + url

    const localBase = getUrlBase(localUrl, true)
    const remoteBase = getUrlBase(remoteUrl, true)
    const urlBase = httpify(getUrlBase(url, true))
    const urlPath = getUrlPath(url)

    if (url.startsWith('/')) return joinUrls(localBase, encodeURIComponent(joinUrls(remoteBase, urlPath)))
    return joinUrls(localBase, encodeURIComponent(joinUrls(urlBase, urlPath)))
}


export function cloneElement (element:any):any {
    const newElement:HTMLLinkElement = element.cloneNode(false)

    while (element.hasChildNodes()) newElement.appendChild(element.firstChild)
    element.parentNode.replaceChild(newElement, element)
    return newElement
}
