const angular = require('angular');

angular.module('potatoPhoto')
.service('feedService', function($http, $sce, $compile, $q) {
  var url = 'https://api.flickr.com/services/feeds/photos_public.gne?tags=potato&tagmode=all&format=json';
  var trustedURL = $sce.trustAsResourceUrl(url);

  var cache = {};

  this.getFeed = function() {
    return $http.jsonp(trustedURL, {jsonpCallbackParam: 'jsoncallback' }).then(function(response) {

      var photo, photoId;
      var photoUrlRe = /https:\/\/www.flickr.com\/photos\/[^\/]+\/([0-9]+)/;

      for (var i = 0; i < response.data.items.length; i += 1) {
        photo = response.data.items[i];

        // Extract and set the id of the photo.
        var match = photoUrlRe.exec(photo.link);
        if (match) {
          photoId = match[1];
          photo._id = photoId;
        }

        // Compile the description field in an HTML tree.
        // This is done so we can extract the photo description out of the
        // markup given by the API. This method of extracting the content
        // might be a bit too much...
        var descriptionHTMLTree = $compile(photo.description)({});

        // The description body is usually the last <p> element.
        if (descriptionHTMLTree.length === 5) {
          photo.descriptionText = descriptionHTMLTree[descriptionHTMLTree.length - 1].innerHTML;
        } else {
          photo.descriptionText = '';
        }

        // Tags
        photo.tags = photo.tags.split(' ');

        cache[photoId] = photo;
      }

      return response.data.items;
    });
  };

  this.getPhoto = function(photoId) {
    if (cache[photoId]) {
      var deferred = $q.defer();
      deferred.resolve(cache[photoId]);
      return deferred.promise;
    } else {
      return this.getFeed().then(function () {
        return cache[photoId];
      });
    }
  };
});
