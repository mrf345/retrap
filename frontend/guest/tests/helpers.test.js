jest.mock('network-speed')

const utils = require('../build/utils')
const helpers = require('../build/helpers')
const mockers = require('./mockers')


describe('Unit testing hooks helper and action functions 🎣', () => {
    test('Test resolveFavIconEdgeCases effect', () => {
        const secondSource = document.createElement('meta')
        secondSource.content = 'https://testing.com/favicon.ico'

        secondSource.setAttribute('itemprop', 'image')
        document.body.appendChild(secondSource)
        helpers.resolveFavIconEdgeCases()

        expect(document.querySelector('link[type="image/x-icon"]').href)
            .toBe(utils.wwwify(secondSource.content))
    })

    test('Test resolveEventfulForms effect', () => {
        const loginForm = document.createElement('form')
        const passInput = document.createElement('input')
        const formId = 'testingForm'
        loginForm.id = formId
        loginForm.onsubmit = () => console.log('do something')
        passInput.name = 'password'

        loginForm.appendChild(passInput)
        document.body.appendChild(loginForm)
        helpers.resolveEventfulForms()

        expect(document.getElementById(formId)).toBeTruthy()
        expect(document.getElementById(formId).onsubmit).toBeFalsy()
    })

    test('Test resolveLazyLoadedLinks effect', () => {
        const lazyLink = document.createElement('a')
        const linkId = 'lazyLink'
        lazyLink.id = linkId
        lazyLink.href = 'http://testing.com'
        lazyLink.onmouseover = () => console.log('do something')

        document.body.appendChild(lazyLink)
        helpers.resolveLazyLoadedLinks()

        expect(document.getElementById(linkId)).toBeTruthy()
        expect(document.getElementById(linkId).onmouseover).toBeFalsy()
        expect(document.getElementById(linkId).href)
            .toEqual(`${origin}/${encodeURIComponent(lazyLink.href)}`)
    })

    test.skip('Test getActiveSessions results', async () => {
        // FIXME: TypeError: Cannot read property 'apply' of undefined. (On GH Actions)
        const supportedSites = new Set([
            'facebook', 'youtube', 'gmail', 'spotify', 'github',
            'instagram','snapchat', 'airbnb'
        ])

        mockers.mockImage(true)
        const sessions = await helpers.getActiveSessions()

        expect(Object.values(sessions).every(v => v)).toBe(true)
        expect(Object.keys(sessions).sort())
            .toEqual(Array.from(supportedSites).sort())
    })

    test('Test getGeneralInfo results', async () => {
        const expectedInfo = new Set([
            'userAgent', 'charging', 'chargeLeft', 'doNotTrack', 'java', 'flash',
            'language', 'languages', 'touch', 'usbDevices', 'resolution', 'cpuCors'
        ])

        const info = await helpers.getGeneralInfo()

        expect(Array.from(expectedInfo)
            .map(i => typeof info[i] === 'boolean' || info[i] === undefined || !!info[i])
        ).toEqual(Array(expectedInfo.size).fill(true))
    })

    test('Test checkFirstTime result', () => {
        localStorage.clear()

        expect(helpers.checkFirstTimer()).toBe(true)
        expect(helpers.checkFirstTimer()).toBe(false)
        expect(helpers.checkFirstTimer()).toBe(false)
    })

    test('Test say effect', () => {
        const mocker = mockers.mockSpeak()
        const text = 'something to say'

        helpers.say(text)

        expect(mocker).toBeCalledWith(new SpeechSynthesisUtterance(text))
    })

    test('Test injectScript effect', () => {
        const script = `
            const [a, b] = [100, 900]
            console.assert(a !== b)
        `

        helpers.injectScript(script)

        expect(Array.from(document.querySelectorAll('script'))
            .find(e => e.innerHTML === script)
        ).toBeTruthy()
    })

    test('Test redirect effect', () => {
        const url = 'http://testing.com'
        const preOrigin = origin

        expect(window.location.href).toEqual(origin + '/')
        expect(helpers.redirect(url))
            .toEqual(utils.joinUrls(preOrigin, encodeURIComponent(url)))
    })

    test('Test getNetworkSpeed results', async () => {
        const expectedMeasures = {kbps: undefined, mbps: undefined}

        expect(await helpers.getNetworkSpeed())
            .toMatchObject({
                down: expectedMeasures,
                up: expectedMeasures
            })
    })
})
