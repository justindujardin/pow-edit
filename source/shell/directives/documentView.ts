///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("documentView", [() => {
      return {
         restrict: "E",
         replace: true,
         transclude:true,
         controller: DocumentViewController,
         controllerAs:"loading",
         templateUrl: 'source/directives/documentView.html'
      };
   }]);

   /**
    * Document view controller.  Has utilities for displaying loading progress
    * and other stuff (TBD).
    */
   export class DocumentViewController {
      public visible:boolean = false;
      public title:string = '';
      public details:string = '';
      public total:number = 0;
      public current:number = 0;
      public barStyle:{
         [key:string]:any
      } = {};

      private _reset(){
         this.visible = false;
         this.current = this.total = 0;
         this.title = this.details = '';
         this._updateProgressStyle();
      }

      private _updateProgressStyle() {
         var value = (this.total > 0) ? ((this.current / this.total) * 100) : 0;
         this.barStyle = {width:value + "%"};
      }

      showLoading(title?:string,details?:string){
         this._reset();
         if(typeof title !== 'undefined'){
            this.title = title;
         }
         if(typeof details !== 'undefined'){
            this.details = details;
         }
         this.visible = true;
      }
      hideLoading(){
         this._reset();
      }
      setLoadingTitle(title:string){
         this.title = title;
      }
      setLoadingDetails(details:string){
         this.details = details;
      }
      setTotal(value:number){
         this.total = value;
         this._updateProgressStyle();
      }
      setCurrent(value:number){
         this.current = value;
         this._updateProgressStyle();
      }

   }

}
