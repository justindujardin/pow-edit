///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../build/pow-edit.d.ts"/>

describe("pow2.editor.AppController",()=>{
   var controller:pow2.editor.AppController;
   beforeEach(module('pow-edit'));
   beforeEach(inject(($controller:ng.IControllerService,$rootScope:ng.IRootScopeService) => {
      controller = $controller('AppController',{$scope:$rootScope.$new()});
   }));
   it("should satisfy expected dependencies",()=>{
      expect(controller.$scope).toBeDefined();
      expect(controller.$platform).toBeDefined();
      expect(controller.$tasks).toBeDefined();
   });


   it("should satisfy expected dependencies",()=>{
      expect(controller.$scope).toBeDefined();
      expect(controller.$platform).toBeDefined();
      expect(controller.$tasks).toBeDefined();
   });
});
