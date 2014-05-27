pow-edit
---

A tile map editor for the future... Someday.  Written in TypeScript using Angular and LESS.

> Nothing to see here, yet.  Move along.

## Prerequisites

The things you'll need.

### Node Webkit

Grab a prebuilt v0.9.2 binary and put it in the root of this checkout, if you don't know what node-webkit is.

* Linux: [32bit](http://dl.node-webkit.org/v0.9.2/node-webkit-v0.9.2-linux-ia32.tar.gz) / [64bit](http://dl.node-webkit.org/v0.9.2/node-webkit-v0.9.2-linux-x64.tar.gz)
* Windows: [win32](http://dl.node-webkit.org/v0.9.2/node-webkit-v0.9.2-win-ia32.zip)
* Mac: [32bit, 10.7+](http://dl.node-webkit.org/v0.9.2/node-webkit-v0.9.2-osx-ia32.zip)

### Grunt and Bower

Grunt js and bower are required to use the developer workflow.  Install them globally using npm.  You may need to `sudo` on OSX.

> npm install -g grunt bower


### Developing

 - Make sure npm and bower modules are all installed (`npm install && bower install`)
 - Run develop task to start automated build process (`grunt develop`)
 - Run the node-webkit application in the root path.


### Props

Open Source Components:

 - Font Awesome by Dave Gandy - http://fontawesome.io
 - Ace editor : http://ace.c9.io/
 - Source Code Pro font : http://blogs.adobe.com/typblography/2012/09/source-code-pro.html
 - Typescript definitions for Ace, Angular, Jquery, and Node.JS : https://github.com/borisyankov/DefinitelyTyped
