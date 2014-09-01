///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>

describe("pow2.editor",()=>{
   var element:ng.IAugmentedJQuery;
   var scope:any;
   beforeEach(module('pow-edit'));
   beforeEach(module('source/editor/directives/tileEditorView.html'));
   beforeEach(inject(($rootScope,$compile:ng.ICompileService) => {
      scope = $rootScope;
      scope.mapUrl = 'base/test/fixtures/example.tmx';
      var tpl:string = '<tile-editor-view url="mapUrl"></tile-editor-view>';
      element = angular.element(tpl);
      $compile(element)(scope);
      $('body').append(element);
      scope.$digest();
   }));
   afterEach(() => {
      element.remove();
      scope.$destroy();
   });


   it("should notify scope of load event",(done)=>{
      scope.$on('map-loaded',()=>{
         done();
      });
      scope.$digest();
   });
});
