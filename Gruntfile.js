module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ["src/**/*.js", '!src/js/libs/**/*.js'],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        copy: {
            app: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    src: ['**/*'],
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist',
                src: ['**/*.css', '!**/*min.css'],
                dest: "dist"
            }
        },
        uglify: {
            options: {
                beautify: {
                    ascii_only: true
                }
            },
            minify: {
                expand: true,
                cwd: 'dist',
                src: ['**/*.js', '!**/*min.js'],
                dest: "dist"
            }
        },
        replace: {
            version: {
                src: ["dist/**/*.js", "dist/**/*.css"],
                overwrite: true,
                replacements: [{
                    from: "@VERSION",
                    to: "<%=pkg.version%>"
                }]
            }
        }
    });


    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("build", ["jshint", "copy:app", "replace:version", "cssmin:minify", "uglify:minify"]);


};