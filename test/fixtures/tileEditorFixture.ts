///<reference path="../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../assets/build/pow-edit.d.ts"/>

module pow2.editor.tests {
   export class TileEditorFixture {
      public scope:any = null;
      public editor:pow2.editor.TileEditorController = null;
      public element:ng.IAugmentedJQuery;
      constructor() {
         beforeEach(module('pow-edit','source/editor/directives/tileEditorView.html','source/editor/directives/tileEditorToolboxView.html'));
         beforeEach((done)=>{
            inject(($rootScope:ng.IRootScopeService,$compile) => {
               this.scope = $rootScope;
               this.scope.mapUrl = 'base/test/fixtures/example.tmx';
               var tpl:string = '<tile-editor-view url="mapUrl"></tile-editor-view>';
               this.element = angular.element(tpl);
               $compile(this.element)(this.scope);
               $('body').append(this.element);
               this.scope.$on('map-loaded',()=>{
                  done();
               });
               this.scope.$digest();
               this.editor = <pow2.editor.TileEditorController>this.element.controller('tileEditorView');
            });
         });
         afterEach(() => {
            this.element.remove();
            this.scope.$destroy();
            this.editor.destroy();
         });
      }
   }
}