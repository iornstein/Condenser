
export type Website = "YouTube";

//websiteUrl should be of form www.youtube.com, like no https? maybe check that later
export const urlToBlock = (website: Website): string => {
    return "www.youtube.com";
};

//TODO: make it work for more than just id 1. This fails if we have multiple dynamic
export const ruleIdFor = (website: Website): number => {
    return 1;
};