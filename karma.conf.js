/*globals module,process,require */
module.exports = function(config) {
   "use strict";

   var coverageDebug = false;

   config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: [
         "assets/bower_components/underscore/underscore.js",
         "assets/bower_components/pow-core/lib/pow-core.js",
         "assets/bower_components/jquery/dist/jquery.js",
         "assets/vendor/ace/src-min-noconflict/ace.js",
         "assets/bower_components/showdown/compressed/showdown.js",
         "assets/bower_components/pixi/bin/pixi.dev.js",
         "assets/bower_components/angular/angular.js",
         "assets/bower_components/angular-mocks/angular-mocks.js",
         "assets/build/pow-edit.browser.js", // WebBrowser platform
         //"build/pow-edit.nw.js", // Node Webkit platform
         "assets/build/pow-edit.ui.js", // Angular templates
         "assets/build/pow-edit.js", // Angular App
         "assets/build/test/*.js",
         {pattern: 'test/fixtures/*.*', watched: true, included: false, served: true},
         {pattern: 'test/fixtures/**/*.*', watched: true, included: false, served: true}
      ],
      reporters: ['dots','coverage'],
      port: 9876,
      autoWatch: true,
      background:true,
      // - Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
      browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],
      singleRun: false,
      reportSlowerThan: 500,
      plugins: [
         'karma-firefox-launcher',
         'karma-chrome-launcher',
         'karma-jasmine',
         'karma-coverage'
      ],

      preprocessors: (process.env.TRAVIS || coverageDebug) ? { "assets/build/*.js": "coverage" } : {},
      coverageReporter: {
         type: "lcov",
         dir: ".coverage/"
      }
   });
};