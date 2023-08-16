const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');

const newsFeedUrl = 'https://rss.aftonbladet.se/rss2/medium/pages/sections/senastenytt/';
const smallNewsFeedUrl = 'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/';

function getAftonbladetLatestNews(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            })

            res.on('end', () => {
                resolve(data);
            });

        }).on('error', (err) => {
            console.error('Error:', err.message);
        })
    })
}

function getAftonbladetArticle(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                let articleText = '';
                const $ = cheerio.load(data);
                $('p.borderColor, p.hyperion-css-n38mho, h1').each((_, el) => {
                    articleText = articleText + $(el).text() + '\n';
                });
                articleText = articleText + 'Artikel hämtad från aftonbladet.se';
                resolve(articleText);
            });

        }).on('error', (err) => {
            console.error('Error:', err.message);
            reject(err);
        });
    });
}

const formatAftonbladetLatestNews = (async (latestNewsXML) => {
    const newsObject = await xml2js.parseStringPromise(latestNewsXML);
    const newsItems = newsObject.rss.channel[0].item;
    const formattedItems = newsItems.map(item => ({
        title: item.title[0],
        link: item.link[0],
        pubDate: item.pubDate[0],
    }));
    return formattedItems;
});

const addArticleTextToNewsItems = (async (newsItems) => {
    for (const item of newsItems) {
        const articleText = await getAftonbladetArticle(item.link);
        item['article'] = articleText;
    }
    return newsItems;
});

const isLessThan24Hours = (date1, date2) => {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return diff < 24 * 60 * 60 * 1000;
}

const getNewsFeed = (async () => {
    const latestNewsXML = await getAftonbladetLatestNews(newsFeedUrl);
    let formattedNews = await formatAftonbladetLatestNews(latestNewsXML);
    formattedNews = formattedNews.filter(item => isLessThan24Hours(new Date(item.pubDate), new Date()));
    formattedNews = formattedNews.filter(item => !item.link.includes('tv.aftonbladet.se'));
    await addArticleTextToNewsItems(formattedNews);
    return formattedNews;
});

module.exports = {
    getNewsFeed,
}