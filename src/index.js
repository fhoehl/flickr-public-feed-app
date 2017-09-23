const angular = require('angular');
const ngRoute = require('angular-route');
const ngSanitize = require('angular-sanitize');
const uiRouter = require('angular-ui-router');

const feedItemTemplate = require('html-loader!./partials/feedItem.html');
const photoDetailsTemplate = require('html-loader!./partials/photoDetails.html');
const photoModalTemplate = require('html-loader!./partials/photoModal.html');

angular.module('potatoPhoto', ['ngRoute', 'ngSanitize', 'ui.router']);

require('./service');

angular.module('potatoPhoto')
.config(function ($routeProvider, $locationProvider, $stateProvider) {
  $stateProvider
    .state({
      name: 'feed',
      url: '/',
      template: '<feed></feed>',
    })
    .state({
      name: 'feed.detail',
      url: 'photo/{photoId}',
      views: {
        'detail@': {
          template: photoModalTemplate,
          controller: function PhotoView($scope, $stateParams, feedService) {
            feedService.getPhoto($stateParams.photoId).then(function (photo) {
              $scope.photo = photo;
            });
          }
        }
      }
    });

  $locationProvider.html5Mode(true);
});

angular.module('potatoPhoto')
.component('feed', {
  template: '<div ng-repeat="item in $ctrl.feed track by item.link"><feed-item photo="item"></feed-item></div>',
  controller: function GreetUserController(feedService) {
    this.user = 'world';
    this.feed = [];

    var ctrl = this;

    feedService.getFeed().then(
      function(data) {
        ctrl.feed = data;
      },
      function(error) {
        console.log('Could not load the image feed.', error);
      }
    );
  }
});

angular.module('potatoPhoto')
.component('feedItem', {
  template: feedItemTemplate,
  bindings: {
    photo: '=',
  },
  controller: function FeedItemController() {
  }
});

angular.module('potatoPhoto')
.component('photoDetails', {
  template: photoDetailsTemplate,
  bindings: {
    photo: '=',
  }
});
