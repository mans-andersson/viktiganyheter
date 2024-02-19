const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const analyzerAiPrompt = `You are an AGI model who will help to distinguish important news from noise.
You will receive a news article and your goal is to evaluate it based on the following criteria: event magnitude, scale, and potential impact.
For each criteria you should give a 1-10 rating.
Be strict with the ratings.
The news will be Swedish news in Swedish.
The response should have the following format, and include nothing else:
Event magnitude: <score>
Scale: <score>
Potential impact: <score>
Title: <A concise, clear, non-clickbait title describing the news article in Swedish`;

const analyzerAiPrompt2 = `Du är en mycket intelligent, kritiskt tänkande AI assistent. Ditt mål är att hjälpa till att filtrera ut signifikanta nyheter från brus.
Du kommer att få läsa en nyhetsartikel, sedan ska du bedömma nyhetens signifikans på en skala 1-10. 1 är till exempel poänglöst skvaller, 10 är en nyhet som kraftigt skakar om hela världen.
Efter du har läst nyheten, svara med följande format, svaret ska inte innehålla något annat:
Signifikans: <poäng från 1-10>`

const testArticle = `Rasmus Paludan anhållen i sin utevaro – grips vid inresa
Rasmus Paludan kommer att gripas om han sätter sin fot i Sverige.
Den högerextreme politikern är anhållen i sin utevaro misstänkt för flera brott, enligt uppgifter till Aftonbladet.
– Anklagelserna är skrattretande, säger Rasmus Paludan själv.
Rasmus Paludan utreds sedan ett par månader sedan för hets mot folkgrupp, förolämpning och grov förgripelse mot tjänsteman.
Han har kallats till förhör, men inte velat komma till Sverige.
Åklagaren Adrien Combier-Hogg har öppnat upp för möjligheten att låta höra Paludan i Danmark med hjälp av dansk polis.
Enligt uppgifter till Aftonbladet är Rasmus Paludan nu också anhållen i sin utevaro, vilket skulle innebära att han skulle gripas direkt om han skulle bli föremål för en inresekontroll till Sverige från Danmark, där han nu befinner sig.
Detsamma gäller om han skulle synas offentligt någon annanstans i Sverige, enligt Aftonbladets uppgiftslämnare.
Beslutet är fattat av åklagare och rubriceringen kring brottsmisstankarna rör hets mot folkgrupp.
Rasmus Paludan själv tycker både beslutet att anhålla honom är idiotiskt. Samma omdöme ger han misstankarna och utredningen mot honom.
– Svensk polis i allmänhet och Malmöpolisen i synnerhet vill inte skydda mig, så det är farligt för mig att komma till Sverige. Malmöpolisen är en islamiserad soptipp, säger Rasmus Paludan.
Han uppger att han inte har några planer på att komma till Sverige, och inte hade det heller efter ett framträdande under valrörelsen i september 2022.
– Jag hade inga planer på att komma under 2023 heller. Men eftersom vissa personer, däribland Chang Frick, bjöd in mig att komma i januari gjorde jag ett undantag, säger Rasmus Paludan.
Däremot uppger Paludan att han är villig att låta sig förhöras via videolänk med hjälp av dansk polis

Fotnot: Aftonbladet har varit i kontakt med polisens och åklagarmyndighetens presstjänst som inte kunnat bekräfta att Paludan är anhållen i sin utevaro. Kammaråklagare Adrien Combier-Hogg, som leder utredningen, har inte gått att nå.
Artikel hämtad från aftonbladet.se`;

const analyzeArticle = async (articleText) => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: "system", content: analyzerAiPrompt},
      {
        role: "user", content: articleText}]
    });
    return completion.data.choices[0];
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
    throw error;
  }
};

const retryAnalyzeArticle = async (articleText, maxRetries = 20, retryInterval = 5 * 60 * 1000) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const result = await analyzeArticle(articleText);
      return result;
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts} failed. Waiting ${retryInterval} ms before retrying...`);
      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } else {
        console.log(`Failed to analyze article after ${maxRetries} attempts.`);
        throw error;
      }
    }
  }
};

const processResponse = (response) => {
  const messageContent = response.message.content + '\n';
  console.log(messageContent);

  let regex = /:\s*(.*?)\n/g;
  let match;
  let results = [];
  while ((match = regex.exec(messageContent)) !== null) {
      results.push(match[1]);
  }
  console.log(results)
  const average = (parseInt(results[0]) + parseInt(results[1]) + parseInt(results[2])) / 3;
  return {
    average: average,
    eventMagnitude: parseInt(results[0]),
    scale: parseInt(results[1]),
    potentialImpact: parseInt(results[2]),
    simpleTitle: results[3],
  }
}

const getArticleAnalysis = (async (articleText) => {
  const response = await retryAnalyzeArticle(articleText);
  const analysis = processResponse(response);
  return analysis;
});

const test = (async () => {
  const response = await analyzeArticle(testArticle);
  const processedResponse = processResponse(response);
  console.log(processedResponse);
});


module.exports = {
  getArticleAnalysis,
}