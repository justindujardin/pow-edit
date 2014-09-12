///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>
///<reference path="../../fixtures/tileEditorFixture.ts"/>

describe("pow2.editor.LayerSelectAction",()=>{
   var fix = new pow2.editor.tests.TileEditorFixture();
   describe('constructor',()=>{
      it('should throw an error if the specified layer index is out of range',()=>{
         expect(() => {
            new pow2.editor.LayerSelectAction(fix.editor,1337);
         }).toThrow(new Error(pow2.errors.INDEX_OUT_OF_RANGE));
      });
   });
   describe('execute',()=>{
      it('should modify the active layer for an active tile editor',()=>{
         expect(fix.editor.activeLayerIndex).toBe(0);
         fix.editor.$actions.executeAction(new pow2.editor.LayerSelectAction(fix.editor,1));
         expect(fix.editor.activeLayerIndex).toBe(1);
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.LayerSelectAction(fix.editor,0);
         act.execute();
         expect(act.execute()).toBe(false);
      });
   });
   describe('undo',()=>{
      it('should revert the active layer to its previous value',()=>{
         expect(fix.editor.activeLayerIndex).toBe(0);
         fix.editor.$actions.executeAction(new pow2.editor.LayerSelectAction(fix.editor,1));
         expect(fix.editor.activeLayerIndex).toBe(1);
         fix.editor.$actions.undo();
         expect(fix.editor.activeLayerIndex).toBe(0);
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.LayerSelectAction(fix.editor,0);
         expect(act.undo()).toBe(false);
      });
   });
});
