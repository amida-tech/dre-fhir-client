/*global module */

"use strict";

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        alljsfiles: ['lib/**/*.js', 'test/**/*.js', 'gruntfile.js', 'package.json', 'index.js'],
        jsbeautifier: {
            beautify: {
                src: '<%= alljsfiles%>',
                options: {
                    config: '.jsbeautifyrc'
                }
            },
            check: {
                src: '<%= alljsfiles%>',
                options: {
                    mode: 'VERIFY_ONLY',
                    config: '.jsbeautifyrc'
                }
            }
        },
        jshint: {
            files: '<%= alljsfiles%>',
            options: {
                browser: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: false,
                boss: true,
                eqnull: true,
                node: true,
                expr: true,
                globals: {
                    'xit': true,
                    'xdescribe': true,
                    'it': true,
                    'describe': true,
                    'before': true,
                    'after': true,
                    'done': true
                }
            }
        },
        express: {
            dev: {
                options: {
                    script: 'node_modules/dre-fhir-server/server.js',
                    port: 3002
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: '2000',
                    bail: true
                },
                src: ['test/**/test-*.js', '!test/verify']
            }
        },
        shell: {
            run_istanbul: {
                command: "istanbul cover ./node_modules/mocha/bin/_mocha -- -R spec --recursive --timeout 2000"
            }
        }
    });

    grunt.registerTask('beautify', ['jsbeautifier:beautify']);
    grunt.registerTask('mocha', ['mochaTest']);
    grunt.registerTask('coverage', ['express:dev', 'shell:run_istanbul']);
    grunt.registerTask('default', ['beautify', 'jshint', 'express:dev', 'mocha']);
};
