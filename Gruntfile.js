module.exports = function(grunt) {

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      clean: {
         editor: {
            src: ["assets/build/"]
         }
      },
      /**
       * Compile TypeScript library
       */
      typescript: {
         options: {
            module: 'commonjs', //or commonjs
            target: 'es5', //or es3
            basePath: 'source',
            sourceMap: true,
            comments: false,
            declaration: true
         },
         editor: {
            src: [
               "source/app.ts",
               "source/shell/controllers/*.ts",
               "source/shell/controllers/**/*.ts",
               "source/shell/directives/*.ts",
               "source/shell/directives/**/*.ts",
               "source/editor/*.ts",
               "source/editor/controllers/*.ts",
               "source/editor/directives/*.ts",
               "source/editor/services/*.ts",
               "source/editor/actions/*.ts",
               "source/interfaces/*.ts",
               "source/formats/*.ts"
            ],
            dest: 'assets/build/<%= pkg.name %>.js'
         },
         platforms:{
            files:{
               'assets/build/<%= pkg.name %>.nw.js':'source/platforms/platformNodeWebkit.ts',
               'assets/build/<%= pkg.name %>.browser.js':'source/platforms/platformBrowser.ts'
            }
         },
         server:{
            files:{
               'assets/build/<%= pkg.name %>.server.js':'source/server/server.ts'
            }
         },
         tests: {
            src: [
               "test/fixtures/*.ts",
               "test/fixtures/**/*.ts",
               "test/*.ts",
               "test/**/*.ts"
            ],
            dest: 'assets/build/test/<%= pkg.name %>.tests.js'
         }
      },

      /**
       * Compile game LESS styles to CSS
       */
      less: {
         editor: {
            options: {
               paths: [
                  "source/",
                  "assets/bower_components/"
               ]
            },
            files: {
               'assets/build/<%= pkg.name %>.css':'source/app.less'
            }
         }
      },

      /**
       * Trigger a new build when files change
       */
      watch: {
         editor: {
            files: [
               '<%= typescript.editor.src %>'
            ],
            tasks: ['typescript:editor']
         },
         platforms: {
            files: [
               'source/platforms/*.ts'
            ],
            tasks: ['typescript:platforms']
         },

         server: {
            files:  [ 'source/server/server.ts' ],
            tasks:  [ 'typescript:server','express' ],
            options: {
               nospawn: true
            }
         },
         tests: {
            files: [
               '<%= typescript.tests.src %>'
            ],
            tasks: ['typescript:tests']
         },

         outputs: {
           files: ['assets/build/*.*'],
            tasks: ['express']
         },

         ui: {
            files: [
               'source/**/*.html'
            ],
            tasks: ['html2js:ui']
         },
         styles: {
            files: [
               'source/*.less',
               'source/**/*.less'
            ],
            tasks: ['less']
         }
      },

      /**
       * Express server for Browser platform integration
       */
      express: {
         options: {
            script: 'assets/build/<%= pkg.name %>.server.js',
            port: 5217
         },
         production: {
            options: {
               node_env: 'production'
            }
         }
      },

      /**
       */
      html2js: {
         options: {
            rename: function (moduleName) {
               return '' + moduleName.replace('../', '');
            }
         },
         ui: {
            src: ['source/**/*.html'],
            dest: 'assets/build/<%= pkg.name %>.ui.js'
         }
      },

      nodewebkit: {
         options: {
            platforms: ['win','osx'],
            buildDir: './builds/',
            version:'0.10.2'
         },
         src: [
            './assets/*.*',
            './assets/bower_components/**/*',
            './assets/vendor/**/*',
            './assets/build/*',
            './assets/build/**/*',
            './assets/maps/**/*',
            './assets/fonts/**/*'
         ]
      },

      /**
       * Release/Deploy tasks
       */
      bump: {
         options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: ['pkg'],
            commit: true,
            commitMessage: 'chore(deploy): release v%VERSION%',
            commitFiles: ['package.json', 'bower.json', 'CHANGELOG.md'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: false,
            pushTo: 'origin',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
         }
      },
      changelog: {},

      'npm-contributors': {
         options: {
            commitMessage: 'chore(attribution): update contributors'
         }
      },

      /**
       * Code Coverage
       */
      coveralls: {
         options: {
            coverage_dir: '.coverage/',
            debug: process.env.TRAVIS ? false : true,
            dryRun: process.env.TRAVIS ? false : true,
            force: true,
            recursive: true
         }
      }

   });

   // Testing
   grunt.loadNpmTasks('grunt-karma-coveralls');


   // Release/Deploy
   grunt.loadNpmTasks('grunt-bump');
   grunt.loadNpmTasks('grunt-conventional-changelog');
   grunt.loadNpmTasks('grunt-npm');
   grunt.registerTask('release', 'Build, bump and tag a new release.', function(type) {
      type = type || 'patch';
      grunt.task.run([
         'npm-contributors',
            "bump:" + type + ":bump-only",
         'changelog',
         'bump-commit'
      ]);
   });
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-typescript');
   grunt.loadNpmTasks('grunt-contrib-less');
   grunt.loadNpmTasks('grunt-express-server');
   grunt.loadNpmTasks('grunt-node-webkit-builder');
   grunt.loadNpmTasks('grunt-html2js');
   if(!process || !process.env || process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.registerTask('default', ['clean','typescript','less','html2js']);
   }
   else {
      grunt.registerTask('default', ['typescript','less','html2js']);
   }
   grunt.registerTask('develop', ['default','watch']);
   grunt.registerTask('develop:web', ['default','express','watch']);
};
