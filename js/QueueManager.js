function shuffle(array) {
    var arrayclone = array.slice(0);
    var currentIndex = arrayclone.length,
    temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        // And swap it with the current element.
        temporaryValue = arrayclone[currentIndex];
        arrayclone[currentIndex] = arrayclone[randomIndex];
        arrayclone[randomIndex] = temporaryValue;
    }
    
    return arrayclone;
}


var QueueManager = {
    playbackPosition: 0,
    AllSongsEx: [],
    CurrentQueue: this.AllSongsEx,
    isShuffled: false,
    Playlists: {},
    ActiveQueueName: "AllSongs",
    CurrentQueueShuffle: [],
    Queue: [],
    addSong: function(sTitle, sID) {
        QueueManager.AllSongsEx.push([sTitle, sID]);
        QueueManager.AllSongsEx.sort();
        this.setActiveQueue(this.AllSongsEx);
        
    },
    findPositionInCurrentQueue: function(sID) {
        let arrayIndex;
        for (let i = 0; i < this.Queue.length; i++) {
            if (this.Queue[i][1] == sID) {
                arrayIndex = i;
            }
        }
        return arrayIndex;
    },
    findPositionInAllSongs: function(sID) {
        let arrayIndex;
        for (let i = 0; i < this.AllSongsEx.length; i++) {
            if (this.AllSongsEx[i][1] == sID) {
                arrayIndex = i;
            }
        }
        return arrayIndex;
    },
    setActiveQueue: function(QueuePointer) {
        QueueManager.CurrentQueue  = QueuePointer;
        console.log("SetQueue", QueuePointer);
        this.playbackPosition = 0; // Reset
        this.doShuffleCurrentQueue();
        if (this.isShuffled) {
            this.Queue = this.CurrentQueueShuffle;
        } else {
            this.Queue = this.CurrentQueue;
        }
    },
    doShuffleCurrentQueue: function() {
        this.CurrentQueueShuffle = shuffle(this.CurrentQueue);
    },
    prevSong: function() {
        if (AudioPlayer.currentTime >= 5) {
            AudioPlayer.currentTime = 0;
        } else {
            if (QueueManager.playbackPosition < 1) {
                QueueManager.playbackPosition = (this.Queue.length - 1);
                playSongArr(QueueManager.playbackPosition);
                
                
            } else {
                QueueManager.playbackPosition--;
                playSongArr(QueueManager.playbackPosition);
            }
        }
    },
    nextSong: function() {
 
        if (QueueManager.playbackPosition < (this.Queue.length - 1)) {
            QueueManager.playbackPosition++;
            playSongArr(QueueManager.playbackPosition);
        } else {
            // Last song in queue
            if (Preferences.Repeat) {
                QueueManager.playbackPosition = 0;
                playSongArr(QueueManager.playbackPosition);
            } else {
                Toastify({
                    text: "Playback finished.",
                    duration: 3000,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    positionLeft: false, // `true` or `false`
                    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                }).showToast();
            }
        }
    },
    // AddToQueue is universal thus we need the sTitle and sID itself.
    addToQueue: function(sTitle, sID) {
        
    },
    createPlaylist: function(P_NAME, P_DISPLAYNAME) {
        this.playlists[P_NAME] = {display: P_DISPLAYNAME, contents: []};
        this.utils.serializePlaylists();
    },
    addSongToPlaylist: function(P_NAME, sTitle, sID) {
        if (this.playlists[P_NAME]) {
            this.playlists[P_NAME].contents.push([sTitle, sID]);
            this.utils.serializePlaylists();
        } else {
            // ERROR Playlist doesn't exist
        }
    },
    playlists: {},
    utils: {
        deserializePlaylists: function() {
            if (localStorage.getItem("playlists")) {
                QueueManager.playlists = JSON.parse(localStorage.getItem("playlists"));
            } else {
                // No playlist. Create initial data.
                console.log("No playlists. Creating a blank playlists array & saving to localStorage");
                this.serializePlaylists();
            }
        },  
        serializePlaylists: function() {
            localStorage.setItem("playlists", JSON.stringify(QueueManager.playlists));
        }
    }
}


function hidePlaylists() {
    let pl = document.getElementById("PlaylistViews");
    pl.style.transform = "translateX(-100%)";
    
}
function showPlaylists() {
    let pl = document.getElementById("PlaylistViews");
    pl.style.transform = "translateX(0%)";
    document.getElementById("currQ").innerHTML = "";
}

