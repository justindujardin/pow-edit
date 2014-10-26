///<reference path="../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../types/angular/angular-mocks.d.ts"/>
///<reference path="../../assets/build/pow-edit.d.ts"/>

module pow2.editor.tests {
   export class FailAction extends pow2.editor.BaseAction {
      constructor(
         public failExecute:boolean = true,
         public failUndo:boolean = true
         ){
         super();
      }
      execute():boolean {
         return !this.failExecute;
      }
      undo():boolean {
         return !this.failUndo;
      }
   }
}

describe("pow2.editor.BaseAction",()=>{
   describe('execute',()=>{
      it('should fail to execute twice',()=>{
         var act = new pow2.editor.BaseAction();
         expect(act.execute()).toBe(true);
         expect(act.execute()).toBe(false);
      });
   });
   describe('undo',()=>{
      it('should fail to undo twice',()=>{
         var act = new pow2.editor.BaseAction();
         expect(act.execute()).toBe(true);
         expect(act.undo()).toBe(true);
         expect(act.undo()).toBe(false);
      });
   });
});

describe("pow2.editor.ActionManager",()=>{
   var actions:pow2.editor.IActionManager = null;
   var scope:any = null;
   beforeEach(module('pow-edit'));
   beforeEach(inject(($rootScope:ng.IRootScopeService) => {
      actions = new pow2.editor.ActionManager();
      scope = $rootScope;
   }));

   afterEach(()=>{
      actions.clear();
   });

   describe('clear',()=>{
      it('should clear all undo and redo history',()=>{
         expect(actions.getUndoCount()).toBe(0);
         expect(actions.executeAction(new pow2.editor.BaseAction())).toBe(true);
         expect(actions.executeAction(new pow2.editor.BaseAction())).toBe(true);
         actions.undo();

         expect(actions.getUndoCount()).toBe(1);
         expect(actions.getRedoCount()).toBe(1);
         actions.clear();
         expect(actions.getUndoCount()).toBe(0);
         expect(actions.getRedoCount()).toBe(0);
      });
   });
   describe('redo',()=>{
      it('should return null if no items exist in history',()=>{
         expect(actions.redo()).toBe(null);
      });
      it('should return null if redo action fails to execute',()=>{
         var act = new pow2.editor.tests.FailAction(false,false);
         expect(actions.executeAction(act)).toBe(true);
         expect(actions.undo()).not.toBe(null);
         act.failExecute = true;
         expect(actions.redo()).toBe(null);
      });
      it('should execute first item in redo history',()=>{
         expect(actions.getUndoCount()).toBe(0);
         expect(actions.executeAction(new pow2.editor.BaseAction('first'))).toBe(true);
         expect(actions.executeAction(new pow2.editor.BaseAction('second'))).toBe(true);
         actions.undo();
         var act = actions.redo();
         expect(act).not.toBe(null);
         expect(act.name).toBe('second');
         expect(actions.getUndoCount()).toBe(2);
      });
   });
   describe('undo',()=>{
      it('should return null if no items exist in history',()=>{
         expect(actions.undo()).toBe(null);
      });
      it('should return null if undo action fails to execute',()=>{
         var act = new pow2.editor.tests.FailAction(false,false);
         actions.executeAction(act);
         act.failUndo = true;
         expect(actions.undo()).toBe(null);
      });
   });

   describe('getUndoCount',()=>{
      it('should return the number of items in the undo history',()=>{
         expect(actions.getUndoCount()).toBe(0);
         actions.executeAction(new pow2.editor.BaseAction());
         expect(actions.getUndoCount()).toBe(1);
      });
   });
   describe('getRedoCount',()=>{
      it('should return the number of items in the undo history',()=>{
         expect(actions.getRedoCount()).toBe(0);
         actions.executeAction(new pow2.editor.BaseAction());
         actions.undo();
         expect(actions.getRedoCount()).toBe(1);
      });
   });

   describe('getUndoName',()=>{
      it('should return the action name at the given index',()=>{
         actions.executeAction(new pow2.editor.BaseAction('test'));
         expect(actions.getUndoName(0)).toBe('test');
      });
      it('should return empty string for invalid an invalid index',()=>{
         expect(actions.getUndoName(0)).toBe('');
      });
   });
   describe('getRedoName',()=>{
      it('should return the action name at the given index',()=>{
         actions.executeAction(new pow2.editor.BaseAction('test'));
         actions.undo();
         expect(actions.getRedoName(0)).toBe('test');
      });
      it('should return empty string for invalid an invalid index',()=>{
         expect(actions.getRedoName(0)).toBe('');
      });
   });

   describe('executeAction',()=>{
      it("should push new item on to undo list if successful",()=>{
         var act:pow2.editor.IAction = new pow2.editor.BaseAction();
         expect(actions.getUndoCount()).toBe(0);
         expect(actions.executeAction(act)).toBe(true);
         expect(actions.getUndoCount()).toBe(1);
      });
      it("should return false if an action fails to execute",()=>{
         expect(actions.executeAction(new pow2.editor.tests.FailAction())).toBe(false);
         expect(actions.getUndoCount()).toBe(0);
      });
      it("should invalidate any redo history when a new action is executed",()=>{
         expect(actions.executeAction(new pow2.editor.BaseAction())).toBe(true);
         actions.undo();
         expect(actions.getRedoCount()).toBe(1);
         expect(actions.executeAction(new pow2.editor.BaseAction())).toBe(true);
         expect(actions.getRedoCount()).toBe(0);
      });
   });

});
