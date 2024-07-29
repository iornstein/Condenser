import {retrieveData} from "./helpers.js";

const setWebsite = (websiteName, websiteLink) => {
    document.getElementById("website-name").innerText = websiteName;
    document.getElementById("website-link").href = websiteLink;
    document.getElementById("website-link").style.display = "block";
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