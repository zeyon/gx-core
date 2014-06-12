module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		distFolder: 'dist',
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			options: {
				separator: ''
			},
			dist: {
				src: [
					'src/gx.js',
					'src/gx.util.js',
					'src/gx.core.js',
					'src/gx.ui.js',
					'src/classes/*.js'
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		watch: {
			js: {
				files: [
                    'src/*.js',
                    'src/classes/*.js'
                ],
				tasks: ['concat', 'uglify'],
				options: {
					// livereload: true,
				}
			}
		},
		includereplace: {
			readme: {
				options: {
					globals: {
						name: '<%= pkg.name %>'
					}
				},
				src: 'docs/README.tpl.md',
				dest: 'README.md'
			},
			demo: {
				src: 'docs/index.html',
				dest: 'docs/index.html'
			}
		},
		includeSource: {
			js: {
				options: {
					basePath: '', // The base path to use when expanding files
					baseUrl: '../', // The base URL to use for included files in the final result.
					template: {
						html: {
							js: '<script type="text/javascript" src="{filePath}"></script>',
						}
					}
				},
				files: {
					'docs/index.html': 'docs/index.tpl.html'
				}
			}
		},
		jsvalidate: {
			options:{
				globals: {},
				esprimaOptions: {},
				verbose: false
			},
			targetName:{
				files:{
					files: ['src/*.js', 'src/classes/*.js'],
				}
			}
		}
	});

	// grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsvalidate');
	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-include-source');

	grunt.registerTask('default' , ['concat', 'uglify']);
	grunt.registerTask('dev'     , ['concat', 'uglify', 'watch']);
	grunt.registerTask('validate', ['jsvalidate', 'jshint']);
};
