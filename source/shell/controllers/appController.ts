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
///<reference path="../../interfaces/IDocument.ts"/>

module pow2.editor {

   declare var requestAnimFrame:any;

   export class AppController {
      static $inject:string[] = [
         '$scope',
         '$tasks',
         '$platform',
         'rootPath'
      ];

      //
      // Notable Binding Variables
      //
      /**
       * The active document.
       *
       * TODO: Multiple documents, maintain some kind of rolling
       * window of in memory caches for quick navigation.
       */
      public document:IDocument;


      /**
       * The template url to a context-sensitive menu for editing.
       */
      public editMenuTemplateUrl:string = null;

      /**
       * Reference to the TileEditorController of the active document.
       * @type {pow2.editor.TileEditorController}
       */
      public editor:TileEditorController = null;

      private _id:number = 1337;
      constructor(public $scope:any,
                  public $tasks:TasksService,
                  public $platform:IAppPlatform,
                  public rootPath:string){

         // ENUMERATE Files for Tree
         $platform.enumPath(rootPath + 'maps/',(error:any,fileList?:IFileInfo[]) => {
            var mountFiles:any[] = [];
            angular.forEach(fileList,(file:IFileInfo) => {
               // Skip hidden files
               if(file.name[0] === '.'){
                  return;
               }
               mountFiles.push(this.makeNode(file,0));
            });
            $scope.mount = mountFiles;
            $scope.$$phase || $scope.$digest();
            $scope.$emit('fs-enumerated');
         });
         // ACT when clicking on Files in tree


         // Expose information about the current document.
         //
         // TODO: Document manager.  Should support multiple
         // documents AND have a notion of the active one.
         this.document = {
            extension:'md',
            type:this.getDocumentType('md'),
            dirty:false,
            file:'about.md',
            url:rootPath + 'about.md',
            path:rootPath,
            data:null
         };

         // TODO: Use pow time class for RAF updates.
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
         $scope.$on("$destroy", function() {
            scopeDestroyed = true;
         });
         return this;
      }

      getDocumentType (type:string = this.document.extension):string {
         switch(type.toLowerCase()){
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
      }

      makeNode(file:IFileInfo,depth:number=0) {
         var result:any = {
            label: file.name,
            id:this._id++,
            data:file,
            depth:depth
         };
         if(file.children){
            result.children = file.children.map((f:IFileInfo) => {
               return this.makeNode(f,depth+1);
            });
         }
         return result;
      }
      selectFile(node:any) {
         var file:IFileInfo = node.data;
         this.document.extension = file.name.split('.').pop();
         this.document.file = file.name;
         this.document.url = file.full;
         this.document.path = file.path;
         this.document.data = null;
         if(!file.children || !file.children.length){
            this.$scope.mapUrl = null;
            this.$platform.readFile(file.full, (data:any) => {
               this.$platform.setTitle(file.full);
               this.document.data = data;
               this.document.type = this.getDocumentType(this.document.extension);
               this.$scope.$$phase || this.$scope.$digest();
               this.$scope.$emit('document-loaded');
            });
         }
      }
   }

   app.controller('AppController', AppController);
}
