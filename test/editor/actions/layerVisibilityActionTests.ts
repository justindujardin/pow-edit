///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>
///<reference path="../../fixtures/tileEditorFixture.ts"/>

describe("pow2.editor.LayerVisibilityAction",()=>{

   var fix = new pow2.editor.tests.TileEditorFixture();
   describe('constructor',()=>{
      it('should throw an error if the specified layer index is out of range',()=>{
         expect(() => {
            new pow2.editor.LayerVisibilityAction(fix.editor,1337,false);
         }).toThrow(new Error(pow2.errors.INDEX_OUT_OF_RANGE));
      });
   });
   describe('execute',()=>{
      it('should set visibility of layer',()=>{
         expect(fix.editor.layers[0].objects.visible).toBe(true);
         fix.editor.$actions.executeAction(new pow2.editor.LayerVisibilityAction(fix.editor,0,false));
         expect(fix.editor.layers[0].objects.visible).toBe(false);
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.LayerVisibilityAction(fix.editor,0,false);
         act.execute();
         expect(act.execute()).toBe(false);
      });
   });
   describe('undo',()=>{
      it('should revert visibility of layer',()=>{
         var act = new pow2.editor.LayerVisibilityAction(fix.editor,0,false);
         expect(fix.editor.layers[0].objects.visible).toBe(true);
         fix.editor.$actions.executeAction(act);
         act.undo();
         expect(fix.editor.layers[0].objects.visible).toBe(true);
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.LayerVisibilityAction(fix.editor,0,false);
         expect(act.undo()).toBe(false);
      });
   });
});
