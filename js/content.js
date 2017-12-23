//(C)2017 genBTC
document.addEventListener("DOMContentLoaded", function () {
    
});

const ytplayer = window.document.getElementsByClassName("video-stream")[0];
function getYoutubeDurationTime() {
    //  const ytplayer = window.document.getElementById("movie_player");
    return Math.round(ytplayer.duration);
}

function getYoutubeCurrentTime() {
    //const ytplayer = window.document.getElementById("movie_player");
    return Math.round(ytplayer.currentTime);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        if (request.grab == "start")
            sendResponse({start : getYoutubeCurrentTime() });
        if (request.grab == "end")
            sendResponse({end : getYoutubeDurationTime() });
    }
);