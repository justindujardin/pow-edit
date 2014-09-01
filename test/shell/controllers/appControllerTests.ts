///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>

describe("pow2.editor.AppController",()=>{
   var controller:pow2.editor.AppController;
   // When platform.enumPath is called this is the result array.
   var files:pow2.editor.IFileInfo[] = [];
   // When platform.readFile is called, this is the data that will be returned.
   var selectedFileData:any = null;

   beforeEach(module('pow-edit'));
   beforeEach(inject(($controller:ng.IControllerService,$rootScope:ng.IRootScopeService) => {
      controller = $controller('AppController',{
         $scope:$rootScope.$new(),

         // Mock out IAppPlatform
         $platform:<pow2.editor.IAppPlatform>{
            enumPath: (location:string,cb:(err:any,files?:pow2.editor.IFileInfo[])=>any) => { setTimeout(()=>{ cb(null,files); },100); },
            readFile: (location:string,done:(data:any) => any) => { setTimeout(()=>{ done(selectedFileData); },100); },
            setTitle:(text:string) => {},
            getDirName:(location:string):string => { return location; },
            normalizePath:(url:string):string => { return url; },
            pathAsAppProtocol:(url:string):string => { return url; },
            pathAsFile:(url:string):string => { return url; }
         }
      });
   }));
   it("should satisfy expected dependencies",()=>{
      expect(controller.$scope).toBeDefined();
      expect(controller.$platform).toBeDefined();
      expect(controller.$tasks).toBeDefined();
   });

   it("should fire event when the file system has been enumerated",(done)=>{
      files = [
         {
            name: 'README.md',
            path: '/fixtures/',
            full: '/fixtures/README.md'
         },
         {
            name: '.gitignore',
            path: '/fixtures/',
            full: '/fixtures/.gitignore'
         }
      ];
      controller.$scope.$on('fs-enumerated',()=>{
         done();
      });
   });

   describe('selectFile',()=>{
      it("should update scope document when file system node is selected",(done)=>{
         var file:pow2.editor.IFileInfo = {
            name: 'README.md',
            path: '/fixtures/',
            full: '/fixtures/README.md'
         };
         controller.selectFile(controller.makeNode(file));
         controller.$scope.$on('document-loaded',()=>{
            expect(controller.document.data).toBe(selectedFileData);
            expect(controller.document.url).toBe(file.full);
            done();
         });
      });

   });
});
