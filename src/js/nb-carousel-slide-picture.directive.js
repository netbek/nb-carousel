/**
 * Carousel slide picture directive
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel')
		.directive('nbCarouselSlidePicture', nbCarouselSlidePictureDirective);

	nbCarouselSlidePictureDirective.$inject = ['_', '$q'];
	function nbCarouselSlidePictureDirective (_, $q) {
		return {
			restrict: 'EA',
			link: function (scope, element, attrs) {
				var resizeWatch;

				scope.sourceWidth = 0;
				scope.sourceHeight = 0;

				function doResize (inWidth, inHeight, outWidth, outHeight) {
					var scaled = _.scale(inWidth, inHeight, outWidth, outHeight);
					element.css({
						left: scaled.x + 'px',
						top: scaled.y + 'px',
						width: scaled.width + 'px',
						height: scaled.height + 'px'
					});
				}

				scope.resize = function (width, height) {
					// Cancel a deferred resize, in any.
					if (resizeWatch) {
						resizeWatch();
					}

					if (scope.sourceWidth && scope.sourceHeight) {
						doResize(scope.sourceWidth, scope.sourceHeight, width, height);
					}
					// If sourceWidth or sourceHeight is not already set, then defer resize until both are set.
					else {
						resizeWatch = scope.$watch(function () {
							return {
								sourceWidth: scope.sourceWidth,
								sourceHeight: scope.sourceHeight
							};
						}, function (newValue, oldValue, scope) {
							if (newValue.sourceWidth && newValue.sourceHeight) {
								doResize(newValue.sourceWidth, newValue.sourceHeight, width, height);
								resizeWatch();
								resizeWatch = null;
							}
						});
					}
				};

				scope.$on('$destroy', function () {
					if (resizeWatch) {
						resizeWatch();
					}
				});

				attrs.$observe('sourceWidth', function (value) {
					if (value) {
						scope.sourceWidth = Number(value);
					}
				});
				attrs.$observe('sourceHeight', function (value) {
					if (value) {
						scope.sourceHeight = Number(value);
					}
				});
			}
		};
	}
})(window, window.angular);
