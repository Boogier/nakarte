// Promote a whitelisted set of query-string keys into the URL hash before
// hashState reads `location.hash` on import. Lets crawlable URLs like
// `/?nf=Foo&m=13/41.77/23.45&l=O` (used by sitemap.xml) drive the SPA.

(function () {
    // eslint-disable-next-line no-console
    console.log('queryToHash: search=', location.search, 'hash=', location.hash);
    const search = location.search.replace(/^\?/u, '');
    if (!search) {
        return;
    }
    const allowedKeys = new Set(['nf', 'm', 'l']);
    const items = [];
    for (const pair of search.split('&')) {
        if (!pair) {
            continue;
        }
        const eqIdx = pair.indexOf('=');
        const key = eqIdx >= 0 ? pair.slice(0, eqIdx) : pair;
        if (!allowedKeys.has(key)) {
            continue;
        }
        items.push(pair);
    }
    if (!items.length) {
        return;
    }
    const existingHash = location.hash.replace(/^#/u, '');
    const hash = existingHash ? `${items.join('&')}&${existingHash}` : items.join('&');
    history.replaceState(null, '', `${location.pathname}#${hash}`);
})();

export {};
