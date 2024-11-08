
export type Website = "YouTube";
export type LocalHtmlPage = "youtube.html";

export const websiteFor = (htmlPage: LocalHtmlPage): Website => {
    return "YouTube"
};

export const urlToBlock = (website: Website): string => {
    return "www.youtube.com";
}

export const rulesetIdFor = (website: Website) => {
    return "youtubeReroute"
};