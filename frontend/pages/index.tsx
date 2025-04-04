import { Key, useState, useEffect } from 'react';
import newsData from '../news.json';

let minScoreToLoad = 6.5;

export default function Home() {
  const [scoreToLoad, setScoreToLoad] = useState(minScoreToLoad);
  const lowestScore = Math.min(...[...groupNews(newsData)].map(([score, _]) => score));

  const loadMore = () => {
    setScoreToLoad(scoreToLoad - 1);
  };

  return (
    <div className="container mx-auto px-2 max-w-screen-md">
      <header className="p-5 rounded bg-gradient-to-r from-yellow-500 via-blue-500 to-pink-500 my-1">
        <h1 className="text-white text-center text-2xl font-bold font-mono">Viktiga Nyheter</h1>
      </header>
      <main className="">
        <section className="introduction p-7">
          {/* <h2 className="text-center text-xl text-gray-900 font-bold mb-4">12 Maj 2023</h2> */}
          <p className="text-gray-800 px-2">
            ChatGPT skannar nyhetsflödet och bedömmer varje nyhets signifikans på en skala från 1-10.
            Du får ett lugn, slipper bruset och nås endast av det som är viktigt.
            Som standard visas endast de nyheter som har en signifikans över 6.5, men du kan ladda in fler nyheter om du vill.
          </p>
        </section>
        <section className="news-items grid grid-cols-1 gap-1">
          <div>
            {[...groupNews(newsData)].map(([score, newsGroup]) => {
              return (
                <div key={score} className={score >= scoreToLoad ? "" : "hidden"}>
                  <div className='w-full border-t border-gray-300 my-3 relative'>
                    <span className='bg-white px-2 text-gray-500 text-xs absolute' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      {score ? score.toFixed(1) : ''}
                    </span>
                  </div>

                  {newsGroup.map((news: any, index: number) => (
                    <a key={index} href={news.link} target='_blank' className='text-gray-800 hover:text-gray-600'>
                      <article className='p-2 hover:bg-white'>
                        <h2 className='text-base'>{news.simpleTitle}</h2>
                      </article>
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
        <div className="flex justify-center">
          {scoreToLoad > lowestScore && (
            <button id="loadMoreBtn" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5" onClick={loadMore}>
              Ladda fler
            </button>
          )}
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-5 mt-8 rounded">
        <p className="text-center">Skapad av <a href="https://mansandersson.io" target="_blank">Måns Andersson</a></p>
      </footer>
    </div>
  )
};

const groupNews = (newsData: any[]) => {
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
