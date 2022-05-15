var notDragging = true;
var colorThief = new ColorThief();
var FGColor;
document.getElementById("AlbumArt").onload = function () {
  CalculateBackdrop();
};
function CalculateBackdrop() {
  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  var cx = colorThief.getColor(document.getElementById("AlbumArt"));
  FGColor = "rgb(" + cx[0] + ", " + cx[1] + ", " + cx[2] + ")";
  var _BACKGROUND_ =
    "linear-gradient(to bottom, rgb(" +
    cx[0] +
    ", " +
    cx[1] +
    ", " +
    cx[2] +
    ") 0%,#222 100%)";
  let luma = getColor(cx[0], cx[1], cx[2]);
  document.getElementById("FullView").style.background = _BACKGROUND_;
  if (luma >= 128) {
    let tg = document.getElementById("FVHeads");
    tg.style.color = "black";
    for (let i = 0; i < tg.children.length; i++) 
    {
        tg.children[i].style.color = "black";
        
    }
  } else {
    let tg = document.getElementById("FVHeads");
    tg.style.color = "white";
    for (let i = 0; i < tg.children.length; i++) 
    {
        tg.children[i].style.color = "white"
    }
  }
  if (fv) {
    metaThemeColor.setAttribute("content", FGColor);
    if (_lvMode === "LYRICS") {
        _lyrics();
    } else if (_lvMode === "MEDIA_INFO") {
        _mediaInfo();
    }
  }
}
function getColor(r,g,b) {
   

  let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma;
}
