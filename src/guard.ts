import {retrieveDesiredUrl} from "./storage";

type GuardedWebsite = "facebook" | "UNKNOWN WEBSITE!!";

const setWebsite = (website: GuardedWebsite, websiteLink: string) => {
    document.getElementById("website-name").innerText = website;
    const websiteAnchorTag = document.querySelector<HTMLAnchorElement>("a#website-link");
    websiteAnchorTag.href = websiteLink;
    websiteAnchorTag.style.display = "block";
};

retrieveDesiredUrl().then( (url: string) => {
    if (url.includes("facebook.com")) {
        setWebsite("facebook", "https://www.facebook.com?");
    }
    else {
        setWebsite("UNKNOWN WEBSITE!!", "")
    }
});