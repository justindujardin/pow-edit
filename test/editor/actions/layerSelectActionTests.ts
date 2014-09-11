///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>

describe("pow2.editor.LayerSelectAction",()=>{
   var scope:any = null;
   var editor:pow2.editor.TileEditorController = null;
   var element:ng.IAugmentedJQuery;

   beforeEach(module('pow-edit','source/editor/directives/tileEditorView.html'));
   beforeEach(inject(($actions:pow2.editor.IActionsService,$rootScope:ng.IRootScopeService,$compile) => {
      scope = $rootScope;
      scope.mapUrl = 'base/test/fixtures/example.tmx';
      var tpl:string = '<tile-editor-view url="mapUrl"></tile-editor-view>';
      element = angular.element(tpl);
      $compile(element)(scope);
      $('body').append(element);
      scope.$digest();
      editor = <pow2.editor.TileEditorController>element.controller('tileEditorView');
   }));

   afterEach(() => {
      element.remove();
      scope.$destroy();
   });

   describe('constructor',()=>{
      it('should throw an error if the specified layer index is out of range',()=>{
         expect(() => {
            new pow2.editor.LayerSelectAction(editor,1337);
         }).toThrow(new Error(pow2.errors.INDEX_OUT_OF_RANGE));
      });
   });
   describe('execute',()=>{
      it('should modify the active layer for an active tile editor',(done)=>{
         scope.$on('map-loaded',()=>{
            expect(editor.activeLayerIndex).toBe(0);
            editor.$actions.executeAction(new pow2.editor.LayerSelectAction(editor,1));
            expect(editor.activeLayerIndex).toBe(1);
            done();
         });
         scope.$digest();
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.LayerSelectAction(editor,0);
         act.execute();
         expect(act.execute()).toBe(false);
      });
   });
   describe('undo',()=>{
      it('should revert the active layer to its previous value',(done)=>{
         scope.$on('map-loaded',()=>{
            expect(editor.activeLayerIndex).toBe(0);
            editor.$actions.executeAction(new pow2.editor.LayerSelectAction(editor,1));
            expect(editor.activeLayerIndex).toBe(1);
            editor.$actions.undo();
            expect(editor.activeLayerIndex).toBe(0);
            done();
         });
         scope.$digest();
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.LayerSelectAction(editor,0);
         expect(act.undo()).toBe(false);
      });
   });
});
