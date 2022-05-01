/* globals window, screen */

require('../lib/modernizr');
window.jQuery = require('jquery');

(function pieceAll() {
  require('@zeitiger/elevatezoom');

  const artElement = document.getElementById('art');
  const $art = jQuery(artElement);

  if (!Modernizr.touchevents) {
    artElement.setAttribute('data-zoom-image', artElement.dataset.src);

    $art.elevateZoom({
      zoomType: 'lens',
      lensShape: 'round',
      lensSize: 300,
      cursor: 'crosshair',
      zoomWindowFadeIn: 300,
      zoomWindowFadeOut: 300,
    });
  } else {
    document.querySelector('meta[name=viewport]').setAttribute('content', 'user-scalable=yes, initial-scale=1, maximum-scale=10, minimum-scale=0.5, width=device-width, height=device-height, target-densitydpi=device-dpi');
  }
}());
