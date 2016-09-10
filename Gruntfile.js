module.exports = function(grunt) {

  grunt.initConfig({
    /* Clear out the images directory if it exists */
    clean: {
      build: {
        src: ['dist/**/*']
      }
    },
    copy: {
      build: {
        files: [
          // includes files within path and its sub-directories
          {
            expand: true,
            cwd: 'src',
            src: '**',
            dest: 'dist/',
          }
        ],
      },
    },
    uglify: {
      build: {
        options: {
          banner: '/*uglified ' + (new Date()) + '*/',
          beautify: true,
          preserveComments: 'all',
          mangle: false
        },
        files: [{src: 'src/js/knockout.js', dest: 'dist/js/knockout.js'}]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['clean', 'copy', 'uglify']);

};