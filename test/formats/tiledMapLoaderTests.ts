///<reference path="../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../assets/build/pow-edit.d.ts"/>

module pow2.editor.tests {
   describe("pow2.editor.TiledMapLoader",()=>{
      var loader:pow2.editor.TiledMapLoader = null;
      beforeEach((done)=>{
         inject(($injector)=>{
            loader = $injector.instantiate(pow2.editor.TiledMapLoader);
            done();
         });
      });
      describe('load',()=>{
         it('should succeed on valid file',(done)=>{
            loader.load('base/test/fixtures/example.tmx').then((map:pow2.editor.PowTileMap)=>{
               expect(map).not.toBeNull();
               done();
            });
         });
      });
   });
}