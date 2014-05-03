///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   app.controller('PowDocumentController', [
      '$scope',
      'platform',
      'rootPath',
      function($scope,platform:IAppPlatform,rootPath) {
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

         platform.enumPath(rootPath,(error:any,fileList?:IFileInfo[]) => {
            var mountFiles:any[] = [];
            angular.forEach(fileList,(file:IFileInfo) => {
               // Skip hidden files
               if(file.name[0] === '.'){
                  return;
               }
               mountFiles.push($scope.makeNode(file));
            });
            $scope.$$phase || $scope.$apply(() => {
               $scope.mount = mountFiles;
            });
         });

         $scope.selectFile = (node:any) => {
            var file:IFileInfo = node.data;

            if(file.full.indexOf('.tmx') !== -1){
               if(file.full.indexOf('-full.tmx') !== -1){
                  console.error("Skipping big ass file until it can be canceled.");
                  return;
               }
               $scope.mapUrl = file.full;
               return;
            }
            if(!file.children || !file.children.length){
               $scope.mapUrl = null;
               platform.readFile(file.full, (data:any) => {
                  platform.setTitle(file.full);
                  $scope.document = data;
               });
            }
         };
      }
   ]);
}
