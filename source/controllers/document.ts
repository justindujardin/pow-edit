///<reference path="../types/angular/angular.d.ts"/>
///<reference path="../types/ace/ace.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   app.controller('PowCodeController', [
      '$scope',
      'platform',
      function($scope,platform:IAppPlatform) {
         var UndoManager:any = ace.require("ace/undomanager").UndoManager;
         $scope.history = new UndoManager();
         var file = "source/app.ts";
         platform.readFile(file, (data:any) => {
            platform.setTitle(file);
            $scope.document = data;
         });
         var id = 1337;

         $scope.makeNode = (file:IFileInfo) => {
            var result:any = {
               label: file.name,
               id:id++,
               data:file
            };
            if(file.children){
               result.children = file.children.map((f:IFileInfo) => {
                  return $scope.makeNode(f);
               });
            }
            return result;
         };

         platform.enumPath("./",(error:any,fileList?:IFileInfo[]) => {
            var mountFiles:any[] = [];
            angular.forEach(fileList,(file:IFileInfo) => {
               mountFiles.push($scope.makeNode(file));
            });
            $scope.$$phase || $scope.$apply(() => {
               $scope.mount = mountFiles;
            });
         });

         $scope.selectFile = (node:any) => {
            var file:IFileInfo = node.data;
            if(!file.children || !file.children.length){
               platform.readFile(file.full, (data:any) => {
                  platform.setTitle(file.full);
                  $scope.document = data;
               });
            }
         };
      }
   ]);
}
