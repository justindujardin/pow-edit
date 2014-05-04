///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {

   app.controller('AppController', [
      '$scope',
      'platform',
      'rootPath',
      function($scope,platform:IAppPlatform,rootPath) {

         $scope.document = {
            extension:'',
            displayName:'',
            path:'',
            type:''
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

         // DUHHH THIS IS HORRIBLE.  Hardcode startup map
         var file = "assets/maps/eburp/wilderness.tmx";
         platform.setTitle(file);
         $scope.mapUrl = file;
         // DUHHHH END


      }
   ]);
}
