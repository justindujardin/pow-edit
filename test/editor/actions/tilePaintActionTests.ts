///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>
///<reference path="../../fixtures/tileEditorFixture.ts"/>

describe("pow2.editor.TilePaintAction",()=>{
   var fix = new pow2.editor.tests.TileEditorFixture();
   describe('constructor',()=>{
      it('should throw an error if invalid arguments are provided',()=>{
         expect(() => {
            new pow2.editor.TilePaintAction(null,null,null,null);
         }).toThrow(new Error(pow2.errors.INVALID_ARGUMENTS));
         expect(() => {
            new pow2.editor.TilePaintAction(fix.editor,null,1337,1);
         }).toThrow(new Error(pow2.errors.INVALID_ARGUMENTS));
         expect(() => {
            new pow2.editor.TilePaintAction(fix.editor,fix.editor.layers[0],1337,1);
         }).toThrow(new Error(pow2.errors.INDEX_OUT_OF_RANGE));
      });
   });
   describe('execute',()=>{
      it('should set visibility of layer',()=>{
         var layer:pow2.editor.IEditableTileLayer = fix.editor.layers[0];
         expect(layer.tiles[0]._gid).toBe(1);
         var act = new pow2.editor.TilePaintAction(fix.editor,fix.editor.layers[0],0,0);
         act.execute();
         expect(layer.tiles[0]._gid).toBe(0);
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.TilePaintAction(fix.editor,fix.editor.layers[0],0,1);
         act.execute();
         expect(act.execute()).toBe(false);
      });
   });
   describe('undo',()=>{
      it('should revert visibility of layer',()=>{
         var layer:pow2.editor.IEditableTileLayer = fix.editor.layers[0];
         expect(layer.tiles[0]._gid).toBe(1);
         var act = new pow2.editor.TilePaintAction(fix.editor,fix.editor.layers[0],0,0);
         act.execute();
         expect(layer.tiles[0]._gid).toBe(0);
         act.undo();
         expect(layer.tiles[0]._gid).toBe(1);
      });
      it('should fail if parent does',()=>{
         var act = new pow2.editor.TilePaintAction(fix.editor,fix.editor.layers[0],0,1);
         expect(act.undo()).toBe(false);
      });
   });
});
