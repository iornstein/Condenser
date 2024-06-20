import {retrieveData, triggerYoutubeToBeEnabled, watchForYoutubeBeingEnabled} from "./helpers.js";

retrieveData("desiredUrl", (url) => {
        document.getElementById("youtube-link").href = url;
    }
);


watchForYoutubeBeingEnabled(() => {
    document.getElementById("youtube-link").style.display = "block";
    retrieveData("desiredUrl", (url) => {
            document.getElementById("youtube-link").innerText = "Enjoy your video: " + url;
        }
    );
});


document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formValues = Object.fromEntries(new FormData(event.target));
    const millisecondsPerMinute = 1000*60;
    const minutes = parseInt(formValues["duration"]);
    triggerYoutubeToBeEnabled(minutes*millisecondsPerMinute)

});