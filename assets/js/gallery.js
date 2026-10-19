// Gallery lightbox: click a photo to view it larger.
// Without JavaScript, each photo link simply opens the image file.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var dialog = document.querySelector(".lightbox");
  if (!items.length || !dialog || typeof dialog.showModal !== "function") return;

  var img = dialog.querySelector(".lightbox__img");
  var caption = dialog.querySelector(".lightbox__caption");
  var current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    var link = items[current].querySelector(".gallery__link");
    var thumb = link.querySelector("img");
    var text = items[current].querySelector("figcaption");
    img.src = link.getAttribute("href");
    img.alt = thumb.alt;
    caption.textContent = text ? text.textContent : "";
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

  // Click on the dark backdrop closes the viewer
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
})();
