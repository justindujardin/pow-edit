/*globals module,process,require */
module.exports = function(config) {
   "use strict";

   var coverageDebug = true;

   config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: [
         "bower_components/underscore/underscore-min.js",
         "bower_components/pow-core/lib/pow-core.min.js",
         "bower_components/jquery/dist/jquery.min.js",
         "assets/vendor/ace/src-min-noconflict/ace.js",
         "bower_components/showdown/compressed/showdown.js",
         "bower_components/pixi/bin/pixi.js",
         "bower_components/angular/angular.min.js",
         "bower_components/angular-mocks/angular-mocks.js",
         "bower_components/angular-ui-layout/ui-layout.min.js",
         "build/pow-edit.browser.js", // WebBrowser platform
         //"build/pow-edit.nw.js", // Node Webkit platform
         "build/pow-edit.ui.js", // Angular templates
         "build/pow-edit.js", // Angular App
         "build/test/*.js",
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

      preprocessors: (process.env.TRAVIS || coverageDebug) ? { "build/*.js": "coverage" } : {},
      coverageReporter: {
         type: "lcov",
         dir: ".coverage/"
      }
   });
};