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
			'nb.carousel'
		])
		.controller('MainController', MainController)
		.run(runBlock);

	MainController.$inject = ['$scope'];
	function MainController ($scope) {
		$scope.files = [];
	}

	function runBlock () {

	}
})(window, window.angular);