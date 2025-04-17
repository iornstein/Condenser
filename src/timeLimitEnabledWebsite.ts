import {pickOneFrom, storeTimeToBlockAgain} from "./helpers";
import {retrieveWebsite} from "./storage";
import {unblockWebsite} from "./block";
import {sendMessageToReBlockAfterMinutes} from "./message";

const urlSearchParams = new URLSearchParams(window.location.search);
const websiteKey: string = urlSearchParams.get("website");
const targetUrl: string = urlSearchParams.get("targetUrl");
const websitePromise = retrieveWebsite(websiteKey);

const endLoadingIndicator = () => {
    document.querySelector<HTMLElement>(".primary-button").innerText = "Yes";
};

const displayLoadingIndicator = () => {
    document.querySelector<HTMLElement>(".primary-button").innerText = "Loading ...";
};

document.querySelector<HTMLSpanElement>("span#website-name").innerText = websiteKey;

const encouragement = () => {
    return pickOneFrom([
        "Come on, you don't really have to!",
        "Perhaps you would like to visit something else first? You know, just reflect on that.",
        "Okay, I get it. But I want you to take 5 deep breaths before you proceed.",
        "Have you tried doing a daily puzzle like wordle first?",
        "I'm not going to say much. This is going to just be a long text string that might implicitly get you to reflect on whether you really want to go to that website or not. You may feel free to read this entire thing, but just know it's going to keep going on and on. The main effect is the visual change in case you have gotten used to some of the shorter words of encouragement. Of course it's possible that this message just appears more often than the others. It's a total possible outcome. Probablistically it will happen at some point if you use this a lot. And if you keep seeing this message it means the guard really isn't working all that well. Perhaps you have a legitimate use for using these banned websites. Perhaps you're accessing one of them to double check of probablistically is a word. If that's the case, I can stop you right there. It's not a word. But it kind of sounds like it could be a word. Some things are like that. But I guess if it REALLY sounds like a word, then that makes it a word. Language is defined by what words people USE, so if something sounds like a word, that makes it a word. Another reason it sounds like a word is because actually I lied and it is a word. But it was misspelled. The proper spelling is probabilistically. P, r, o, b, a, b, i, l, i, s, t, i, c, a, l, l, y. Don't double check it. Or I guess you could double check it. It's your time, not mine. I'm only writing this. Of course I may also be reading this, since I built this plugin for me originally. Hm. How interesting. Well, you've been reading this whole thing instead of going to the website. Do you still really need to go there?",
        "Say what your reason is aloud.",
        "Have you tried doing 5 jumping jacks?",
        "Have you tried drinking more water?"
    ]);
}

document.querySelector<HTMLParagraphElement>("p#encouragement").innerText = encouragement();

const websiteLink = (): HTMLAnchorElement =>
    document.querySelector<HTMLAnchorElement>("a#website-link");

const websiteDurationInput = (): HTMLInputElement =>
    document.querySelector("input#link-duration");

const displayLinkToWebsite = async () => {
    endLoadingIndicator();
    document.querySelector<HTMLFormElement>("form").style.display = "none";
    const linkToWebsite = websiteLink();
    linkToWebsite.style.display = "block";
    linkToWebsite.innerText = "Enjoy your website: " + targetUrl;
    linkToWebsite.href = targetUrl;
};

document.querySelector("form").addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    displayLoadingIndicator();
    const minutesToUnblockWebsiteFor = parseInt(websiteDurationInput().value);
    return websitePromise.then(unblockWebsite)
        .then(sendMessageToReBlockAfterMinutes(minutesToUnblockWebsiteFor))
        .then(storeTimeToBlockAgain(minutesToUnblockWebsiteFor))
        .then(displayLinkToWebsite);
});