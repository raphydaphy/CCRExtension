var playing = false;
var currentlyPlaying = null;

function setCurrentlyPlaying(playing) {
  currentlyPlaying = playing;

  if (!currentlyPlaying) return;
  console.info("Got song info: ", currentlyPlaying);

  let title = currentlyPlaying.title.split(" - ");
  if (title.length < 2) return;

  let artist = title[0];
  let songName = title[1];

  let albumCover = currentlyPlaying["artwork_urls"]["large"];

  $("#currentAlbumCoverImage").attr("src", albumCover).attr("alt", title);

  $("#currentSong").text(songName);
  $("#currentArtist").text(artist);

  $("#currentInfo").show();

}

function updateCurrentlyPlaying() {
  $.ajax({
    dataType: "json",
    url: "https://public.radio.co/api/v2/scf2280c01/track/current"
  }).done((res) => {
    setCurrentlyPlaying(res.data);
  }).fail((err) => {
    console.error("Ajax error: ", err);
  });

  setTimeout(updateCurrentlyPlaying, 10000);
}

function play(alreadyPlaying = false) {
  playing = true;

  $("#play-btn").hide();

  if (!alreadyPlaying) {
    $("#pause-btn").hide();
    $("#loading-spinner").show();
    chrome.runtime.sendMessage({action: "play"}, (response) => {
      if (playing) {
        $("#play-btn").hide();
        $("#loading-spinner").hide();
        $("#pause-btn").show();
      }
    });
  } else {
    $("#pause-btn").show();
    $("#loading-spinner").hide();
  }
}

function pause(alreadyPaused = false) {
  playing = false;
  $("#pause-btn").hide();
  $("#loading-spinner").hide();
  $("#play-btn").show();

  if (!alreadyPaused) {
    chrome.runtime.sendMessage({action: "pause"});
  }
}

window.addEventListener("load", () => {
  console.info("Loaded");



  chrome.runtime.sendMessage({action: "status"}, (response) => {
    console.info(response);

    let status = response.status;

    if (status === "playing") {
      console.info("Resuming playing");
      play(true);
    } else {
      play();
    }

    console.info("Vol: ", response.volume);
    $("#volumeSlider").val(response.volume);
    $('input[type="range"]').rangeslider({
      polyfill : false,
      onSlide : function( position, value ) {
        chrome.runtime.sendMessage({action: "volume", volume: value});
      }
    });

  });

  updateCurrentlyPlaying();
});

$("#play-btn").on("click", () => play());
$("#loading-spinner").on("click", () => pause());
$("#pause-btn").on("click", () => pause());