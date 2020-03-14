/* globals window */

window.retina = false;

module.exports = {
  init() {
    // adds active class to the top navigation.
    var body = $('body').get(0);
    $(`nav .${body.classList[0]}`).addClass('active');

    // retina images
    if (window.devicePixelRatio >= 1.2) {
      window.retina = true;

      $('[data-src-2x]').each(function () {
        if (this.tagName === 'IMG') {
          $(this).attr('src', $(this).attr('data-src-2x'));
        }
      });
    }
  },
};
