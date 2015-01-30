/**
 * Carousel slide directive
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel')
		.directive('nbCarouselSlide', nbCarouselSlideDirective);

	nbCarouselSlideDirective.$inject = ['$timeout'];
	function nbCarouselSlideDirective ($timeout) {
		var now = (new Date).getTime();
		return {
			require: '^nbCarousel',
			restrict: 'EA',
			transclude: true,
			replace: true,
			templateUrl: 'templates/nb-carousel-slide.html' + '?t=' + now,
			scope: {
				active: '=?'
			},
			link: function (scope, element, attrs, controller) {
				var deregister = [];
				var picture = element.find('picture').scope();

				scope.loaded = false;

				// Gives the $animate service access to carousel properties.
				scope.direction = function () {
					return controller.direction;
				};
				scope.transitionDuration = function () {
					return controller.transitionDuration;
				};
				scope.transitionEase = function () {
					return controller.transitionEase;
				};

				// Sets width and height of slide picture.
				scope.resize = function (width, height) {
					picture.resize(width, height);
				};

				function getRandomInt (min, max) {
					return Math.floor(Math.random() * (max - min)) + min;
				}

				// One-time watches.
				(function () {
					var watch = picture.$watch('loaded', function (value) {
						if (value) {
//							scope.loaded = value;
//							controller.setLoaded(scope);

							// Simulate slow loading...
							var delay = getRandomInt(0, 5) * 1000;
							console.log('delay', delay);

							$timeout(function () {
								scope.loaded = value;
								controller.setLoaded(scope);
							}, delay);

							watch();
						}
					});
					deregister.push(watch);
				})();
				(function () {
					var watch = picture.$watch('sourceWidth', function (value) {
						if (value) {
							controller.setMaxWidth(value);
							watch();
						}
					});
					deregister.push(watch);
				})();
				(function () {
					var watch = picture.$watch('sourceHeight', function (value) {
						if (value) {
							controller.setMaxHeight(value);
							watch();
						}
					});
					deregister.push(watch);
				})();

				scope.$on('$destroy', function () {
					// Deregister watches.
					angular.forEach(deregister, function (fn) {
						fn();
					});

					// Remove slide from carousel.
					controller.removeSlide(scope);
				});

				// Add slide to carousel.
				controller.addSlide(scope, element);
			}
		};
	}
})(window, window.angular);