function showLoadList() {
    window.curListInView = location.hash.replace("#!library/", "");
    if (location.hash == "#!library/AllSongs") {
        document.getElementById("AllSongs").style.display = "block";
        document.getElementById("Sublists").style.display = "none";
        document.getElementById("currQ").innerHTML = "All Songs";
    } else {
        document.getElementById("AllSongs").style.display = "none";
        document.getElementById("Sublists").style.display = "block";
        document.getElementById("currQ").innerHTML = QueueManager.playlists[curListInView].display;
        showPlContents();
    }
}

function createPlaylistDialog() {
    Swal.fire({
        title: 'Create Playlist',
        text: "Please give it a name",
        icon: 'info',
        input: "text",
        inputPlaceholder: "playlist name",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#333',
        confirmButtonText: "Create"
      }).then((result) => {
        if (result.value) {
            let plid = (new Date().getTime()).toString(36);
            Swal.fire(
                'Playlist created!',
                result.value + ' has been created.' + 
                '\n playlist uuid: ' + plid
            );
            QueueManager.createPlaylist(plid, result.value);
            CreatePlayListingElement(plid, result.value);
        }
        window.history.back();
      })
}

function CreatePlayListingElement(PlaylistID, DisplayName) {
    let COPY = document.getElementById("tmp_plist").cloneNode(true);
    COPY.id = "PL-" + PlaylistID;
    COPY.href = "#!library/" + PlaylistID;
    COPY.innerText = DisplayName;
    document.getElementById("Playlists").appendChild(COPY);
}
function CreatePlayListingSelectorElement(PlaylistID, DisplayName) {
    let COPY = document.getElementById("tmp_selector").cloneNode(true);
    COPY.id = "PLS-" + PlaylistID;
    COPY.innerText = DisplayName;
    document.getElementById("PLV_Selectors").appendChild(COPY);
}
function loadPlaylistDisplay() {
    let plists = Object.keys(QueueManager.playlists);
    for (let i = 0; i < plists.length; i++) {
        let reference = QueueManager.playlists[plists[i]];
        CreatePlayListingElement(plists[i], reference.display);
    }
}
function switchQueue() {
    QueueManager.ActiveQueueName = curListInView;
    document.getElementById("CurrentQueue").innerHTML = "Playlist " + QueueManager.playlists[curListInView].display; 
    QueueManager.setActiveQueue(QueueManager.playlists[curListInView].contents);
}
function showPlContents() {
    clearSublist();
    for (let i = 0; i < QueueManager.playlists[curListInView].contents.length; i++) {
        createSongElement(QueueManager.playlists[curListInView].contents[i][0], QueueManager.playlists[curListInView].contents[i][1], i, curListInView);
    }
    if (QueueManager.playlists[curListInView].contents.length == 0) {
        Sublist.innerHTML = "<center>Empty playlist. Add some using All Songs View.</center>";
    }
}

function addToPlayListModal() {
    let clearSelects = document.getElementsByClassName("selectorSelected");
    for (let i = 0; i < clearSelects.length; i++) {
        clearSelects[i].setAttribute("data-selected", "no");
        clearSelects[i].classList.remove("selectorSelected");
    }
    if (window.addSongToPlaylistRef) {
        document.getElementById("SongNameAdd").innerHTML = addSongToPlaylistRef[0];
        document.getElementById("AddToPlaylistView").style.display = "block";
        let plists = Object.keys(QueueManager.playlists);
        let selectors = document.getElementById("PLV_Selectors");
        while (selectors.firstChild) {
            selectors.removeChild(selectors.lastChild);
        }
        for (let i = 0; i < plists.length; i++) {
            let reference = QueueManager.playlists[plists[i]];
            CreatePlayListingSelectorElement(plists[i], reference.display);
        }
    } else {
        window.history.back();
    }
}

function selectSelfAsPlaylist(ref) {
    
    if (ref.getAttribute("data-selected") == "yes") {
        ref.classList.remove("selectorSelected");
        ref.setAttribute("data-selected", "no");
    } else {
        ref.classList.add("selectorSelected");
        ref.setAttribute("data-selected", "yes");
    }
}

function addSongToPlaylistCalc() {
    let findSelects = document.getElementsByClassName("selectorSelected");
    for (let i = 0; i < findSelects.length; i++) {
        let plid = findSelects[i].id.replace("PLS-", "");
        QueueManager.addSongToPlaylist(plid, addSongToPlaylistRef[0], addSongToPlaylistRef[1]);
        Toastify({
            text: "Added " + addSongToPlaylistRef[0] + " to playlist " + QueueManager.playlists[plid].display,
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            positionLeft: false, // `true` or `false`
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
    }
    window.history.back();
}