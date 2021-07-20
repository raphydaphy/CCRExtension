"use strict";

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({})
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

var audio = null;
var isPlaying = false;
var tryingToPlay = false;
var volume = 50;

function setVolume(vol) {
  volume = vol;
  if (audio) {
    audio.volume = vol / 100.0;
  }
}

chrome.runtime.onMessage.addListener((message, sender, callback) => {
  if (message.action === "play") {
    console.info("Play requested", isPlaying);
    if (isPlaying || tryingToPlay) {
      console.info("Already playing!");
      callback(true);
      return false;
    }

    tryingToPlay = true;
    audio = new Audio("https://s4.radio.co/scf2280c01/listen");

    audio.play().then(() => {
      console.info("Playing!");
      setVolume(volume);
      isPlaying = true;
      tryingToPlay = false;
      callback(true);
    }).catch((err) => {
      tryingToPlay = false;
      // This usually happens because the user paused the stream before it started playing
      callback(false);
    });
    return true;
  } else if (message.action === "pause") {
    console.info("pause");
    tryingToPlay = false;
    isPlaying = false;

    if (audio) {
      audio.pause();
    }
  } else if (message.action === "status") {
    callback({
      status: isPlaying ? "playing" : "paused",
      volume: volume
    });
  } else if (message.action === "volume") {
    console.info("Volume: ", message);
    setVolume(message.volume);
  }
});