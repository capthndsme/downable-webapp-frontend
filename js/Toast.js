/**
 * Minified by jsDelivr using UglifyJS v3.3.27.
 * Original file: /npm/toastify-js@1.2.2/src/toastify.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!function(t,i){"object"==typeof module&&module.exports?(require("./toastify.css"),module.exports=i()):t.Toastify=i()}(this,function(t){var o=function(t){return new o.lib.init(t)};function r(t,i){return!(!t||"string"!=typeof i)&&!!(t.className&&-1<t.className.trim().split(/\s+/gi).indexOf(i))}return o.lib=o.prototype={toastify:"1.2.2",constructor:o,init:function(t){return t||(t={}),this.options={},this.options.text=t.text||"Hi there!",this.options.duration=t.duration||3e3,this.options.selector=t.selector,this.options.callback=t.callback||function(){},this.options.destination=t.destination,this.options.newWindow=t.newWindow||!1,this.options.close=t.close||!1,this.options.gravity="bottom"==t.gravity?"bottom":"top",this.options.positionLeft=t.positionLeft||!1,this.options.backgroundColor=t.backgroundColor||"linear-gradient(135deg, #73a5ff, #5477f5)",this.options.avatar=t.avatar||"",this.options.classes=t.classes||"",this},buildToast:function(){if(!this.options)throw"Toastify is not initialized";var t=document.createElement("div");if(t.className="toastify on "+this.options.classes,!0===this.options.positionLeft?t.className+=" left":t.className+=" right",t.className+=" "+this.options.gravity,t.style.background=this.options.backgroundColor,t.innerHTML=this.options.text,""!==this.options.avatar){var i=document.createElement("img");i.src=this.options.avatar,i.className="avatar",!0===this.options.positionLeft?t.appendChild(i):t.insertAdjacentElement("beforeend",i)}if(!0===this.options.close){var o=document.createElement("span");o.innerHTML="&#10006;",o.className="toast-close",o.addEventListener("click",function(t){t.stopPropagation(),this.removeElement(t.target.parentElement),window.clearTimeout(t.target.parentElement.timeOutValue)}.bind(this));var e=0<window.innerWidth?window.innerWidth:screen.width;!0===this.options.positionLeft&&360<e?t.insertAdjacentElement("afterbegin",o):t.appendChild(o)}return void 0!==this.options.destination&&t.addEventListener("click",function(t){t.stopPropagation(),!0===this.options.newWindow?window.open(this.options.destination,"_blank"):window.location=this.options.destination}.bind(this)),t},showToast:function(){var t,i=this.buildToast();if(!(t=void 0===this.options.selector?document.body:document.getElementById(this.options.selector)))throw"Root element is not defined";return t.insertBefore(i,t.firstChild),o.reposition(),i.timeOutValue=window.setTimeout(function(){this.removeElement(i)}.bind(this),this.options.duration),this},removeElement:function(t){t.className=t.className.replace(" on",""),window.setTimeout(function(){t.parentNode.removeChild(t),this.options.callback.call(t),o.reposition()}.bind(this),400)}},o.reposition=function(){for(var t,i={top:15,bottom:15},o={top:15,bottom:15},e={top:15,bottom:15},n=document.getElementsByClassName("toastify"),s=0;s<n.length;s++){t=!0===r(n[s],"top")?"top":"bottom";var a=n[s].offsetHeight;(0<window.innerWidth?window.innerWidth:screen.width)<=360?(n[s].style[t]=e[t]+"px",e[t]+=a+15):!0===r(n[s],"left")?(n[s].style[t]=i[t]+"px",i[t]+=a+15):(n[s].style[t]=o[t]+"px",o[t]+=a+15)}return this},o.lib.init.prototype=o.lib,o});
//# sourceMappingURL=/sm/c1cac362eee65c8a926d1985dacf7f165fe8ef6491f8218a445784d2db89efac.map