///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../build/pow-edit.d.ts"/>

describe("pow2.shell.AppController",()=>{
   var controller:any;
   beforeEach(module('pow-edit'));
   beforeEach(inject(($controller:ng.IControllerService,$rootScope:ng.IRootScopeService) => {
      controller = $controller('AppController',{$scope:$rootScope.$new()});
   }));
   it("should instantiate without error",()=>{
      expect(controller.$scope).toBeDefined();
   });
});
