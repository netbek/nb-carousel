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

	nbCarouselController.$inject = ['$scope', '$element', '$timeout', '$interval', '$animate', 'GSAP', 'nbCarouselConfig', '$window', 'nbWindow', '$document'];
	function nbCarouselController ($scope, $element, $timeout, $interval, $animate, GSAP, nbCarouselConfig, $window, nbWindow, $document) {
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

			var index = $scope.slides.indexOf(slide);
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

				// Set height of carousel.
				$element.css('height', height + 'px');

				// Set width and height of slides.
				angular.forEach($scope.slides, function (slide) {
					slide.resize(width, height);
				});
			}
		}

		// Disable (pause) the carousel if the element is hidden.
		deregister.push($scope.$watch(function setDisabled () {
			return $element.hasClass('ng-hide');
		}, function (newValue) {
			$scope.disabled = self.disabled = newValue;

			if (newValue) {
				$scope.pause();
			}
			else {
				$scope.play();
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

			onWindowResize.cancel();
		});
	}
})(window, window.angular);
