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

	nbCarouselSlidePictureDirective.$inject = ['_'];
	function nbCarouselSlidePictureDirective (_) {
		return {
			restrict: 'EA',
			link: function (scope, element, attrs) {
				scope.sourceWidth = 0;
				scope.sourceHeight = 0;

				scope.resize = function (width, height) {
					if (scope.sourceWidth && scope.sourceHeight) {
						var scaled = _.scale(scope.sourceWidth, scope.sourceHeight, width, height);
						element.css({
							left: scaled.x + 'px',
							top: scaled.y + 'px',
							width: scaled.width + 'px',
							height: scaled.height + 'px'
						});
					}
				};

				attrs.$observe('source-width', function (value) {
					if (value) {
						scope.sourceWidth = Number(value);
					}
				});
				attrs.$observe('source-height', function (value) {
					if (value) {
						scope.sourceHeight = Number(value);
					}
				});
			}
		};
	}
})(window, window.angular);
