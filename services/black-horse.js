const async = require('asyncawait/async');
const await = require('asyncawait/await');
const puppeteer = require('puppeteer');

const run = async((url) => {
    const browser = await(puppeteer.launch({ args: ['--no-sandbox'] }));
    const page = await(browser.newPage());

    //await(page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'));
    await(page.setViewport({ width: 1920, height: 1080 }));
    await(page.goto(`${url}`, { waitUntil: 'networkidle', timeout: 30000 }));

    var dom = await(page.content());
    browser.close();
    return dom;
});

const ways = async((dom, url) => {
    const pattern = /<a.*?href.*?<\/.*?a>/gi;
    const raw_links = dom.match(pattern);
    const result = raw_links.reduce((res, link) => {
        let href_url = '';
        if(/(?:https?|cdn)/i.test(link)){
            href_url = link;
        } else {
            const href_pattern = /(.*?href=")\/?(.*?)(".*)/i;
            href_url  = link.replace(href_pattern, '$1' + `${url}/` + '$2$3');
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
        if(/(?:https?|cdn)/i.test(link)){
            href_url = link;
        } else {
            const href_pattern = /(.*?src=")\/?(.*?)(".*)/i;
            href_url  = link.replace(href_pattern, '$1' + `${url}/` + '$2$3');
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
