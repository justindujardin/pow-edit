///<reference path="../types/angular/angular.d.ts"/>
///<reference path="../types/ace/ace.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   app.controller('PowCodeController', ['$scope','platform',function($scope,platform:IAppPlatform) {
      var UndoManager:any = ace.require("ace/undomanager").UndoManager;
      $scope.history = new UndoManager();
      var file = "directives/aceEditor.ts";
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

//
//      function openFile(path) {
//         if (hasChanged && !saveFileFN(true)) {
//            return false;
//         }
//         if(path) {
//            editor.getSession().setValue(fs.readFileSync(path, "utf8"));
//            hasChanged = false;
//         }
//         else {
//            path = "Untitled";
//            editor.getSession().setValue("");
//         }
//
//         currentFile = path;
//         $("title").text(currentFile);
//      }
//      function saveasDialog(name) {
//         var chooser = $(name);
//         chooser.trigger('click');
//         chooser.change(function(evt) {
//            var saveFilename = $(this).val();
//            currentFile = saveFilename;
//            hasChanged = true;
//            saveFileFN();
//         });
//      }
//      function saveFileFN() {
//         if (/*hasChanged &&*/ currentFile !== "Untitled") {
//            var data = editor.getSession().getValue(); //.replace(/\n/g,"\r\n");
//            if(currentFile == "Untitled"){
//               saveasDialog('#saveasDialog');
//            }else{
//               fs.writeFileSync(currentFile, data, "utf8");
//               $("title").text(currentFile);
//               hasChanged = false;
//            }
//         }else{
//            saveasDialog('#saveasDialog');
//         }
//      }
   }]);

}
