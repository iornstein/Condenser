import {storeTimeToBlockAgain} from "./helpers";
import {Website} from "./website";
import {retrieveDesiredUrl} from "./storage";
import {unblockWebsite} from "./block";

const website: Website = new URLSearchParams(window.location.search).get("website") as Website;

document.querySelector<HTMLSpanElement>("span#website-name").innerText = website;

const websiteLink = () :HTMLAnchorElement =>
    document.querySelector<HTMLAnchorElement>("a#website-link");

const websiteDurationInput = (): HTMLInputElement =>
    document.querySelector("input#link-duration");

const displayLinkToWebsite = async () => {
    return retrieveDesiredUrl().then(url => {
        const linkToWebsite = websiteLink();
        linkToWebsite.style.display = "block";
        linkToWebsite.innerText = "Enjoy your video: " + url;
        linkToWebsite.href = url;
    });
};

document.querySelector("form").addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const minutesToUnblockWebsiteFor = parseInt(websiteDurationInput().value);
    return unblockWebsite(website).then(storeTimeToBlockAgain(minutesToUnblockWebsiteFor))
        .then(displayLinkToWebsite);
});