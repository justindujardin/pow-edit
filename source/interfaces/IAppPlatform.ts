/*
 Copyright (C) 2014 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

module pow2.editor {

   export interface IAppPlatform {
      readFile(location:string,done:(data:any) => any);
      writeFile(location:string,data:any,done:(error:any)=>any);

      setTitle(text:string);
      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any);
      getDirName(location:string):string;

      normalizePath(url:string):string;

      pathAsAppProtocol(url:string):string;
      pathAsFile(url:string):string;
   }

   export interface IFileInfo {
      /**
       * name
       */
      name:string;
      /**
       * path
       */
      path:string;
      /**
       * path.join(path,name)
       */
      full:string;
      /**
       * "directory" or "file"
       */
      type?:string;
      /**
       * Only used for directories.
       */
      children?:IFileInfo[];
   }

}