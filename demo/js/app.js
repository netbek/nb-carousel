/**
 * AngularJS carousel demo
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel.demo', [
			'angularStats',
			'nb.carousel'
		])
		.config(['nbPictureConfigProvider',
			function (nbPictureConfigProvider) {
				nbPictureConfigProvider.set({
					mediaqueries: {
						small: '(min-width: 0px)',
						medium: '(min-width: 640px)',
						large: '(min-width: 992px)',
						xlarge: '(min-width: 1440px)',
						xxlarge: '(min-width: 1920px)',
						landscape: '(orientation: landscape)',
						portrait: '(orientation: portrait)',
						// http://css-tricks.com/snippets/css/retina-display-media-query
						retina: '(-webkit-min-device-pixel-ratio: 2), ' +
							'(min--moz-device-pixel-ratio: 2), ' +
							'(-o-min-device-pixel-ratio: 2/1), ' +
							'(min-device-pixel-ratio: 2), ' +
							'(min-resolution: 192dpi), ' +
							'(min-resolution: 2dppx)'
					}
				});
			}])
		.controller('MainController', MainController)
		.run(runBlock);

	MainController.$inject = ['$scope'];
	function MainController ($scope) {
		var ngStats = showAngularStats({
			position: 'topright'
		});
//		ngStats.listeners.digestLength.log = function (digestLength) {
//			console.log('Digest: ' + digestLength);
//		};
//		ngStats.listeners.watchCount.log = function (watchCount) {
//			console.log('Watches: ' + watchCount);
//		};

		$scope.slides = [
			{
				width: 720,
				height: 960,
				styles: {
					small: 'http://lorempixel.com/180/240/abstract/1',
					medium: 'http://lorempixel.com/360/480/abstract/1',
					large: 'http://lorempixel.com/720/960/abstract/1',
					xlarge: 'http://lorempixel.com/1440/1920/abstract/1',
					xxlarge: 'http://lorempixel.com/2880/3840/abstract/1'
				}
			},
			{
				width: 960,
				height: 720,
				styles: {
					small: 'http://lorempixel.com/240/180/abstract/2',
					medium: 'http://lorempixel.com/480/360/abstract/2',
					large: 'http://lorempixel.com/960/720/abstract/2',
					xlarge: 'http://lorempixel.com/1920/1440/abstract/2',
					xxlarge: 'http://lorempixel.com/3840/2880/abstract/2'
				}
			},
			{
				width: 960,
				height: 720,
				styles: {
					small: 'http://lorempixel.com/240/180/abstract/3',
					medium: 'http://lorempixel.com/480/360/abstract/3',
					large: 'http://lorempixel.com/960/720/abstract/3',
					xlarge: 'http://lorempixel.com/1920/1440/abstract/3',
					xxlarge: 'http://lorempixel.com/3840/2880/abstract/3'
				}
			},
			{
				width: 960,
				height: 720,
				styles: {
					small: 'http://lorempixel.com/240/180/abstract/4',
					medium: 'http://lorempixel.com/480/360/abstract/4',
					large: 'http://lorempixel.com/960/720/abstract/4',
					xlarge: 'http://lorempixel.com/1920/1440/abstract/4',
					xxlarge: 'http://lorempixel.com/3840/2880/abstract/4'
				}
			},
			{
				width: 720,
				height: 960,
				styles: {
					small: 'http://lorempixel.com/180/240/abstract/5',
					medium: 'http://lorempixel.com/360/480/abstract/5',
					large: 'http://lorempixel.com/720/960/abstract/5',
					xlarge: 'http://lorempixel.com/1440/1920/abstract/5',
					xxlarge: 'http://lorempixel.com/2880/3840/abstract/5'
				}
			}
		];
	}

	function runBlock () {
	}
})(window, window.angular);