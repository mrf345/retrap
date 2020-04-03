import { resolveLazyLoadedLinks, resolveFavIconEdgeCases } from './helpers'


function main () {
    resolveFavIconEdgeCases()
    resolveLazyLoadedLinks()
    /* Some websites change the history after load */
    window.history.pushState('data', 'Title', encodeURIComponent(window.ORIGINAL))
}


document.readyState === 'complete'
    ? main()
    : window.addEventListener('load', main)
