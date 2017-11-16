const async = require('asyncawait/async');
const await = require('asyncawait/await');
const puppeteer = require('puppeteer');

const run = async((url) => {
    const browser = await(puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true }));
    const page = await(browser.newPage());

    page.on("pageerror", (err) => {
        await(page.close());
        await(browser.close());
        throw err;
    });

    page.on("error", (err) => {
        await(page.close());
        await(browser.close());
        throw err;
    });

    try {
        await(page.setUserAgent('Baymax-Cached'));
        // await(page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'));
        await(page.setViewport({ width: 1920, height: 1080 }));
        await(page.goto(`${url}`, { waitUntil: 'networkidle', timeout: 30000 }));

        var dom = await(page.content());
        await(page.close());
        await(browser.close());
        return dom;
    } catch (err) {
        await(page.close());
        await(browser.close());
        throw err;
    }
});

const ways = async((dom, url) => {
    const pattern = /<a.*?href.*?<\/.*?a>/gi;
    const raw_links = dom.match(pattern);
    const result = raw_links.reduce((res, link) => {
        let href_url = '';
        if (/(?:https?|cdn)/i.test(link)) {
            const href_pattern = /(.*?href=")(\/?(.*?))(".*)/i;
            href_url = link.replace(href_pattern, '$1$2$4 - $2');
        } else {
            const href_pattern = /(.*?href=")(\/?(.*?))(".*)/i;
            href_url = link.replace(href_pattern, '$1' + `${url}/` + '$3$4 - $2');
        }

        return res + `${href_url}` + '<br />';
    }, '');

    return `<h1>found ${raw_links.length} links</h1><br />${result}`;
});

const see = async((dom, url) => {
    const pattern = /<img.*?src.*?>/gi;
    const raw = dom.match(pattern);
    const result = raw.reduce((res, link) => {
        let href_url = '';
        if (/(?:https?|cdn)/i.test(link)) {
            const href_pattern = /(.*?src=")(\/?(.*?))(".*)/i;
            href_url = link.replace(href_pattern, '$1$2$4 - $2');
        } else {
            const href_pattern = /(.*?src=")(\/?(.*?))(".*)/i;
            href_url = link.replace(href_pattern, '$1' + `${url}/` + '$3$4 - $2');
        }

        return res + `${href_url}` + '<br />';
    }, '');

    return `<h1>found ${raw.length} images</h1><br />${result}`;
});

module.exports = {
    BlackHorse: {
        Run: run,
        Ways: ways,
        See: see,
    }
}
