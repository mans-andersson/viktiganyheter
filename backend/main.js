const fs = require('fs');
const scraper = require('./news_scraper');
const analyzer = require('./news_analyzer');

async function run() {
    const newsFeed = await scraper.getNewsFeed();
    for (newsItem of newsFeed) {
        const aiAnalysis = await analyzer.getArticleAnalysis(newsItem.article);
        console.log(newsItem);
        console.log(aiAnalysis);
        Object.assign(newsItem, aiAnalysis);
    }
    const jsonContent = JSON.stringify(newsFeed, null, 2);

    return new Promise((resolve, reject) => {
        fs.writeFile('/tmp/news.json', jsonContent, 'utf8', (err) => {
            if (err) {
                console.log('An error occurred while writing the JSON object to the file:', err);
                reject(err);
            } else {
                console.log('JSON file has been saved.');
                resolve();
            }
        });
    });
}

module.exports = { run };

// If this file is run directly (not imported), execute the function
if (require.main === module) {
    run().catch(err => {
        console.error('Error running main script:', err);
        process.exit(1);
    });
}
