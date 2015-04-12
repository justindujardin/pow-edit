///<reference path="../../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../../assets/build/pow-edit.d.ts"/>


/**
 * TODO: Update Scaffolding Test
 *
 * This test is only set up to very crudely wire together an async check
 * for loading an existing TMX map.  It should be updated, and the tile
 * editor class should be refactored as tests are added.
 *
 */

describe("pow2.editor", ()=> {
  var element:ng.IAugmentedJQuery;
  var scope:any;
  var editor:pow2.editor.TileEditorController = null;
  beforeEach(module('pow-edit'));
  beforeEach(module('source/editors/tile/directives/tileEditorView.html'));
  beforeEach(inject(($rootScope, $compile:ng.ICompileService) => {
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


  it("should notify scope of load event", (done)=> {
    scope.$on('map-loaded', ()=> {
      done();
    });
    scope.$digest();
  });
  it("should bind map to url attribute changes", (done)=> {
    var off = scope.$on('map-loaded', ()=> {
      expect(editor.tileMap.name).toBe(scope.mapUrl);
      off();
      off = scope.$on('map-loaded', ()=> {
        expect(editor.tileMap.name).toBe(scope.mapUrl);
        done();
      });
      scope.mapUrl = 'base/test/fixtures/example2.tmx';
      scope.$digest();
    });
    scope.$digest();
  });
});
