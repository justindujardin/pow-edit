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
