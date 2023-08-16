const fs = require('fs');
const scraper = require('./news_scraper');
const analyzer = require('./news_analyzer');

(async () => {
    const newsFeed = await scraper.getNewsFeed();
    for (newsItem of newsFeed) {
        const aiAnalysis = await analyzer.getArticleAnalysis(newsItem.article);
        console.log(newsItem);
        console.log(aiAnalysis);
        Object.assign(newsItem, aiAnalysis);
    }
    const jsonContent = JSON.stringify(newsFeed, null, 2);
    fs.writeFile('news.json', jsonContent, 'utf8', (err) => {
        if (err) {
          console.log('An error occurred while writing the JSON object to the file:', err);
        } else {
          console.log('JSON file has been saved.');
        }
      });
})();