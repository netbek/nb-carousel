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
