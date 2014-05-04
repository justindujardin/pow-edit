///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   declare var requestAnimFrame:any;

   app.controller('AppController', [
      '$scope',
      '$tasks',
      'platform',
      'rootPath',
      function($scope,$tasks:pow2.editor.TasksService,platform:IAppPlatform,rootPath) {
         $scope.document = {
            extension:'tmx',
            displayName:'wilderness.tmx',
            location:'assets/maps/eburp/wilderness.tmx',
            path:'assets/maps/eburp/'
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
         platform.enumPath(rootPath,(error:any,fileList?:IFileInfo[]) => {
            var mountFiles:any[] = [];
            angular.forEach(fileList,(file:IFileInfo) => {
               // Skip hidden files
               if(file.name[0] === '.'){
                  return;
               }
               mountFiles.push($scope.makeNode(file,0));
            });
            $scope.$$phase || $scope.$apply(() => {
               $scope.mount = mountFiles;
            });
         });
         $scope.selectFile = (node:any) => {
            var file:IFileInfo = node.data;
            $scope.document.extension = file.name.split('.').pop();
            $scope.document.displayName = file.full;
            $scope.document.location = file.full;
            $scope.document.path = file.path;
            if(!file.children || !file.children.length){
               $scope.mapUrl = null;
               platform.readFile(file.full, (data:any) => {
                  platform.setTitle(file.full);
                  $scope.$apply(()=>{
                     $scope.document.data = data;
                  });
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
