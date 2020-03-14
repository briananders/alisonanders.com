'use strict';

window.jQuery = require('jquery');
window.$ = window.jQuery;

const routes = require('./routes');
const router = require('./router');

router.init(routes);
