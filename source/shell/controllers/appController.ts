/**
 Copyright (C) 2014 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../interfaces/IAppPlatform.ts"/>

module pow2.editor {

   declare var requestAnimFrame:any;

   app.controller('AppController', [
      '$scope',
      '$tasks',
      '$platform',
      'rootPath',
      function($scope,$tasks:pow2.editor.TasksService,$platform:IAppPlatform,rootPath) {
         $scope.document = {
            extension:'md',
            displayName:'README.md',
            location:rootPath + '/../../README.md',
            path:rootPath + '/../../'
         };

         $scope.getDocumentType = ():string => {
            switch($scope.document.extension.toLowerCase()){
               case 'png':
               case 'gif':
               case 'jpg':
               case 'jpeg':
               case 'bmp':
                  return 'image';
               case 'tmx':
                  return 'tiled';
               case 'md':
               case 'markdown':
                  return 'markdown';
               default:
                  return 'unknown';
            }
         };

         var id = 1337;
         $scope.makeNode = (file:IFileInfo,depth:number) => {
            var result:any = {
               label: file.name,
               id:id++,
               data:file,
               depth:depth
            };
            if(file.children){
               result.children = file.children.map((f:IFileInfo) => {
                  return $scope.makeNode(f,depth+1);
               });
            }
            return result;
         };
         $platform.enumPath(rootPath,(error:any,fileList?:IFileInfo[]) => {
            var mountFiles:any[] = [];
            angular.forEach(fileList,(file:IFileInfo) => {
               // Skip hidden files
               if(file.name[0] === '.'){
                  return;
               }
               mountFiles.push($scope.makeNode(file,0));
            });
            $scope.mount = mountFiles;
            $scope.$$phase || $scope.$digest();
         });
         $scope.selectFile = (node:any) => {
            var file:IFileInfo = node.data;
            $scope.document.extension = file.name.split('.').pop();
            $scope.document.displayName = file.full;
            $scope.document.location = file.full;
            $scope.document.path = file.path;
            $scope.document.data = null;
            if(!file.children || !file.children.length){
               $scope.mapUrl = null;
               $platform.readFile(file.full, (data:any) => {
                  $platform.setTitle(file.full);
                  $scope.document.data = data;
                  $scope.$$phase || $scope.$digest();
               });
            }
         };


         var UndoManager:any = ace.require("ace/undomanager").UndoManager;
         $scope.history = new UndoManager();

         var scopeDestroyed:boolean = false;
         /**
          * Process loop
          */
         function animate() {
            $tasks.processTasks();
            if(!scopeDestroyed){
               requestAnimationFrame(animate);
            }
         }
         requestAnimFrame(animate);
         return $scope.$on("$destroy", function() {
            scopeDestroyed = true;
         });
      }
   ]);
}
