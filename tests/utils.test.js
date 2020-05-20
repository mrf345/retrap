const utils = require('../build/src/utils')


describe('Unit testing common utility functions 🧰', () => {
    const urlOrigin = 'http://testing.com'
    const url = `${urlOrigin}/path/testing`
    const url2 = 'http://example.com/more/stuff'
    const extension = 'jpg'
    const fileUrl = `${url}.${extension}`

    test('Test count result', () => {
        expect(utils.count('.', 'www.testing.com')).toEqual(2)
    })

    test('Test getUrlBase result', () => {
        expect(utils.getUrlBase(url)).toEqual('http://testing.com')
        expect(utils.getUrlBase(url, false)).toEqual('testing.com')
    })

    test('Test isValidUrl check', () => {
        expect(utils.isValidUrl('wrong')).toBe(false)
        expect(utils.isValidUrl(url)).toBe(true)
    })

    test('Test isFileUrl check', () => {
        expect(utils.isFileUrl(url)).toBe(false)
        expect(utils.isFileUrl(fileUrl)).toBe(true)
    })

    test('Test getUrlFileExtension result', () => {
        expect(utils.getUrlFileExtension(fileUrl)).toEqual(extension)
    })

    test('Test joinUrls result', () => {
        expect(utils.joinUrls(url, url2)).toEqual(`${url}/${url2}`)
    })

    test('Test wwwify result', () => {
        expect(utils.wwwify(url))
            .toEqual('http://www.testing.com/path/testing')
    })

    test('Test httpify result', () => {
        expect(utils.httpify(url.replace('http://', ''))).toEqual(url)
    })

    test('Test resolveRelativeUrls result', () => {
        expect(utils.resolveRelativeUrl('/testing/more', url, true))
            .toEqual('http://www.testing.com/testing/more')
    })

    test('Test localizeExternalUrl result', () => {
        expect(utils.localizeExternalUrl('/1.css', url, 'http://localhost'))
            .toEqual(`http://localhost/${encodeURIComponent(urlOrigin + '/' + '1.css')}`)
    })

    test('Test cloneElement result', () => {
        const element = document.createElement('a')
        const id = 'toBeCloned'
        const handler = () => console.log('do stuff')
        element.id = id
        element.onclick = handler
        document.body.appendChild(element)

        expect(document.getElementById(id).onclick).toEqual(handler)
        utils.cloneElement(element)
        expect(document.getElementById(id).onclick).toBeFalsy()
    })

    test('Test wait result', () => {
        const seconds = 5

        expect(utils.wait(seconds))
            .toEqual(new Promise((r) => {
                setTimeout(() => r(), seconds)
            }))
    })

    test('Test getIdString result', () => {
        const array = [1, 2, 3]
        const obj = {a: 1, b: 2, c: 3}
        const id = '123'

        expect(utils.getIdString(array)).toEqual(id)
        expect(utils.getIdString(obj)).toEqual(id)
    })
})
