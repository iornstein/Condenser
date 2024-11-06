import {retrieveData} from "./helpers";

type GuardedWebsite = "reddit" | "facebook" | "UNKNOWN WEBSITE!!";

const setWebsite = (website: GuardedWebsite, websiteLink: string) => {
    document.getElementById("website-name").innerText = website;
    const websiteAnchorTag = document.querySelector<HTMLAnchorElement>("a#website-link");
    websiteAnchorTag.href = websiteLink;
    websiteAnchorTag.style.display = "block";
};

retrieveData("desiredUrl", (url) => {
        if (url.includes("reddit.com")) {
            setWebsite("reddit", "https://www.reddit.com?");
        } else if (url.includes("facebook.com")) {
            setWebsite("facebook", "https://www.facebook.com?");
        }
        else {
            setWebsite("UNKNOWN WEBSITE!!", "")
        }
    }
);