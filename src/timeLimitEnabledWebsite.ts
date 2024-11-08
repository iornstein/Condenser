import {retrieveDesiredUrl, triggerEnabled} from "./helpers";
import {LocalHtmlPage, Website, websiteFor} from "./website";

const currentUrl = window.location.href;
const htmlPage = currentUrl.substring(currentUrl.lastIndexOf('/') + 1) as LocalHtmlPage;
const website: Website = websiteFor(htmlPage);

document.querySelector<HTMLSpanElement>("span#website-name").innerText = website;

const websiteLink = () :HTMLAnchorElement =>
    document.querySelector<HTMLAnchorElement>("a#website-link");

const millisecondsPerMinute = 1000*60;
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
    const minutes = parseInt(websiteDurationInput().value);
    return triggerEnabled(website, minutes*millisecondsPerMinute).then(() => displayLinkToWebsite());
});