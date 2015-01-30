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

	nbCarouselSlidePictureDirective.$inject = ['$timeout', '_'];
	function nbCarouselSlidePictureDirective ($timeout, _) {
		return {
			restrict: 'EA',
			link: function (scope, element, attrs) {
				var loadCheckTimeout;

				scope.loaded = false;
				scope.sourceWidth = 0;
				scope.sourceHeight = 0;

				function loadCheck () {
					cancelLoadCheck();

					if (scope.isLoaded()) {
						scope.loaded = true;
					}
					else {
						scope.loaded = false;
						loadCheckTimeout = $timeout(loadCheck, 50);
					}
				}

				function cancelLoadCheck () {
					if (loadCheckTimeout) {
						$timeout.cancel(loadCheckTimeout);
					}
				}

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

				scope.$on('$destroy', function () {
					cancelLoadCheck();
				});

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

				loadCheck();
			}
		};
	}
})(window, window.angular);