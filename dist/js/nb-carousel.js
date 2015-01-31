/**
 * Carousel module
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel', [
			'pasvaz.bindonce',
			'ngAnimate',
			'nb.gsap',
			'nb.lodash',
			'nb.throbber',
			'nb.window',
			'nb.carousel.templates'
		]);
})(window, window.angular);

/**
 * Carousel animation
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel')
		.animation('.slide-animation', slideAnimation);

	slideAnimation.$inject = ['GSAP'];
	function slideAnimation (GSAP) {
		return {
			addClass: function (element, className, done) {
				var scope = element.isolateScope();
				var duration = scope.transitionDuration();
				var ease = scope.transitionEase();

				if (className == 'fade-in') {
					GSAP.TweenMax.fromTo(element, duration / 2, {
						opacity: 0
					}, {
						ease: ease,
						opacity: 1,
						onComplete: done,
						overwrite: 'all'
					});
				}
				else if (className == 'active') {
					var from = (scope.direction() !== 'left' ? '-100%' : '100%');

					GSAP.TweenMax.fromTo(element, duration, {
						left: from
					}, {
						ease: ease,
						left: '0%',
						onComplete: done,
						overwrite: 'all'
					});

					GSAP.TweenMax.fromTo(element, duration / 2, {
						opacity: 0
					}, {
						delay: duration / 2,
						ease: ease,
						opacity: 1
					});
				}
				else {
					done();
				}
			},
			removeClass: function (element, className, done) {
				var scope = element.isolateScope();
				var duration = scope.transitionDuration();
				var ease = scope.transitionEase();

				if (className == 'active') {
					var to = (scope.direction() === 'left' ? '-100%' : '100%');

					GSAP.TweenMax.to(element, duration, {
						ease: ease,
						left: to,
						onComplete: done,
						overwrite: 'all'
					});

					GSAP.TweenMax.to(element, duration / 4, {
						opacity: 0
					});
				}
				else {
					done();
				}
			}
		};
	}
})(window, window.angular);

/**
 * Carousel controller
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel')
		.controller('nbCarouselController', nbCarouselController);

	nbCarouselController.$inject = ['$scope', '$element', '$timeout', '$interval', '$animate', 'GSAP', '$window', 'nbWindow', '_'];
	function nbCarouselController ($scope, $element, $timeout, $interval, $animate, GSAP, $window, nbWindow, _) {
		var self = this;
		var $$window = angular.element($window);
		var deregister = [];
		var timeouts = [];
		var currentInterval; // promise

		var deferGotoInterval; // promise
		var deferGotoIndex;
		var deferGotoDirection;

		var skipAnimation = true; // Prevents slide transition during the first goto()
		var destroyed = false; // Whether the scope has been destroyed.

		var transition; // function

		var oldSlide; // scope
		var newSlide; // scope

		var maxWidth = 0, maxHeight = 0;

		$scope.complete = false; // Whether all slides have loaded or failed to load.
		$scope.slides = [];
		$scope.direction = self.direction = 'left';
		$scope.currentIndex = -1;
		$scope.isPlaying = self.isPlaying = false;
		$scope.disabled = self.disabled = false;

		/**
		 *
		 * @param {int} index
		 * @returns {Boolean}
		 */
		$scope.isCurrentSlideIndex = function (index) {
			return $scope.currentIndex === index;
		};

		/**
		 *
		 * @param {int} index
		 * @param {string} direction left, right
		 */
		$scope.goto = function (index, direction) {
			cancelDeferGoto();

			// Stop here if there is a transition in progress or if the index has not changed.
			if (transition || $scope.currentIndex === index) {
				return;
			}

			oldSlide = $scope.slides[$scope.currentIndex];
			newSlide = $scope.slides[index];

			// Stop here if the slide is not loaded.
			if (!newSlide.complete) {
				// Periodically check if the slide is loaded, and then try goto() again.
				deferGoto(index, direction);
				return;
			}

			$animate.addClass(newSlide.$element, 'fade-in', angular.noop);

			if (angular.isUndefined(direction)) {
				direction = (index < $scope.currentIndex) ? 'left' : 'right';
			}
			$scope.direction = self.direction = direction;

			$scope.currentIndex = index;

			// Reset the timer when changing slides.
			restartTimer();

			if (skipAnimation || $scope.noTransition) {
				skipAnimation = false;
				gotoDone();
			}
			else {
				timeouts.push($timeout(function () {
					// Stop here if the scope has been destroyed.
					if (destroyed) {
						return;
					}

					// Force reflow.
					var reflow = newSlide.$element[0].offsetWidth;

					$animate.removeClass(oldSlide.$element, 'active', angular.noop);
					$animate.addClass(newSlide.$element, 'active', doTransition(gotoDone));
				}));
			}
		};

		/**
		 *
		 * @param {int} index
		 * @param {string} direction left, right
		 */
		function deferGoto (index, direction) {
			deferGotoIndex = index;
			deferGotoDirection = direction;
			deferGotoFn();
		}

		/**
		 * Periodically checks if a slide is loaded. If so, fires goto().
		 */
		function deferGotoFn () {
			cancelDeferGoto();

			if ($scope.slides[deferGotoIndex].complete) {
				$scope.goto(deferGotoIndex, deferGotoDirection);
			}
			else {
				deferGotoInterval = $interval(deferGotoFn, 50);
			}
		}

		function cancelDeferGoto () {
			if (deferGotoInterval) {
				$interval.cancel(deferGotoInterval);
				deferGotoInterval = null;
			}
		}

		/**
		 * Callback function fired after transition has been completed.
		 */
		function gotoDone () {
			if (oldSlide) {
				oldSlide.$element.removeClass('active');
			}
			if (newSlide) {
				newSlide.$element.addClass('active');
			}
		}

		/**
		 * Fires callback function after transition has been completed.
		 *
		 * @param {Function} callback
		 * @returns {Function}
		 */
		function doTransition (callback) {
			// We keep track of the current transition to prevent simultaneous transitions.
			transition = callback;

			return function () {
				// Stop here if the scope has been destroyed.
				if (destroyed) {
					return;
				}
				transition();
				transition = null;
			};
		}

		/**
		 * Go to previous slide.
		 */
		$scope.prev = function () {
			var newIndex = $scope.currentIndex > 0 ? $scope.currentIndex - 1 : $scope.slides.length - 1;
			$scope.goto(newIndex, 'left');
		};

		/**
		 * Go to next slide.
		 */
		$scope.next = function () {
			var newIndex = $scope.currentIndex < $scope.slides.length - 1 ? $scope.currentIndex + 1 : 0;
			$scope.goto(newIndex, 'right');
		};

		function restartTimer () {
			cancelTimer();
			var interval = +$scope.interval;
			if (!isNaN(interval) && interval > 0) {
				currentInterval = $interval(timerFn, interval);
			}
		}

		function cancelTimer () {
			if (currentInterval) {
				$interval.cancel(currentInterval);
				currentInterval = null;
			}
		}

		function timerFn () {
			var interval = +$scope.interval;
			if (self.isPlaying && !isNaN(interval) && interval > 0) {
				$scope.next();
			}
			else {
				$scope.pause();
			}
		}

		$scope.play = function () {
			if (!self.isPlaying) {
				$scope.isPlaying = self.isPlaying = true;
				restartTimer();
			}
		};

		$scope.pause = function () {
			if (!$scope.noPause) {
				$scope.isPlaying = self.isPlaying = false;
				cancelTimer();
			}
		};

		/**
		 *
		 * @param {Scope} slide Slide scope
		 * @param {DOM element} element Slide DOM element
		 */
		self.addSlide = function (slide, element) {
			slide.$element = element;
			$scope.slides.push(slide);

			if ($scope.slides.length === 1 || slide.active) {
				$scope.goto($scope.slides.length - 1);

				if ($scope.slides.length == 1 && !self.disabled) {
					$scope.play();
				}
			}
			else {
				slide.active = false;
			}
		};

		/**
		 *
		 * @param {Scope} slide
		 */
		self.removeSlide = function (slide) {
			GSAP.TweenMax.killTweensOf(slide.$element);

			var index = _.indexOf($scope.slides, slide);
			$scope.slides.splice(index, 1);

			if ($scope.slides.length > 0 && slide.active) {
				if (index >= $scope.slides.length) {
					$scope.goto(index - 1);
				}
				else {
					$scope.goto(index);
				}
			}
			else if ($scope.currentIndex > index) {
				$scope.currentIndex--;
			}
		};

		/**
		 * Checks if all the slides are loaded and sets the carousel load state.
		 *
		 * @param {Scope} slide
		 */
		self.setSlideComplete = function (slide) {
			var length = $scope.slides.length;
			var i = 0;

			angular.forEach($scope.slides, function (slide) {
				if (slide.complete) {
					i++;
				}
			});

			$scope.complete = (length === i);
		};

		/**
		 * Sets maximum width of slides (allows for slides of different sizes).
		 *
		 * @param {int} value
		 */
		self.setMaxWidth = function (value) {
			if (value > maxWidth) {
				maxWidth = value;
				resize();
			}
		};

		/**
		 * Sets maximum height of slides (allows for slides of different sizes).
		 *
		 * @param {int} value
		 */
		self.setMaxHeight = function (value) {
			if (value > maxHeight) {
				maxHeight = value;
				resize();
			}
		};

		/**
		 * Resizes carousel and slides.
		 */
		function resize (apply) {
			if (maxWidth && maxHeight) {
				var windowHeight = nbWindow.windowHeight() * 0.8;
				var width = $element[0].scrollWidth;
				var height = Math.min(windowHeight, maxHeight / maxWidth * width);

				if (width && height) {
					// Set height of carousel.
					$element.css('height', height + 'px');

					// Set width and height of slides.
					angular.forEach($scope.slides, function (slide) {
						slide.resize(width, height);
					});
				}
			}
		}

		// Disable (pause) the carousel if the element is hidden.
		deregister.push($scope.$watch(function setDisabled () {
			return $element.hasClass('ng-hide');
		}, function (newValue) {
			$scope.disabled = self.disabled = newValue;

			if ($scope.slides.length > 0) {
				if (newValue) {
					$scope.pause();
				}
				else {
					resize(false);
					$scope.goto(0);
					$scope.play();
				}
			}
		}));

		// Reset the timer when the interval property changes.
		deregister.push($scope.$watch('interval', restartTimer));

		// Gives the $animate service access to carousel properties.
		deregister.push($scope.$watch('noTransition', function (value) {
			self.noTransition = value;
		}));
		deregister.push($scope.$watch('transitionDuration', function (value) {
			self.transitionDuration = value;
		}));
		deregister.push($scope.$watch('transitionEase', function (value) {
			self.transitionEase = value;
		}));

		var onWindowResize = _.throttle(function () {
			resize(true);
		}, 60);

		// On window resize, resize carousel and slides.
		$$window.on('resize', onWindowResize);

		$scope.$on('$destroy', function () {
			destroyed = true;

			// Deregister watches.
			angular.forEach(deregister, function (fn) {
				fn();
			});

			// Cancel timeouts.
			angular.forEach(timeouts, function (promise) {
				$timeout.cancel(promise);
			});

			// Cancel deferred goto interval.
			cancelDeferGoto();

			// Cancel timer interval.
			cancelTimer();

			// Unbind window resize event listener.
			$$window.off('resize', onWindowResize);
		});
	}
})(window, window.angular);

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
				interval: '=',
				noTransition: '=',
				noPause: '=',
				transitionDuration: '@?',
				transitionEase: '@?'
			}
		};
	}
})(window, window.angular);

