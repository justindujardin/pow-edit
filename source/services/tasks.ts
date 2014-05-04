///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>

module pow2.editor {

   export interface IWorkTask {
      elapsed?: number;
      work:() => boolean; // The work function
      done?:(config:IWorkTask) => void;
   }

   export class TasksService {
      static DEFAULT:string = "global";
      static EVENTS = {
         Started: "start",
         Stopped: "stop",
         Repeated: "repeat"
      };
      private _tasks:{
         [group:string]:IWorkTask[]
      } = {};

      add(work:() => boolean,group:string=TasksService.DEFAULT) {
         this.addTask(<any>{
            work:work
         },group);
      }
      addTask(task:IWorkTask,group:string=TasksService.DEFAULT) {
         task.elapsed = 0;
         if(typeof task.work !== 'function'){
            throw new Error("Invalid work function");
         }
         if(typeof this._tasks[group] === 'undefined'){
            this._tasks[group] = [];
         }
         this._tasks[group].push(task);
      }
      killTaskGroup(group:string=TasksService.DEFAULT){
         var count:number = this._tasks[group] ? this._tasks[group].length : 0;
         console.log("killing (" + count + ") tasks from group (" + group + ")");
         this._tasks[group] = [];
      }

      getRemainingTasks(group:string=TasksService.DEFAULT):number {
         return this._tasks[group] ? this._tasks[group].length : 0;
      }

      processTasks():number {
         var tasksCompleted:number = 0;
         // Take one task from each group per invocation.
         // TODO: something better.
         _.each(this._tasks,(tasks:IWorkTask[],group:string) => {
            if(!tasks || tasks.length === 0){
               return;
            }
            if(tasks[0].work() === true){
               tasksCompleted++;
               var task = tasks.shift();
               task.done && task.done(task);
            }
         });
         return tasksCompleted;
      }
   }

   pow2.editor.app.factory("$tasks", () => { return new TasksService(); });
}
