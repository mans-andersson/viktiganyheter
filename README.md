# Viktiganyheter

Website that uses OpenAI API to rate the significance of news articles on a scale of 1-10.
News items are presented in order of significance, with links to the original article.

## Link
[viktiganyheter.måns.dev](https://viktiganyheter.måns.dev)

## Backend
Run `node backend/main.js` to generate the ratings.
This will scrape articles from the last 24 hours and analyze them with the OpenAI API.
You need to provide your own OpenAI API key, it should be in an environment variable called `OPENAI_API_KEY`.
The script will save the results in a file called `news.json`. The frontend depends on this file.

## Frontend
Make sure you have a `news.json` file in the frontend directory created with the previous step.
`npm run dev` for live reload dev setup
`npm run build` for production build

![Screenshot of the website](screenshot.jpg)

