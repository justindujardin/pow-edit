/**
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

   /**
    * Describe an editable document's
    */
   export interface IDocument {
      /**
       * Is it modified?
       */
      dirty:boolean;

      /**
       * The typename, e.g. markdown or image.
       */
      type:string;

      /**
       * Just the filename, e.g. README.md
       */
      file:string;

      /**
       * The file extension without a period, e.g. 'md'
       */
      extension:string;

      /**
       * The path the file resides in, e.g. '/foo/bar/'
       */
      path:string;

      /**
       * The full URL of the document, e.g. '/foo/bar/README.md'
       */
      url:string;

      /**
       * The data of the document if loaded, or null.
       */
      data:any;
   }
}
