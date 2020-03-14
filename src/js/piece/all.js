/* globals window, screen */

require('../lib/modernizr');

module.exports = {
  init() {
    require('@zeitiger/elevatezoom');

    const $art = $('#art');

    if (!Modernizr.touchevents) {
      $art.attr('data-zoom-image', $art.attr('src'));

      $art.elevateZoom({
        zoomType: 'lens',
        lensShape: 'round',
        lensSize: 300,
        cursor: 'crosshair',
        zoomWindowFadeIn: 300,
        zoomWindowFadeOut: 300,
      });
    } else {
      $('meta[name=viewport]').attr('content', 'user-scalable=yes, initial-scale=1, maximum-scale=10, minimum-scale=0.5, width=device-width, height=device-height, target-densitydpi=device-dpi');
    }
  },

};
