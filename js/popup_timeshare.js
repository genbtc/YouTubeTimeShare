/*
Package:    YoutubeTimeShare v1.0
Script:		Popup_Timeshare.js
Author:		RJM
Created:	10/26/16
Purpose:	Generate a YouTube URL with start/stop time appended

New Changes: (genBTC)
Modified:   8/19/17 unofficially forked by genBTC (genbtc@gmx.com) - to fix it. URL was wrong.
                    fix permissions to not be overly broad and only use youtube.com/youtu.be
                WIP: TODO: Add start & end time grab  buttons to grab current/duration time and insert it.

Old Enhancements: (RJM)
Modified:	10/27/16
			1. Add icons, add custom alerts in Div (since they appear off-screen)
			2. Add custom alert popup to prevent off-screen alerts
*/

function isYoutubeURL(url) {
    var result = true;
    if (url.indexOf("youtube") < 0 && url.indexOf("youtu.be") < 0) {
        alert("Current tab does not contain a YouTube URL!");
        result = false;
        console.log("ERROR");
    }
    return result;
}

chrome.tabs.executeScript(null, { file: "js/content.js" });

//Run all JavaScript inside ready function
$(document).ready(function () {

	$("#Btn1").click(function (){
		ConcatURL();
		return false; // prevent refresh of popup
	});


    //Grab Start Time (messages sent to content.js script to be handled)
    $("#BtnGrabStart").click(function() {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
          if (!tabs[0]) return;
          var url = tabs[0].url;
          if (!isYoutubeURL(url)) return true;
            console.log(url);
            chrome.runtime.sendMessage({ grab: "start" }, function (response) {
                console.log(response);
            document.getElementById("StartTime").value = response.start;
          });
        });
        return false; // prevent refresh of popup
	});
  
    //Grab End Time (handled by content.js)
    $("#BtnGrabEnd").click(function() {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
          if (!tabs[0]) return;
          var url = tabs[0].url;
          if (!isYoutubeURL(url)) return true;
            console.log(url);
            chrome.runtime.sendMessage({ grab: "end" }, function (response) {
                console.log(response);
              document.getElementById("EndTime").value = response.end;
          });
        });
        return false; // prevent refresh of popup
    });

    // ConcatURL: Get current video URL from address bar. Handled here. Everything else runs in .query callback tho
    function ConcatURL() {		
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          if (!tabs[0]) return;
          var url = tabs[0].url;
        if (!isYoutubeURL(url)) return true;

        // Pull videoID from the URL
        var videoID = url.substr(url.indexOf("=") + 1, url.length - url.indexOf("="))

        // Determine whether start and/or stop were entered
        //WRONG Start and stop example: https://www.youtube.com/v/7LxVEufTdPM?start=18&end=25
        // NEW:                     https://www.youtube.com/embed/T4Au4jXdQDw?start=90&end=150
        // Start only: https://youtu.be/3ZWA_cw9tss?t=11s

        var sHours = "";
        var sMinutes = "";
        var sSeconds = "";
        var eHours = "";
        var eMinutes = "";
        var eSeconds = "";

        // Validate startTime -- code @ http://tinyurl.com/h8kz9lu
        var StartTime = document.getElementById("StartTime").value
        // No colons, or more than 2 colons (HH:MM:SS)
        if(StartTime == "" || StartTime.replace(/[^:]/g, "").length > 2)
        {
            alert("Invalid Time format");
            return false;
        //StartTime grabbed from YT Player current time, in form of seconds        
        } else if (StartTime.indexOf(":") < 0) {
                sHours = 0;
                sMinutes = 0;
                sSeconds = StartTime
        }
        else
        {			
            if (StartTime.replace(/[^:]/g, "").length == 1)
            {
                sMinutes = StartTime.split(":")[0];
                sSeconds = StartTime.split(":")[1];
            }
            else
            {
                sHours = StartTime.split(":")[0];
                sMinutes = StartTime.split(":")[1];
                sSeconds = StartTime.split(":")[2];
            }
        }

        var EndTime = document.getElementById("EndTime").value
        if(EndTime == "" || EndTime.replace(/[^:]/g, "").length > 2)
        {
            alert("Invalid Time format");
            return false;
        //StartTime grabbed from YT Player current time, in form of seconds        
        } else if (EndTime.indexOf(":") < 0) {
                eHours = 0;
                eMinutes = 0;
                eSeconds = EndTime
        }
        else
        {
            if (EndTime.replace(/[^:]/g, "").length == 1)
            {
                eMinutes = EndTime.split(":")[0];
                eSeconds = EndTime.split(":")[1];
            }
            else
            {
                eHours = EndTime.split(":")[0];
                eMinutes = EndTime.split(":")[1];
                eSeconds = EndTime.split(":")[2];
            }
        }

        // Convert to seconds.  Prefixing with "+" implicit conversion to INT (unary operator)
        var StartTimeSecs = (+sHours * 3600) + (+sMinutes * 60) + +sSeconds;
        var EndTimeSecs = (+eHours * 3600) + (+eMinutes * 60) + +eSeconds;

        if(isNaN(EndTimeSecs))
            {EndTimeSecs = "";}

        if(isNaN(StartTimeSecs))
            {StartTimeSecs = "";}

        var YtUrlFinal = "";
    //Example: https://www.youtube.com/embed/T4Au4jXdQDw?start=90&end=150
        //Updated 8/19/2017 genBTC

        // Start time, no stop time
        if (StartTimeSecs != "" && EndTimeSecs == "")
        {YtUrlFinal = "https://youtu.be/"+videoID+"?t="+StartTimeSecs+"s";}

        // Stop time, no start time
        if (StartTimeSecs == "" && EndTimeSecs != "")
        {YtUrlFinal = "https://www.youtube.com/embed/"+videoID+"?end="+EndTimeSecs;}

        // Start AND stop time
        if (StartTimeSecs != "" && EndTimeSecs != "")
        {YtUrlFinal = "https://www.youtube.com/embed/"+videoID+"?start="+StartTimeSecs+"&end="+EndTimeSecs;}

        // No Start AND no Stop
        if (StartTimeSecs == "" && EndTimeSecs == "")
        {alert("Please enter a Start and/or End time.");}

        // Copy to clipboard
        function copyToClipboard(text) { // From https://gist.github.com/joeperrin-gists/8814825
              const input = document.createElement("input");
              input.style.position = "fixed";
              input.style.opacity = 0;
              input.value = text;
              document.body.appendChild(input);
              input.select();
              document.execCommand("Copy");
              document.body.removeChild(input);
            };

        // Set p4 in the popup
        document.getElementById("p4").textContent = YtUrlFinal;	
        copyToClipboard(YtUrlFinal);
      });
    }; // End ConcatURL()
});//end document ready

