var notDragging = true;
var colorThief = new ColorThief();
var FGColor;
document.getElementById("AlbumArt").onload = function() {
    CalculateBackdrop();
}
function CalculateBackdrop() {
    var metaThemeColor = document.querySelector("meta[name=theme-color]");
    var cx = colorThief.getColor(document.getElementById("AlbumArt"));
    FGColor = "rgb(" + cx[0] + ", " + cx[1] + ", " + cx[2] + ")";
    var _BACKGROUND_ = "linear-gradient(to bottom, rgb(" + cx[0] + ", " + cx[1] + ", " + cx[2] + ") 0%,#222 100%)";
    document.getElementById("FullView").style.background = _BACKGROUND_;
    if (fv) {
        metaThemeColor.setAttribute("content", FGColor);
    }
}