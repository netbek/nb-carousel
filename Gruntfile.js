/**
 * nb-carousel
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

module.exports = function (grunt) {

	var pkg = grunt.file.readJSON('package.json');

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-html2js');

	grunt.initConfig({
		pkg: pkg,
		meta: {
			banner: ['/*',
				' * <%= pkg.name %>',
				' * <%= pkg.homepage %>',
				' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
				' * @copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>',
				' * @license <%= pkg.license.url %> <%= pkg.license.type %>',
				' */\n'].join('\n')
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['Gruntfile.js', 'tasks/**/*.js', 'tests/tests/*.js', 'src/**/*.js', 'demo/**/*.js']
		},
		clean: {
			init: ['build', 'dist'],
			exit: ['build']
		},
		html2js: {
			dist: {
				options: {
					module: 'nb.carousel.templates',
				},
				files: [{
						src: ['src/templates/*.html'],
						dest: 'build/js/<%= pkg.name %>-templates.js',
					}]
			}
		},
		concat: {
			distCss: {
				src: ['src/css/**/*.css'],
				dest: 'dist/css/<%= pkg.name %>.css'
			},
			distJs: {
				src: [
					'src/js/nb-carousel.module.js',
					'src/js/nb-carousel.animation.js',
					'src/js/nb-carousel.controller.js',
					'src/js/nb-carousel.directive.js',
					'src/js/nb-carousel-config.service.js',
					'src/js/nb-carousel-slide.directive.js',
					'src/js/nb-carousel-slide-picture.directive.js',
					'build/js/<%= pkg.name %>-templates.js'
				],
				dest: 'dist/js/<%= pkg.name %>.js'
			}
		},
		cssmin: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: [{
						src: ['src/css/**/*.css'],
						dest: 'dist/css/<%= pkg.name %>.min.css'
					}]
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				src: ['dist/js/<%= pkg.name %>.js'],
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		}
	});

	grunt.registerTask('default', [
		'jshint',
		'clean:init',
		'html2js',
		'concat',
		'cssmin',
		'uglify',
		'clean:exit'
	]);

};