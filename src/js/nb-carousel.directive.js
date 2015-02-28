/**
 * Carousel directive
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel')
		.directive('nbCarousel', nbCarouselDirective);

	function nbCarouselDirective () {
		return {
			restrict: 'EA',
			transclude: true,
			replace: true,
			controller: 'nbCarouselController',
			templateUrl: 'templates/nb-carousel.html',
			scope: {
				interval: '@',
				noTransition: '=',
				noPause: '=',
				transitionDuration: '@?',
				transitionEase: '@?'
			}
		};
	}
})(window, window.angular);
