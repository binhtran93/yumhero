export interface ScrapingResult {
    text: string;
    jsonLds: string[];
    mainImage: string | null;
}

export interface ScrapingStrategy {
    supports(url: URL): boolean;
    scrape(url: string): Promise<ScrapingResult>;
}
