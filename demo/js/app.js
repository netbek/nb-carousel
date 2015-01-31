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
			'pasvaz.bindonce',
			'nb.carousel',
			'nb.picturefill'
		])
		.controller('MainController', MainController)
		.run(runBlock);

	MainController.$inject = ['$scope'];
	function MainController ($scope) {
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
			}
		];
	}

	function runBlock () {
	}
})(window, window.angular);