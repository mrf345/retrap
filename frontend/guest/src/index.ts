import { resolveLazyLoadedLinks, resolveFavIconEdgeCases, resolveEventfulForms, getScreenShot } from './helpers'


async function main () {
    resolveFavIconEdgeCases()
    resolveLazyLoadedLinks()
    resolveEventfulForms()
    // setTimeout(async () => {
    //     const photoUrl = await getScreenShot()

    //     photoUrl
    //         ? window.open(photoUrl)
    //         : alert('Failed to fetch screenshot.')
    // }, 5000)
    /* Some websites change the history after load */
    window.history.pushState('data', 'Title', encodeURIComponent(window.ORIGINAL))
}


document.readyState === 'complete'
    ? main()
    : window.addEventListener('load', main)
