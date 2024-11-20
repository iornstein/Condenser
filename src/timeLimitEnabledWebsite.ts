import {storeTimeToBlockAgain} from "./helpers";
import {retrieveDesiredUrl, retrieveWebsite} from "./storage";
import {unblockWebsite} from "./block";

const websiteKey: string = new URLSearchParams(window.location.search).get("website");
const websitePromise = retrieveWebsite(websiteKey);

document.querySelector<HTMLSpanElement>("span#website-name").innerText = websiteKey;

const websiteLink = () :HTMLAnchorElement =>
    document.querySelector<HTMLAnchorElement>("a#website-link");

const websiteDurationInput = (): HTMLInputElement =>
    document.querySelector("input#link-duration");

const displayLinkToWebsite = async () => {
    return retrieveDesiredUrl().then(url => {
        const linkToWebsite = websiteLink();
        linkToWebsite.style.display = "block";
        linkToWebsite.innerText = "Enjoy your website: " + url;
        linkToWebsite.href = url;
    });
};

document.querySelector("form").addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const minutesToUnblockWebsiteFor = parseInt(websiteDurationInput().value);
    return websitePromise.then(unblockWebsite).then(storeTimeToBlockAgain(minutesToUnblockWebsiteFor))
        .then(displayLinkToWebsite);
});