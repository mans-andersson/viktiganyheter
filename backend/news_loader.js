let minScoreToLoad = 6.5;
let maxScoreToLoad = 10.1;
const newsStats = {};

fetch('/news.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        return main(data);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });

const createGroupedNews = (newsData) => {
    // Sort the newsData based on the average score (descending order)
    newsData.sort((a, b) => b.average - a.average);

    // Create a Map to store grouped articles by their average score
    const groupedNews = new Map();

    // Group articles by their average score
    newsData.forEach((news) => {
        if (!groupedNews.has(news.average)) {
            groupedNews.set(news.average, []);
        }
        groupedNews.get(news.average).push(news);
    });
    return groupedNews;
};

const loadNews = (groupedNews, minScoreToLoad, maxScoreToLoad) => {
    const newsItemsContainer = document.querySelector('.news-items');

    // Create and append elements based on the sorted and grouped data
    groupedNews.forEach((group, score) => {
        if (score < minScoreToLoad || score >= maxScoreToLoad) { return; }
        // Create a horizontal line with the score
        const scoreLine = document.createElement('div');
        scoreLine.className = 'w-full border-t border-gray-300 my-3 relative';

        const scoreText = document.createElement('span');
        scoreText.className = 'bg-white px-2 text-gray-500 text-xs absolute';
        scoreText.style.top = '50%';
        scoreText.style.left = '50%';
        scoreText.style.transform = 'translate(-50%, -50%)';
        scoreText.textContent = score.toFixed(1);
        scoreLine.appendChild(scoreText);


        // Append the score line to the container
        newsItemsContainer.appendChild(scoreLine);

        // Create and append article elements for the group
        group.forEach((news) => {
            const link = document.createElement('a');
            link.href = news.link;
            link.target = '_blank';
            link.className = 'text-gray-800 hover:text-gray-600';

            const article = document.createElement('article');
            article.className = 'p-2 hover:bg-white';

            const title = document.createElement('h2');
            title.className = 'text-base';
            title.textContent = news.title;

            article.appendChild(title);
            link.appendChild(article);
            newsItemsContainer.appendChild(link);
        });
    });
};

const loadMore = (groupedNews) => {
    maxScoreToLoad = minScoreToLoad;
    minScoreToLoad = minScoreToLoad - 1;
    loadNews(groupedNews, minScoreToLoad, maxScoreToLoad);
}

const loadNewsStatistics = (groupedNews) => {
    const scores = Array.from(groupedNews.keys());
    const lowestScore = Math.min(...scores);
    const highestScore = Math.max(...scores);
    newsStats['lowestScore'] = lowestScore;
    newsStats['highestScore'] = highestScore;
}

const main = (data) => {
    const groupedNews = createGroupedNews(data);
    loadNews(groupedNews, minScoreToLoad, maxScoreToLoad);
    loadNewsStatistics(groupedNews);
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', function () {
        loadMore();
        if (minScoreToLoad < newsStats.lowestScore) {
            loadMoreBtn.style.display = 'none';
        }
    });
}