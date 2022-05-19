var notDragging = true;
var colorThief = new ColorThief();
var FGColor;
let blurCanvas = document.createElement("canvas");
blurCanvas.width = 120;
blurCanvas.height = 120;
let blurCanvasCtx = blurCanvas.getContext("2d");
let _blurUrl;
document.getElementById("AlbumArt").onload = CalculateBackdrop;
function CalculateBackdrop(ct) {
  let stracer = Date.now();
  let simg = new Image();
  simg.src = document.getElementById("AlbumArt").src;
  simg.onload = function () {
    canvasDraw(blurCanvas, blurCanvasCtx, simg, stracer);
    var metaThemeColor = document.querySelector("meta[name=theme-color]");
    let ctft = colorThief.getPalette(document.getElementById("AlbumArt"));
    let cx = ctft[1];
    let cax = ctft[0];
    let caxDarken = pSBC(
      -0.6,
      "rgba(" + cax[0] + ", " + cax[1] + ", " + cax[2] + ", 0.62)"
    );
    console.log("Before darken: ", "rgba(" + cax[0] + ", " + cax[1] + ", " + cax[2] + ", 0.62)",
    "After Darken: ", caxDarken)
    _blurUrl = blurCanvas.toDataURL();
    document.body.parentElement.style.background =
      "url('" + _blurUrl + "') no-repeat center center fixed";
    document.body.parentElement.style.backgroundSize = "cover";
    FGColor = "rgb(" + cx[0] + ", " + cx[1] + ", " + cx[2] + ")";
    var _BACKGROUND_ =
      "linear-gradient(to bottom, rgba(" +
      cx[0] +
      ", " +
      cx[1] +
      ", " +
      cx[2] +
      ", 0.85) 0%, " +
      caxDarken +
      " 100%), url('" +
      _blurUrl;
    +"') no-repeat center center fixed";
     
    let luma = getColor(cx[0], cx[1], cx[2]);
    document.getElementById("FullView").style.background = _BACKGROUND_;
    document.getElementById("FullView").style.backgroundSize = "cover";
    if (luma >= 128) {
      let tg = document.getElementById("FVHeads");
      tg.style.color = "black";
      for (let i = 0; i < tg.children.length; i++) {
        tg.children[i].style.color = "black";
      }
    } else {
      let tg = document.getElementById("FVHeads");
      tg.style.color = "white";
      for (let i = 0; i < tg.children.length; i++) {
        tg.children[i].style.color = "white";
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
    delete simg;
  };
}
function getColor(r, g, b) {
  let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma;
}

function canvasDraw(canvas, canvasContext, image, tracer) {
  let ratio = image.width / image.height;
  let newWidth = canvas.width;
  let newHeight = newWidth / ratio;
  if (newHeight < canvas.height) {
    newHeight = canvas.height;
    newWidth = newHeight * ratio;
  }
  let xOffset = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
  let yOffset = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;

  canvasContext.drawImage(image, xOffset, yOffset, newWidth, newHeight);
  let start = Date.now();

  blur(canvas, 3, { iterations: 3 });

  console.log("[BlurPerf]", Date.now() - start + "ms");
  console.log("[BlurPerfTopDown]", Date.now() - tracer + "ms");
}

function blur(
  canvas,
  radius = 0,
  { iterations = 1, x = 0, y = 0, width, height } = {}
) {
  if (radius < 1) {
    return;
  }
  width = width == null ? canvas.width : width;
  height = height == null ? canvas.height : height;

  const context = canvas.getContext("2d");
  const imageData = context.getImageData(x, y, width, height);

  const pixels = imageData.data;

  let rsum;
  let gsum;
  let bsum;
  let asum;
  let p;
  let p1;
  let p2;
  let yp;
  let yi;
  let yw;
  let pa;

  const wm = width - 1;
  const hm = height - 1;
  const rad1 = radius + 1;
  const space = Math.pow(radius * 2, 2);

  const r = [];
  const g = [];
  const b = [];
  const a = [];

  const vmin = [];
  const vmax = [];

  const getPx = (i) => {
    const a = pixels[i + 3];
    return [
      (a * pixels[i]) / 255,
      (a * pixels[i + 1]) / 255,
      (a * pixels[i + 2]) / 255,
      a,
    ];
  };

  while (iterations > 0) {
    iterations--;
    yw = yi = 0;

    for (let y = 0; y < height; y++) {
      const px = getPx(yw);
      rsum = px[0] * rad1;
      gsum = px[1] * rad1;
      bsum = px[2] * rad1;
      asum = px[3] * rad1;

      for (let i = 1; i <= radius; i++) {
        const px = getPx(yw + ((i > wm ? wm : i) << 2));
        rsum += px[0];
        gsum += px[1];
        bsum += px[2];
        asum += px[3];
      }

      for (let x = 0; x < width; x++) {
        r[yi] = rsum;
        g[yi] = gsum;
        b[yi] = bsum;
        a[yi] = asum;

        if (y == 0) {
          p = x + rad1;
          vmin[x] = (p < wm ? p : wm) << 2;
          p = x - radius;
          vmax[x] = p > 0 ? p << 2 : 0;
        }

        p1 = yw + vmin[x];
        p2 = yw + vmax[x];

        const px1 = getPx(p1);
        const px2 = getPx(p2);

        rsum += px1[0] - px2[0];
        gsum += px1[1] - px2[1];
        bsum += px1[2] - px2[2];
        asum += px1[3] - px2[3];

        yi++;
      }
      yw += width << 2;
    }

    for (let x = 0; x < width; x++) {
      yp = x;
      rsum = r[yp] * rad1;
      gsum = g[yp] * rad1;
      bsum = b[yp] * rad1;
      asum = a[yp] * rad1;

      for (let i = 1; i <= radius; i++) {
        yp += i > hm ? 0 : width;
        rsum += r[yp];
        gsum += g[yp];
        bsum += b[yp];
        asum += a[yp];
      }

      yi = x << 2;
      for (let y = 0; y < height; y++) {
        pixels[yi + 3] = pa = Math.round(asum / space);

        if (pa > 0) {
          pa = 255 / pa;
          pixels[yi] = Math.round((rsum / space) * pa);
          pixels[yi + 1] = Math.round((gsum / space) * pa);
          pixels[yi + 2] = Math.round((bsum / space) * pa);
        } else {
          pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
        }
        if (x == 0) {
          p = y + rad1;
          vmin[y] = (p < hm ? p : hm) * width;
          p = y - radius;
          vmax[y] = p > 0 ? p * width : 0;
        }

        p1 = x + vmin[y];
        p2 = x + vmax[y];

        rsum += r[p1] - r[p2];
        gsum += g[p1] - g[p2];
        bsum += b[p1] - b[p2];
        asum += a[p1] - a[p2];

        yi += width << 2;
      }
    }
  }

  context.putImageData(imageData, x, y);
}
const pSBC = (p, c0, c1, l) => {
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    i = parseInt,
    m = Math.round,
    a = typeof c1 == "string";
  if (
    typeof p != "number" ||
    p < -1 ||
    p > 1 ||
    typeof c0 != "string" ||
    (c0[0] != "r" && c0[0] != "#") ||
    (c1 && !a)
  )
    return null;
  if (!this.pSBCr)
    this.pSBCr = (d) => {
      let n = d.length,
        x = {};
      if (n > 9) {
        ([r, g, b, a] = d = d.split(",")), (n = d.length);
        if (n < 3 || n > 4) return null;
        (x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4))),
          (x.g = i(g)),
          (x.b = i(b)),
          (x.a = a ? parseFloat(a) : -1);
      } else {
        if (n == 8 || n == 6 || n < 4) return null;
        if (n < 6)
          d =
            "#" +
            d[1] +
            d[1] +
            d[2] +
            d[2] +
            d[3] +
            d[3] +
            (n > 4 ? d[4] + d[4] : "");
        d = i(d.slice(1), 16);
        if (n == 9 || n == 5)
          (x.r = (d >> 24) & 255),
            (x.g = (d >> 16) & 255),
            (x.b = (d >> 8) & 255),
            (x.a = m((d & 255) / 0.255) / 1000);
        else
          (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
      }
      return x;
    };
  (h = c0.length > 9),
    (h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h),
    (f = this.pSBCr(c0)),
    (P = p < 0),
    (t =
      c1 && c1 != "c"
        ? this.pSBCr(c1)
        : P
        ? { r: 0, g: 0, b: 0, a: -1 }
        : { r: 255, g: 255, b: 255, a: -1 }),
    (p = P ? p * -1 : p),
    (P = 1 - p);
  if (!f || !t) return null;
  if (l)
    (r = m(P * f.r + p * t.r)),
      (g = m(P * f.g + p * t.g)),
      (b = m(P * f.b + p * t.b));
  else
    (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
      (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
      (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
  (a = f.a),
    (t = t.a),
    (f = a >= 0 || t >= 0),
    (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
  if (h)
    return (
      "rgb" +
      (f ? "a(" : "(") +
      r +
      "," +
      g +
      "," +
      b +
      (f ? "," + m(a * 1000) / 1000 : "") +
      ")"
    );
  else
    return (
      "#" +
      (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
        .toString(16)
        .slice(1, f ? undefined : -2)
    );
};
