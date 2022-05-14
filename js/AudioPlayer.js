var AudioPlayer = document.createElement("audio");
var NavBarMeter = document.getElementById("NavRangeMeter");
AudioPlayer.ontimeupdate = function() {
    var curProgresPct = ((AudioPlayer.currentTime / AudioPlayer.duration) * 100);
    var curProgresPctStr = ((AudioPlayer.currentTime / AudioPlayer.duration) * 100).toString() + "%";
    NavBarMeter.style.width = curProgresPctStr;
    if (fv) {
        FullTime.innerHTML = fancyTimeFormat(Math.round(AudioPlayer.currentTime));
        
        if (notDragging) { FullRange.value = AudioPlayer.currentTime };
        FullRangeMeter.style.width = ((AudioPlayer.currentTime / AudioPlayer.duration) * 100).toString() + "%";
    }
}
AudioPlayer.ondurationchange = function() {
       FullTimeT.innerHTML = fancyTimeFormat(Math.round(AudioPlayer.duration));
       FullRange.max = AudioPlayer.duration;
}
AudioPlayer.onplaying = function() {
    let bp = document.getElementById("BarPlay");
    let fp = document.getElementById("FullPlay");
    
    fp.innerHTML = "pause";
    bp.innerHTML = "pause";
}
AudioPlayer.onended = function() {
    if (Preferences.RepeatOnce) {
        AudioPlayer.currentTime = 0;
        AudioPlayer.play();
    }
    else {
        QueueManager.nextSong();
    }
}
AudioPlayer.onpause = function() {
    document.getElementById("BarPlay").innerHTML = "play_arrow";
    document.getElementById("FullPlay").innerHTML = "play_arrow";
    console.log("paused");
}
AudioPlayer.onplay = function() {
    document.getElementById("BarPlay").innerHTML = "pause";
    document.getElementById("FullPlay").innerHTML = "pause";
    console.log("played");
}

function playBack() {
    QueueManager.prevSong();
 
}

function playNext() {
    QueueManager.nextSong();
}

function playSongArr(PlaybackPos) {
    //todo display play next
    
    console.log("PlayCall", PlaybackPos);
    document.getElementById("nowPlaying").innerHTML = QueueManager.Queue[PlaybackPos][0];
    //document.getElementById("CurSongName").innerHTML = QueueManager.Queue[PlaybackPos][0];
    document.title = QueueManager.Queue[PlaybackPos][0];
    document.getElementById("SongTitle").innerHTML = QueueManager.Queue[PlaybackPos][0];
    QueueManager.playbackPosition = PlaybackPos;
    getBlobArt(QueueManager.Queue[PlaybackPos][1], sets);
    let currentData = JSON.parse(localStorage.getItem(QueueManager.Queue[PlaybackPos][1] + "-meta"));
    if (currentData.lyrics && typeof currentData.lyrics === "string") {   
        document.getElementById("FVLyricsContainer").innerText = currentData.lyrics;
    } else {
        document.getElementById("FVLyricsContainer").innerText = "No lyrics available."
    }
    retrieveBlobURL(QueueManager.Queue[PlaybackPos][0], QueueManager.Queue[PlaybackPos][1], function(s) {
        AudioPlayer.src = s;
        AudioPlayer.play();
        
    });
    AudioPlayer.play();
    setTimeout(AudioPlayer.play, 1000);
    
}
function playSongFromID(ref) {
    playSongArr(QueueManager.findPositionInCurrentQueue(ref));
}
function changeSong(e) {
    let index = e.getAttribute("data-songid");
 
    if (!(e.getAttribute("data-playlistid") == "AllSongs")) {
        switchQueue();
       
    } else {
        if (QueueManager.ActiveQueueName == "AllSongs") {

        } else {
            QueueManager.ActiveQueueName = "AllSongs";
            document.getElementById("CurrentQueue").innerHTML = "All Songs"; 
            QueueManager.setActiveQueue(QueueManager.AllSongsEx);
            QueueManager.doShuffleCurrentQueue();
        }
    }
    playSongFromID(index);
}


function retrieveBlobURL(sttl, sid, cb) {
    if (ActiveBlob) {
        AudioPlayer.src = "";
        URL.revokeObjectURL(ActiveBlob)
    };
    
    db.getAttachment(sid, sttl).then(function(blobOrBuffer) {
        let Blobber = URL.createObjectURL(blobOrBuffer);
        cb(Blobber);
        ActiveBlob = Blobber;
    }).catch(function(err) {
        console.log(err);
    });
}

function sets(x) {
    aa = document.getElementById("AlbumArt");

    console.log("LoadAlbumArt", x);
    
    if (x === "Error") {
        aa.src = "noart.png";
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                artwork: [
                    { src: "noart.png", type: 'image/png' }
                ]
            }); }
        } else {
            if (curimgblob) {
                URL.revokeObjectURL(curimgblob);
            }
            curimgblob = x;
            aa.src = x;
            
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    artwork: [
                        { src: x, type: 'image/png' }
                    ]
                }); }
            }
    document.getElementById("Albart").src = aa.src;
}
function togglePause() {
    if (AudioPlayer.paused) {
        AudioPlayer.play(); 
    } else {
        AudioPlayer.pause(); 
    }
}

function setSong(sttl, sid) {
    
            document.getElementById("FullTitle").innerHTML = sttl;
            document.getElementById("CurSongName").innerHTML = sttl;
            document.title = sttl;
            retrieveBlobURL(sttl, sid, playAudio);
            getBlobArt(sid, sets);
            
        }