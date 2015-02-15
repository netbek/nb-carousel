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
				_.merge(config, values);
			},
			$get: function () {
				return config;
			}
		};
	}
})(window, window.angular);
