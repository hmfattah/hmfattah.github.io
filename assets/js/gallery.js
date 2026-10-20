// Gallery lightbox: click a photo to view it larger, zoom in/out, and drag to pan.
// Without JavaScript, each photo link simply opens the image file.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var dialog = document.querySelector(".lightbox");
  if (!items.length || !dialog || typeof dialog.showModal !== "function") return;

  var img = dialog.querySelector(".lightbox__img");
  var caption = dialog.querySelector(".lightbox__caption");
  var zoomInBtn = dialog.querySelector(".lightbox__zoom-in");
  var zoomOutBtn = dialog.querySelector(".lightbox__zoom-out");
  var zoomLevel = dialog.querySelector(".lightbox__zoom-level");
  var current = 0;

  // ---------- Zoom & pan ----------
  var LEVELS = [1, 1.5, 2, 3, 4]; // steps used by the +/- buttons and keys
  var MIN = LEVELS[0];
  var MAX = LEVELS[LEVELS.length - 1];
  var scale = 1;
  var panX = 0;
  var panY = 0;
  var drag = null;

  function render() {
    // Keep the photo from being dragged completely out of view
    var maxX = (img.offsetWidth * (scale - 1)) / 2;
    var maxY = (img.offsetHeight * (scale - 1)) / 2;
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));

    img.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + scale + ")";
    dialog.classList.toggle("is-zoomed", scale > 1);
    zoomLevel.textContent = Math.round(scale * 100) + "%";
    zoomOutBtn.disabled = scale <= MIN;
    zoomInBtn.disabled = scale >= MAX;
  }

  function setZoom(next) {
    var previous = scale;
    scale = Math.max(MIN, Math.min(MAX, next));
    if (scale < 1.02) scale = 1;
    // Keep whatever is in the middle of the screen in the middle while zooming
    panX *= scale / previous;
    panY *= scale / previous;
    render();
  }

  function stepZoom(direction) {
    var i;
    if (direction > 0) {
      for (i = 0; i < LEVELS.length; i++) {
        if (LEVELS[i] > scale + 0.01) return setZoom(LEVELS[i]);
      }
      setZoom(MAX);
    } else {
      for (i = LEVELS.length - 1; i >= 0; i--) {
        if (LEVELS[i] < scale - 0.01) return setZoom(LEVELS[i]);
      }
      setZoom(MIN);
    }
  }

  function resetZoom() {
    scale = 1;
    panX = 0;
    panY = 0;
    render();
  }

  zoomInBtn.addEventListener("click", function () { stepZoom(1); });
  zoomOutBtn.addEventListener("click", function () { stepZoom(-1); });
  zoomLevel.addEventListener("click", resetZoom);

  // Double-click the photo to zoom in, double-click again to zoom back out
  img.addEventListener("dblclick", function () { setZoom(scale > 1 ? 1 : 2); });

  // Mouse wheel / trackpad zoom
  dialog.addEventListener("wheel", function (event) {
    event.preventDefault();
    setZoom(scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
  }, { passive: false });

  // Drag to pan when zoomed in (mouse, pen, or finger)
  img.addEventListener("pointerdown", function (event) {
    if (scale <= 1) return;
    event.preventDefault();
    drag = { id: event.pointerId, startX: event.clientX - panX, startY: event.clientY - panY };
    try { img.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    dialog.classList.add("is-dragging");
  });

  img.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.id) return;
    panX = event.clientX - drag.startX;
    panY = event.clientY - drag.startY;
    render();
  });

  function endDrag() {
    drag = null;
    dialog.classList.remove("is-dragging");
  }
  img.addEventListener("pointerup", endDrag);
  img.addEventListener("pointercancel", endDrag);

  // ---------- Opening & navigating ----------
  function show(index) {
    current = (index + items.length) % items.length;
    var link = items[current].querySelector(".gallery__link");
    var thumb = link.querySelector("img");
    var text = items[current].querySelector("figcaption");
    img.src = link.getAttribute("href");
    img.alt = thumb.alt;
    caption.textContent = text ? text.textContent : "";
    resetZoom();
  }

  items.forEach(function (item, index) {
    item.querySelector(".gallery__link").addEventListener("click", function (event) {
      event.preventDefault();
      show(index);
      dialog.showModal();
    });
  });

  dialog.querySelector(".lightbox__close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
  dialog.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
  dialog.addEventListener("close", resetZoom);

  // Click on the dark backdrop closes the viewer
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
    if (event.key === "+" || event.key === "=") stepZoom(1);
    if (event.key === "-" || event.key === "_") stepZoom(-1);
    if (event.key === "0") resetZoom();
  });
})();