/**
 * Carousel config provider
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.carousel')
		.provider('nbCarouselConfig', nbCarouselConfig);

	function nbCarouselConfig () {
		var config = {
			transitionDuration: 1,
			transitionEase: 'easeNoneLinear'
		};
		return {
			set: function (values) {
				config = window.merge(true, config, values);
			},
			$get: function () {
				return config;
			}
		};
	}
})(window, window.angular);

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

	function nbCarouselSlideDirective () {
		return {
			require: '^nbCarousel',
			restrict: 'EA',
			transclude: true,
			replace: true,
			templateUrl: 'templates/nb-carousel-slide.html',
			scope: {
				active: '=?'
			},
			link: function (scope, element, attrs, controller) {
				var deregister = [];
				var picture = element.find('picture').scope();

				scope.complete = false; // Whether image has loaded or failed to load.

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

				// One-time watches.
				(function () {
					var watch = picture.$watch('complete', function (value) {
						if (value) {
							scope.complete = value;
							controller.setSlideComplete(scope);
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

angular.module('nb.carousel.templates', ['templates/nb-carousel-slide.html', 'templates/nb-carousel.html']);

angular.module("templates/nb-carousel-slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-carousel-slide.html",
    "<div class=\"slide slide-animation nonDraggableImage\" ng-transclude></div>");
}]);

angular.module("templates/nb-carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-carousel.html",
    "<div class=\"carousel\"\n" +
    "	 ng-mouseenter=\"pause()\"\n" +
    "	 ng-mouseleave=\"play()\"\n" +
    "	 ng-swipe-right=\"prev()\"\n" +
    "	 ng-swipe-left=\"next()\">\n" +
    "	<div class=\"carousel-inner\" ng-transclude></div>\n" +
    "\n" +
    "	<ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
    "		<li ng-repeat=\"slide in slides track by $index\"\n" +
    "			ng-class=\"{active: isCurrentSlideIndex($index)}\"\n" +
    "			ng-click=\"goto($index);\"></li>\n" +
    "	</ol>\n" +
    "\n" +
    "	<div ng-hide=\"complete\" nb-throbber></div>\n" +
    "\n" +
    "	<a class=\"left carousel-control\"\n" +
    "	   ng-click=\"prev()\"\n" +
    "	   ng-show=\"slides.length > 1\">\n" +
    "		<span nb-icon\n" +
    "			  data-id=\"arrow-left\"\n" +
    "			  data-color=\"blue\"></span>\n" +
    "	</a>\n" +
    "	<a class=\"right carousel-control\"\n" +
    "	   ng-click=\"next()\"\n" +
    "	   ng-show=\"slides.length > 1\">\n" +
    "		<span nb-icon\n" +
    "			  data-id=\"arrow-right\"\n" +
    "			  data-color=\"blue\"></span>\n" +
    "	</a>\n" +
    "</div>\n" +
    "");
}]);
