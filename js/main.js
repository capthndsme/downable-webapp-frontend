var db = new PouchDB("fileStorage");
imgdb = new PouchDB("thumbStorage");

// APIs will be on a different repo

var ActiveBlob;
var curimgblob;
//Attribution: https://stackoverflow.com/a/14919494

function humanFileSize(bytes, si) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  var units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}
// Attribution https://stackoverflow.com/a/11486026 fancyTimeFormat(time in secs) returns Fancied time.
function fancyTimeFormat(time) {
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

function placeFile(blob, songTitle, songID) {
  db.putAttachment(songID, songTitle, blob, blob.type)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (err) {
      console.log(err);
    });
}
function createDownloadNode(sttl, sid) {
  let node = document.getElementById("tmp_dl").cloneNode(true);
  node.id = "";
  node.getElementsByClassName("DownloadTitle")[0].innerHTML = sttl;
  node.getElementsByClassName("downloadmeterfill")[0].id = sid + "-dlbar";
  node.getElementsByClassName("DownloadID")[0].innerHTML = sid;
  document.getElementById("DownloadList").appendChild(node);
  node = undefined;
}
function serverConvert(TubeID, Title) {
  var xhttp = new XMLHttpRequest();

  xhttp.open("GET", "/download/" + TubeID, true);
  xhttp.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(xhttp.responseText);
      console.log(data);
      if (data.success) {
        Toastify({
          text: "Server convert success, downloading song " + Title + " now...",
          duration: 3000,
          close: true,
          gravity: "top", // `top` or `bottom`
          positionLeft: false, // `true` or `false`
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
        location.hash = "!downloads";
        console.log(data);
        console.log(data.url);
        createDownloadNode(Title, TubeID);
        localStorage.setItem(
          TubeID + "-meta",
          JSON.stringify({ metadata: data.metadata, lyrics: data.lyrics })
        );
        downloadFile(data.audio, data.metadata.title, TubeID);
      } else {
        setTimeout(function () {
          serverConvert(TubeID, Title);
        }, 2500);
        Toastify({
          text: "Error. Retrying " + Title + " now...",
          duration: 3000,
          close: true,
          gravity: "top", // `top` or `bottom`
          positionLeft: false, // `true` or `false`
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
      }
    } else if (this.status == 500) {
      setTimeout(function () {
        serverConvert(TubeID, Title);
      }, 2500);
      Toastify({
        text: "Error. Retrying " + Title + " now...",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        positionLeft: false, // `true` or `false`
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();
    }
  };

  xhttp.send();
}
function getBlobArt(id, cb) {
  imgdb
    .getAttachment(id, id)
    .then(function (blobOrBuffer) {
      var smb = URL.createObjectURL(blobOrBuffer);
      cb(smb);
    })
    .catch(function (err) {
      cb("Error");
    });
}
// songTitle & songID for Metadata only.
function downloadFile(url, songTitle, songID) {
  let oReq = new XMLHttpRequest();
  console.log("Job start download: ", url, songTitle, songID);
  oReq.open("GET", url, true);
  oReq.responseType = "blob";
  oReq.onprogress = function (evt) {
    let dx = document.getElementById(songID + "-dlbar");
    dx.style.width = ((evt.loaded / evt.total) * 100).toString() + "%";
    dx.parentNode.parentNode.getElementsByClassName(
      "DownloadSize"
    )[0].innerHTML =
      humanFileSize(evt.loaded, true) + " / " + humanFileSize(evt.total, true);
  };
  oReq.onload = function (oEvent) {
    console.log("Loaded");
    console.log(oReq);
    if (oReq.status == 200) {
      let blob = oReq.response;
      songPlaceFile(blob, songTitle, songID);
      Toastify({
        text: "Download for SongID " + songID + " was completed.",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        positionLeft: false, // `true` or `false`
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();
      downloadArt(songID);
      document
        .getElementById(songID + "-dlbar")
        .parentNode.parentNode.getElementsByClassName(
          "DownloadSize"
        )[0].innerHTML = "Download Complete!";
      QueueManager.addSong(songTitle, songID);
      var xxx = QueueManager.findPositionInAllSongs(songID);
      createSongElement(
        QueueManager.AllSongsEx[xxx][0],
        QueueManager.AllSongsEx[xxx][1],
        xxx
      );
    } else if (oReq.status == 500) {
      console.log("Retrying...");
      setTimeout(function () {
        downloadFile(url, songTitle, songID);
      }, 2500);
    }
  };

  oReq.send();
}
function isOnline(no, yes) {
  var xhr = XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHttp");
  xhr.onload = function () {
    if (yes instanceof Function) {
      yes();
    }
  };
  xhr.onerror = function () {
    if (no instanceof Function) {
      no();
    }
  };
  xhr.open("GET", "ping.txt", true);
  xhr.send();
}
function clearList() {}
function listAllFiles(cb) {
  db.allDocs({
    include_docs: true,
    attachments: true,
  })
    .then(function (result) {
      let i;
      for (i = 0; i < result.rows.length; ++i) {
        let songTitle = Object.keys(result.rows[i].doc._attachments)[0];
        let id = result.rows[i].doc._id;
        QueueManager.addSong(songTitle, id);
      }
      for (i = 0; i < QueueManager.AllSongsEx.length; i++) {
        createSongElement(
          QueueManager.AllSongsEx[i][0],
          QueueManager.AllSongsEx[i][1],
          i
        );
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

function songMore(ref, event) {
  event.stopPropagation();
  let sTitle = ref.parentElement.getAttribute("data-songtitle");
  let sID = ref.parentElement.getAttribute("data-songid");
  let arrIn = ref.parentElement.getAttribute("data-arrayIndex");
  let plist = ref.parentElement.getAttribute("data-playlistID");
  Swal.fire({
    title: ref.parentElement.innerText.replace("more_vert", ""),
    showCloseButton: true,
    showOKButton: false,
    html:
      "Actions: <div data-songtitle='" +
      sTitle +
      "' data-songid='" +
      sID +
      "' data-arrayindex='" +
      arrIn +
      "' data-playlistID='" +
      plist +
      "' class='songOptions' ><br/><button class='moreSelect' onclick='addSongToPlaylist(this.parentElement)'>Add to playlist</button><br/><button class='moreSelect' onclick='addSongToQueue(this.parentElement)'>Add to Queue</button><br/><button class='moreSelect' onclick='deleteSongAndConfirm(this.parentElement)'>Delete</button></div>",
  }).then((result) => {
    console.log(result);
  });
}

function addSongToPlaylist(ref) {
  swal.clickConfirm();
  window.addSongToPlaylistRef = [
    ref.getAttribute("data-songtitle"),
    ref.getAttribute("data-songid"),
  ];
  window.location.href = "#!/addtoplaylist";
}
function addSongToQueue(ref) {
  swal.clickConfirm();
  AddToQueueResolver(ref);
}
function deleteSongAndConfirm(ref) {
  swal.clickConfirm();
  Swal.fire({
    title: "Delete",
    text: "Do you want to delete " + ref.getAttribute("data-songtitle") + "?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.value) {
      deleteAndFind(ref.getAttribute("data-songid"));
      Swal.fire("Deleted!", "Deleted successfully.", "success");
    }
  });
}

function deleteAndFind(SONG_ID) {
  // TODO Find any references of the song ID and delete them, all.
}

function createSongElement(sttl, sid, arrayIndex, isPlaylistListing) {
  var $newContent = document.getElementById("tmp_song").cloneNode(true);
  $newContent.id = sid + "-songlist";
  $newContent.setAttribute("data-songid", sid);
  $newContent.setAttribute("data-songtitle", sttl);
  $newContent.setAttribute("data-arrayindex", arrayIndex);
  $newContent.getElementsByClassName("songTitle")[0].innerHTML = sttl;
  if (isPlaylistListing) {
    $newContent.setAttribute("data-playlistID", isPlaylistListing);

    Sublist.appendChild($newContent);
  } else {
    libraryListView.appendChild($newContent);
    $newContent.setAttribute("data-playlistID", "AllSongs");
  }
  $newContent = undefined;
}
function createSongSearchedElement(sttl, sid, arrayIndex) {
  var $newContent = document.getElementById("tmp_song").cloneNode(true);
  $newContent.id = sid + "-songlist";
  $newContent.setAttribute("data-songid", sid);
  $newContent.setAttribute("data-songtitle", sttl);
  $newContent.setAttribute("data-arrayindex", arrayIndex);
  $newContent.getElementsByClassName("songTitle")[0].innerHTML = sttl;
  SearchUIResults.appendChild($newContent);
  $newContent = undefined;
}
function songPlaceFile(blob, songTitle, songID) {
  db.putAttachment(songID, songTitle, blob, blob.type)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (err) {
      console.log(err);
    });
}
function placeFile(blob, artid) {
  imgdb
    .putAttachment(artid, artid, blob, blob.type)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (err) {
      console.log(err);
    });
}

// songTitle & songID for Metadata only.

function downloadArt(vidid) {
  let oReq = new XMLHttpRequest();
  oReq.open("GET", "/getAlbumArt/" + vidid, true);
  oReq.responseType = "blob";
  oReq.onload = function (oEvent) {
    console.log(oReq);
    if (oReq.status == 200) {
      let blob = oReq.response;
      placeFile(blob, vidid);
      localStorage.setItem(vidid, "yes");
    } else if (oReq.status == 404) {
      localStorage.setItem(vidid, "no-album");
    }
  };

  oReq.send();
}

function YouTubeGetID(url) {
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

function callDownload(ref) {
  var elem = ref.parentElement.parentElement;

  Toastify({
    text: " Server is downloading and converting your file.",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    positionLeft: false, // `true` or `false`
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
  }).showToast();
  serverConvert(
    elem.getAttribute("data-download"),
    elem.getAttribute("data-title")
  );
}

function setContent(aid) {
  var views = document.getElementsByClassName("view");
  for (var i = 0; i < views.length; i++)
    views[i].classList.remove("activeView");
  if (aid == "dls") {
    document.getElementById("DownloadsView").classList.add("activeView");
  } else if (aid == "lib") {
    document.getElementById("LibraryView").classList.add("activeView");
  } else {
    document.getElementById("HomeView").classList.add("activeView");
  }
  showPlayEx(true);
}

var fv = false;
var searchDebounce = true;
function clearSearchUI() {
  while (SearchUIResults.firstChild) {
    SearchUIResults.removeChild(SearchUIResults.lastChild);
  }
}

function clearSublist() {
  while (Sublist.firstChild) {
    Sublist.removeChild(Sublist.lastChild);
  }
}
function searchManager(ref, event) {
  if (event.keyCode === 13 && searchDebounce) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    // Search start
    var myNode = document.getElementById("SearchPlace");
    while (myNode.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }
    searchDebounce = false;
    if (ref.value.toLowerCase().startsWith("http")) {
      doEmbedder(ref.value);
    } else {
      doSearch(ref.value);
    }
  }
}
function showPlayEx(force) {
  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  if (fv || force) {
    MainUI.style.transform = "translateY(0%) scale(1)";
    FullView.style.transform = "translateY(100%) ";
    metaThemeColor.setAttribute("content", "#222");
    fv = false;
  } else {
    MainUI.style.transform = "translateY(-50%) scale(0.6)";
    FullView.style.transform = "translateY(0%)";
    metaThemeColor.setAttribute("content", FGColor);
    fv = true;
  }
}
function showDLList() {
  document.getElementById("SearchPlace").style.display = "block";
  document.getElementById("SearchHeader").style.display = "flex";
}

function hideDLList() {
  document.getElementById("SearchPlace").style.display = "none";
  document.getElementById("SearchHeader").style.display = "none";
  document.getElementById("SearchStatus").style.display = "none";
}
function moreFV() {
  let fff = document.getElementById("MoreFV");
  if (fff.style.display == "none") {
    fff.style.display = "block";
  } else {
    fff.style.display = "none";
  }
}
function YouTubeGetID(url) {
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}
function DownloadResultReady(p) {
  document.getElementById("EmbedPlace").style.display = "none";
  document.getElementById("SearchPlace").style.display = "none";
  Toastify({
    text: " Server is downloading and converting your file.",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    positionLeft: false, // `true` or `false`
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
  }).showToast();
  if (p.getAttribute("data-provider") == "youtube") {
    serverConvert(
      p.getAttribute("data-download"),
      p.getAttribute("data-title")
    );
  }
}
function doEmbedder(ref) {
  var Resolver = "https://noembed.com/embed?url=" + ref;
  document.getElementById("EmbedPlace").style.display = "block";
  document.getElementById("SearchPlace").style.display = "none";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      let data = JSON.parse(xhttp.responseText);
      if (data.error) {
        Toastify({
          text: "Error: " + data.error,
          duration: 2500,
          close: true,
          gravity: "top", // `top` or `bottom`
          positionLeft: false, // `true` or `false`
          backgroundColor: "linear-gradient(to right, black, red)",
        }).showToast();
        hideResult();
        document.getElementById("loader").style.display = "none";
        setTimeout(function () {
          document.getElementById("dl-btn").disabled = false;
          document.getElementById("dl-btn").style.background = activeColor;
        }, 860);
      } else {
        console.log(data);
        document.getElementById("SongTitleResult").innerHTML = data.title;
        document
          .getElementById("DownloadResultReady")
          .setAttribute("data-download", YouTubeGetID(ref));
        document
          .getElementById("DownloadResultReady")
          .setAttribute("data-title", data.title);
        document
          .getElementById("DownloadResultReady")
          .setAttribute("data-provider", "youtube");
        document.getElementById("CheckEmbeds").src = data.thumbnail_url;
        Toastify({
          text: "Found " + data.title,
          duration: 2500,
          close: true,
          gravity: "top", // `top` or `bottom`
          positionLeft: false, // `true` or `false`
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
      }
    }
  };
  xhttp.open("GET", Resolver, true);
  xhttp.send();
}

function doSearch(SEARCH_TERM, NO_RETRY) {
  var xhttp = new XMLHttpRequest();
  document.getElementById("SearchStatus").style.display = "block";
  xhttp.open("GET", "/search/" + SEARCH_TERM, true);
  xhttp.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(xhttp.responseText);
      for (var i = 0, len = data.length; i < len; i++) {
        var $dlList = document
          .getElementById("tmp_SearchResult")
          .cloneNode(true);
        $dlList.id = "dl-" + data[i].id.videoId;
        $dlList.setAttribute("data-download", data[i].id.videoId);
        $dlList.setAttribute("data-title", data[i].title);
        $dlList.getElementsByClassName("searchResultImg")[0].src =
          data[i].snippet.thumbnails.default.url;
        $dlList.getElementsByClassName("searchResultTitle")[0].innerHTML =
          data[i].title;
        $dlList.getElementsByClassName("searchResultMeta")[0].innerHTML =
          data[i].duration_raw;
        document.getElementById("SearchPlace").appendChild($dlList);
        searchDebounce = true;
      }
      showDLList();
      document.getElementById("SearchStatus").style.display = "none";
    } else if (this.status == 500) {
      setTimeout(function () {
        if (NO_RETRY) searchDebounce = true;
        else doSearch(SEARCH_TERM, true);
      }, 2500);
    }
  };
  xhttp.send();
}
function requestStorage() {
  if (navigator.storage && navigator.storage.persist)
    navigator.storage.persist().then((granted) => {
      if (granted)
        Toastify({
          text: "Storage will not be cleared except by explicit user action",
          duration: 2500,
          close: true,
          gravity: "top", // `top` or `bottom`
          positionLeft: false, // `true` or `false`
          backgroundColor: "linear-gradient(to right, black, green)",
        }).showToast();
      else
        Toastify({
          text: "Storage may be cleared by the UA under storage pressure.",
          duration: 2500,
          close: true,
          gravity: "top", // `top` or `bottom`
          positionLeft: false, // `true` or `false`
          backgroundColor: "linear-gradient(to right, black, red)",
        }).showToast();
    });
}

function do_Load() {
  window.Sublist = document.getElementById("Sublists");
  document.getElementById("MoreFV").style.display = "none";
  window.SearchUI = document.getElementById("SearchUI");
  window.SearchUIResults = document.getElementById("SearchContent");
  window.FullRangeMeter = document.getElementById("FullRangeMeter");
  window.FullRange = document.getElementById("FullRange");
  window.FullTime = document.getElementById("FullTimer");
  window.FullTimeT = document.getElementById("FullTimerTotal");
  FullRange.ontouchstart = function () {
    notDragging = false;
  };
  FullRange.ontouchend = function () {
    notDragging = true;
    AudioPlayer.currentTime = FullRange.value;
  };
  FullRange.onmousedown = function () {
    notDragging = false;
  };
  FullRange.onmouseup = function () {
    notDragging = true;
    AudioPlayer.currentTime = FullRange.value;
  };
  FullRange.oninput = function () {
    notDragging = false;
    AudioPlayer.currentTime = FullRange.value;
  };
  CalculateBackdrop();
  window.libraryListView = document.getElementById("AllSongs");
  window.MainUI = document.getElementById("MainUI");
  window.FullView = document.getElementById("FullView");
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("previoustrack", playBack);
    navigator.mediaSession.setActionHandler("nexttrack", playNext);
  }

  // ... To remove items from a list:
  //var listItems = listView.find('.my-items');
  //for(var index = 0, length = listItems.length; index < length; index++) {
  // listItems[index].remove();
  //}
  listAllFiles();
  loadPreferences();
  QueueManager.utils.deserializePlaylists();
  loadPlaylistDisplay();
  var root = null;
  var useHash = true; // Defaults to: false
  var hash = "#!"; // Defaults to: '#'
  window.router = new Navigo(root, useHash, hash);
  router
    .on({
      downloads: function () {
        setContent("dls");
        HideSettings();
      },
      library: function () {
        setContent("lib");
        document.getElementById("libBtn").innerText = "Library";
        document.getElementById("libBtn").style.color = "unset";
        HideSettings();
        showPlaylists();
        document.getElementById("AllSongs").style.display = "none";
        document.getElementById("Sublists").style.display = "none";
      },
      playOpen: function () {
        showPlayEx();
        HideSettings();
      },
      settings: function () {
        document.getElementById("SettingsView").style.display = "block";
      },
      "library/*": function () {
        setContent("lib");
        HideSettings();
        hidePlaylists();
        showLoadList();
        document.getElementById("libBtn").innerText = "< Library";
        document.getElementById("libBtn").style.color = "#7FC9FF";
      },
      createPlist: createPlaylistDialog,
      addtoplaylist: addToPlayListModal,
      "*": function () {
        setContent("home");
        HideSettings();
      },
    })
    .resolve();
  isOnline(Offlined, Onlined);
}

function condUp() {
  if (location.hash.startsWith("#!library/")) {
    window.history.back();
  } else {
  }
}

function blurEnable() {
  var blurfile = document.getElementById("NoBlur");
  document.getElementsByTagName("head")[0].removeChild(blurfile);
}
function blurDisable() {
  var fileref = document.createElement("link");
  fileref.rel = "stylesheet";
  fileref.type = "text/css";
  fileref.href = "css/NoBlur.css";
  fileref.id = "NoBlur";
  document.getElementsByTagName("head")[0].appendChild(fileref);
}
function toggleBlur(checkbox) {
  setPref("disableBlur", checkbox.checked);
  if (checkbox.checked) {
    blurDisable();
  } else {
    blurEnable();
  }
}
function toggleShuffle(REF) {
  if (Preferences.Shuffle) {
    if (typeof Preferences.Shuffle == "boolean") {
      REF.style.color = "white";
      Preferences.Shuffle = false;
      QueueManager.isShuffled = false;
      QueueManager.Queue.sort();
    } else {
      REF.style.color = "#7FC9FF";
      Preferences.Shuffle = true;
      QueueManager.isShuffled = true;
    }
    savePreferences();
  } else {
    REF.style.color = "#7FC9FF";
    QueueManager.isShuffled = true;
    Preferences.Shuffle = true;
    savePreferences();
  }
}

function RepeatStateResolver() {
  if (Preferences.RepeatState == 0) {
    Preferences.Repeat = false;
    Preferences.RepeatOnce = false;
  } else if (Preferences.RepeatState == 1) {
    Preferences.Repeat = true;
    Preferences.RepeatOnce = false;
  } else if (Preferences.RepeatState == 2) {
    Preferences.Repeat = true;
    Preferences.RepeatOnce = true;
  }
}
function RepeatRender() {
  if (typeof Preferences.Repeat == "boolean") {
    if (Preferences.Repeat) {
      document.getElementById("FVRepeat").style.color = "#7FC9FF";
      console.log("REPEAT MODE");
      document.getElementById("FVRepeat").innerHTML = "repeat";
    } else {
      document.getElementById("FVRepeat").innerHTML = "repeat";
      document.getElementById("FVRepeat").style.color = "white";
    }
  } else {
    Preferences.Repeat = false;
    savePreferences();
  }
  if (typeof Preferences.RepeatOnce == "boolean") {
    if (Preferences.RepeatOnce) {
      document.getElementById("FVRepeat").style.color = "#7FC9FF";
      document.getElementById("FVRepeat").innerHTML = "repeat_one";
    } else {
      document.getElementById("FVRepeat").innerHTML = "repeat";
    }
  }
}
var Preferences = {};
function loadPreferences() {
  if (localStorage.getItem("DownablePreferences")) {
    Preferences = JSON.parse(localStorage.getItem("DownablePreferences"));
    if (Preferences.disableBlur) {
      blurDisable();
      document.getElementById("disableBlur").checked = Preferences.disableBlur;
    }
  } else {
    savePreferences();
  }
  if (typeof Preferences.Shuffle == "boolean") {
    QueueManager.isShuffled = Preferences.Shuffle;
    if (Preferences.Shuffle) {
      document.getElementById("FVShuffle").style.color = "#7FC9FF";
    } else {
      document.getElementById("FVShuffle").style.color = "white";
    }
  } else {
    Preferences.Shuffle = false;
    savePreferences();
  }
  if (typeof Preferences.RepeatState == "number") {
    RepeatStateResolver();
  } else {
    Preferences.RepeatState = 0;
    RepeatStateResolver();
  }
  if (typeof Preferences.Repeat == "boolean") {
    if (Preferences.Repeat) {
      document.getElementById("FVRepeat").style.color = "#7FC9FF";
      console.log("REPEAT MODE");
      document.getElementById("FVRepeat").innerHTML = "repeat";
    } else {
      document.getElementById("FVRepeat").innerHTML = "repeat";
      document.getElementById("FVRepeat").style.color = "white";
    }
  } else {
    Preferences.Repeat = false;
    savePreferences();
  }
  if (typeof Preferences.RepeatOnce == "boolean") {
    if (Preferences.RepeatOnce) {
      document.getElementById("FVRepeat").style.color = "#7FC9FF";
      document.getElementById("FVRepeat").innerHTML = "repeat_one";
    } else {
      document.getElementById("FVRepeat").innerHTML = "repeat";
    }
  }
}

function toggleRepeat() {
  if (Preferences.RepeatState == 0) {
    Preferences.RepeatState++;
    RepeatStateResolver();
    RepeatRender();
  } else if (Preferences.RepeatState == 1) {
    Preferences.RepeatState++;
    RepeatStateResolver();
    RepeatRender();
  } else if (Preferences.RepeatState == 2) {
    Preferences.RepeatState = 0;
    RepeatStateResolver();
    RepeatRender();
  }
  savePreferences();
}

function savePreferences() {
  localStorage.setItem("DownablePreferences", JSON.stringify(Preferences));
}

function setPref(key, value) {
  Preferences[key] = value;
  savePreferences();
}
function HideSettings() {
  document.getElementById("SettingsView").style.display = "none";
  document.getElementById("AddToPlaylistView").style.display = "none";
}
function Offlined() {
  Toastify({
    text: "No internet access.",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    positionLeft: false, // `true` or `false`
    backgroundColor: "linear-gradient(to right, black, red)",
  }).showToast();
  document.getElementById("MainDLUI").style.display = "block";
  document.getElementById("NoNetworkError").style.display = "none";
}
window.addEventListener("offline", function (event) {});

function Onlined() {
  Toastify({
    text: "Network reconnected.",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    positionLeft: false, // `true` or `false`
    backgroundColor: "linear-gradient(to right, black, green)",
  }).showToast();
  document.getElementById("MainDLUI").style.display = "block";
  document.getElementById("NoNetworkError").style.display = "none";
}

window.onerror = (function (server_script) {
  "use strict";

  return function (error, file, line) {
    var err, params, script;

    if (typeof jQuery !== "undefined") {
      params = {
        error: error,
        file: file,
        line: line,
      };

      jQuery.get(server_script, params);
    } else {
      err = document.createElement("script");
      err.src =
        server_script +
        "?line=" +
        line +
        "&file=" +
        encodeURIComponent(file) +
        "&error=" +
        encodeURIComponent(error);

      script = document.getElementsByTagName("script")[0];
      script.parentNode.insertBefore(err, script);
    }

    return false;
  };
})("//api.home.capthndsme.xyz/Metrics/LogError");

function filterManager(ref) {
  if (ref.value.length >= 1) {
    SearchUI.style.display = "block";
    clearSearchUI();
    var searchTerm = ref.value.toUpperCase();
    for (var i = 0; i < QueueManager.Queue.length; i++) {
      if (
        new String(QueueManager.Queue[i][0]).toUpperCase().includes(searchTerm)
      ) {
        createSongSearchedElement(
          QueueManager.Queue[i][0],
          QueueManager.Queue[i][1],
          i
        );
      }
    }
  } else {
    SearchUI.style.display = "none";
  }
}

let _lyricLock;
let _lvMode = "LYRICS"; // default in Desktop.
function closeLyricsView() {
  let target = document.getElementById("FVLyricsView");
  window.clearTimeout(_lyricLock);
  _lyricLock = setTimeout(function () {
    target.style.display = "none";
  }, 360);

  target.style.transform = "translateY(100%)";
}
function showLyrics() {
  moreFV();
  _lvMode = "LYRICS";
  _lyrics();
}
function showMediaInfo() {
  moreFV();
  _lvMode = "MEDIA_INFO";
  _mediaInfo()
}
function _lyrics() {
  let currentData = JSON.parse(
    localStorage.getItem(QueueManager.Queue[QueueManager.playbackPosition][1] + "-meta")
  );
  if (currentData.lyrics && typeof currentData.lyrics === "string") {
    document.getElementById("FVLyricsContainer").innerText = currentData.lyrics;
  } else {
    document.getElementById("FVLyricsContainer").innerText =
      "No lyrics available.";
  }
  let target = document.getElementById("FVLyricsView");
  target.style.display = "block";
  window.clearTimeout(_lyricLock);
  _lyricLock = setTimeout(function () {
    target.style.transform = "translateY(0%)";
  }, 32);
}
function _mediaInfo() {
  let currentData = JSON.parse(
    localStorage.getItem(QueueManager.Queue[QueueManager.playbackPosition][1] + "-meta")
  );
  if (currentData.metadata && typeof currentData.metadata === "object") {
   let rootContainer = document.getElementById("FVLyricsContainer");
   document.getElementById("FVLyricsContainer").innerText = "";
   let uploadDate = document.createElement("div");
   let uploader = document.createElement("div");
   let description = document.createElement("div");

   uploadDate.className = "UploadDate";
   uploader.className = "Uploader";
   description.className = "Description";

   uploadDate.innerText = "Uploaded at " + currentData.metadata.uploadDate;
   uploader.innerText = "Uploader: " + currentData.metadata.ownerChannelName;
   description.innerText = "Description: \n" + currentData.metadata.description;

   rootContainer.appendChild(uploadDate);
   rootContainer.appendChild(uploader);
   rootContainer.appendChild(description);
  } else {
    document.getElementById("FVLyricsContainer").innerText =
      "Media info missing";
  }
  let target = document.getElementById("FVLyricsView");
  target.style.display = "block";
  window.clearTimeout(_lyricLock);
  _lyricLock = setTimeout(function () {
    target.style.transform = "translateY(0%)";
  }, 32);
}

function volButton(VAL) {
  AudioPlayer.volume = VAL / 100;
}

let volPanelVisibility = false;
function showVolumePanel(ref) {
  console.log(ref.getBoundingClientRect());
  let volPanel = document.getElementById("FVVolumePanel");
  if (volPanelVisibility) {
    volPanel.style.display = "none";
    volPanelVisibility = false;
  } else {
    let refPos = ref.getBoundingClientRect();
    volPanel.style.display = "block";
    volPanel.style.top = refPos.top - refPos.height / 2 - 8 + "px";
    volPanel.style.left = refPos.left - refPos.width - 8 + "px";
    volPanelVisibility = true;
  }
}
