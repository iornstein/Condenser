import {HtmlPage, retrieveData, triggerEnabled, watchForWebsiteBeingEnabled, Website, websiteFor} from "./helpers";

const currentUrl = window.location.href;
const htmlPage = currentUrl.substring(currentUrl.lastIndexOf('/') + 1) as HtmlPage;
const website: Website = websiteFor(htmlPage);

document.querySelector<HTMLSpanElement>("span#website-name").innerText = website;

const websiteLink = () :HTMLAnchorElement =>
    document.querySelector<HTMLAnchorElement>("a#website-link");

retrieveData("desiredUrl", (url) => {
        websiteLink().href = url;
    }
);

watchForWebsiteBeingEnabled(website, () => {
    websiteLink().style.display = "block";
    retrieveData("desiredUrl", (url) => {
            websiteLink().innerText = "Enjoy your video: " + url;
        }
    );
});

const millisecondsPerMinute = 1000*60;
const websiteDurationInput = (): HTMLInputElement =>
    document.querySelector("input#link-duration");
document.querySelector("form").addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();
    const minutes = parseInt(websiteDurationInput().value);
    triggerEnabled(website, minutes*millisecondsPerMinute);
});