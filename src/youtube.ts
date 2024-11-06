import {retrieveData, triggerYoutubeToBeEnabled, watchForYoutubeBeingEnabled} from "./helpers";


const youtubeLink = () :HTMLAnchorElement =>
    document.querySelector<HTMLAnchorElement>("a#youtube-link");

const youtubeDurationInput = (): HTMLInputElement =>
    document.querySelector("input#youtube-duration");

const millisecondsPerMinute = 1000*60;

retrieveData("desiredUrl", (url) => {
        youtubeLink().href = url;
    }
);

watchForYoutubeBeingEnabled(() => {
    youtubeLink().style.display = "block";
    retrieveData("desiredUrl", (url) => {
            youtubeLink().innerText = "Enjoy your video: " + url;
        }
    );
});

document.querySelector("form").addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();
    const minutes = parseInt(youtubeDurationInput().value);
    triggerYoutubeToBeEnabled(minutes*millisecondsPerMinute)
});