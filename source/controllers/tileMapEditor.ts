///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   app.controller('PowTileMapController', [
      '$scope',
      'platform',
      function($scope,platform:IAppPlatform) {
         $scope.mapUrl = 'assets/maps/sewer.tmx';
      }
   ]);
}
