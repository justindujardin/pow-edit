module.exports = function(grunt) {

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      clean: {
         editor: {
            src: ["build/"]
         }
      },
      /**
       * Compile TypeScript library
       */
      typescript: {
         options: {
            module: 'amd', //or commonjs
            target: 'es5', //or es3
            basePath: 'source',
            sourceMap: true,
            declaration: true
         },
         editor: {
            src: [
               "source/app.ts",
               "source/controllers/*.ts",
               "source/services/*.ts",
               "source/directives/*.ts"
            ],
            dest: 'build/<%= pkg.name %>.js'
         }
      },

      /**
       * Compile game LESS styles to CSS
       */
      less: {
         editor: {
            options: {
               paths: ["source/"]
            },
            files: {
               'build/<%= pkg.name %>.css':'source/app.less'
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

         ui: {
            files: [
               'source/directives/*.html'
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
       *
       *
       */
      html2js: {
         options: {
            rename: function (moduleName) {
               return '' + moduleName.replace('../', '');
            }
         },
         ui: {
            src: ['source/directives/*.html'],
            dest: 'build/<%= pkg.name %>.ui.js'
         }
      },

      nodewebkit: {
         options: {
            build_dir: './NodeWebkitBuilds',
            mac: true,
            win: false,
            linux32: false,
            linux64: false
         },
         src: ['./**/*']
      }
   });

   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-typescript');
   grunt.loadNpmTasks('grunt-contrib-less');
   grunt.loadNpmTasks('grunt-node-webkit-builder');
   grunt.loadNpmTasks('grunt-html2js');
   // Support system notifications in non-production environments
   if(!process || !process.env || process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.registerTask('default', ['clean','typescript','less','html2js']);
   }
   else {
      grunt.registerTask('default', ['typescript','less','html2js']);
   }
};
