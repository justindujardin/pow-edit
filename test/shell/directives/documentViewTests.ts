///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../build/pow-edit.d.ts"/>

describe("pow2.editor.documentView",()=>{
   var element:ng.IAugmentedJQuery;
   var scope:any;
   var compile:ng.ICompileService;
   var dvc:pow2.editor.DocumentViewController;

   beforeEach(module('pow-edit'));
   beforeEach(module('source/shell/directives/documentView.html'));
   beforeEach(inject(($rootScope,$compile:ng.ICompileService,$platform) => {
      scope = $rootScope.$new();
      compile = $compile;
      scope.document = {
         location:"base/test/fixtures/example.tmx",
         type:'tiled'
      };
      var tpl:string = '<document-view source="document"></document-view>';
      element = angular.element(tpl);
      compile(element)(scope);
      $('body').append(element);
      scope.$digest();
      dvc = <any>element.controller('documentView');
   }));
   afterEach(() => {
      element.remove();
      scope.$destroy();
   });

   it("should expose DocumentViewController",()=>{
      expect(dvc).toBeTruthy();
   });

   describe('DocumentViewController',()=>{
      describe('showLoading',()=>{
         it('should display a human readable description of a long running operation',()=>{
            dvc.showLoading('title','details');
            expect(dvc.title).toBe('title');
            expect(dvc.details).toBe('details');
            expect(dvc.visible).toBe(true);
         });
      });
      describe('hideLoading',()=>{
         it('should reset and hide an existing loading notification',()=>{
            dvc.showLoading('title','details');
            expect(dvc.title).toBe('title');
            expect(dvc.details).toBe('details');
            expect(dvc.visible).toBe(true);
            dvc.hideLoading();
            expect(dvc.title).toBe('');
            expect(dvc.details).toBe('');
            expect(dvc.visible).toBe(false);
         });
      });
      describe('setLoadingTitle',()=> {
         it('should set a title message describing a long running operation', ()=> {
            expect(dvc.title).toBe('');
            dvc.setLoadingTitle('new');
            expect(dvc.title).toBe('new');
         });
      });
      describe('setLoadingDetails',()=> {
         it('should set detailed information about  a long running operation', ()=> {
            expect(dvc.details).toBe('');
            dvc.setLoadingDetails('new2');
            expect(dvc.details).toBe('new2');
         });
      });

      describe('getPercent',()=> {
         it('should return the completion percentage based on current and total values', ()=> {
            expect(dvc.getPercent()).toBe(0);
            dvc.setCurrent(10);
            dvc.setTotal(10);
            expect(dvc.getPercent()).toBe(100);
         });
      });
      describe('setCurrent',()=> {
         it('should set the current number thing that is being done', ()=> {
            expect(dvc.current).toBe(0);
            dvc.setCurrent(10);
            expect(dvc.current).toBe(10);
         });
      });
      describe('setTotal',()=> {
         it('should set the total number of things to be done', ()=> {
            expect(dvc.total).toBe(0);
            dvc.setTotal(10);
            expect(dvc.total).toBe(10);
         });
      });

   });

});
