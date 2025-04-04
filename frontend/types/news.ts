export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  article: string;
  average: number;
  eventMagnitude: number;
  scale: number;
  potentialImpact: number;
  simpleTitle: string;
}

export interface NewsGroup {
  [score: number]: NewsItem[];
} 