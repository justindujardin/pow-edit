// Type definitions for Joint JS 0.9.2
// Project: http://www.jointjs.com/
// Definitions by: Aidan Reel <http://github.com/areel>, David Durman <http://github.com/DavidDurman>, Justin DuJardin <http://github.com/justindujardin>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../backbone/backbone.d.ts" />


declare module joint {

    module dia {

        interface IElementSize {
            width: number;
            height: number;
        }
        interface IElementPosition {
            x: number;
            y: number;
        }
        interface IElementBox extends IElementPosition, IElementSize {
        }

        class Graph extends Backbone.Model {
            initialize();
            fromJSON(json: any);
            clear();
            addCell(cell: Cell);
            addCells(cells: Cell[]);
            getConnectedLinks(cell: Cell, opt?: any): Link[];
            disconnectLinks(cell: Cell);
            removeLinks(cell: Cell);
        }

        class Cell extends Backbone.Model {
            toJSON();
            remove(options?: any);
            toFront();
            toBack();
            embed(cell: Cell);
            unembed(cell: Cell);
            getEmbeddedCells(): Cell[];
            clone(opt?: any): Backbone.Model;      // @todo: return can either be Cell or Cell[].
            attr(attrs: any,opt?:any): Cell;
        }

        class Element extends Cell {
            position(x: number, y: number): Element;
            translate(tx: number, ty?: number): Element;
            resize(width: number, height: number): Element;
            rotate(angle: number, absolute): Element;
        }

        interface IDefaults {
            type: string;
        }

        class Link extends Cell {
            defaults(): IDefaults;
            disconnect(): Link;
            label(idx?: number, value?: any): any;   // @todo: returns either a label under idx or Link if both idx and value were passed
        }

        interface IOptions extends IElementSize {
            gridSize: number;
            perpendicularLinks: boolean;
            elementView: ElementView;
            linkView: LinkView;
        }

        class Paper extends Backbone.View<Backbone.Model> {
            options: IOptions;
            setDimensions(width: number, height: number);
            scale(sx: number, sy?: number, ox?: number, oy?: number): Paper;
            rotate(deg: number, ox?: number, oy?: number): Paper;      // @todo not released yet though it's in the source code already
            findView(el: any): CellView;
            findViewByModel(modelOrId: any): CellView;
            findViewsFromPoint(p:IElementPosition): CellView[];
            findViewsInArea(r: IElementBox): CellView[];
            snapToGrid(p): IElementPosition;
            scaleContentToFit(opts:any);
        }

        class ElementView extends CellView  {
            scale(sx: number, sy: number);
        }

        class CellView extends Backbone.View<Cell> {
            getBBox():IElementBox;
            highlight(el?: any);
            unhighlight(el?: any);
            findMagnet(el: any);
            getSelector(el: any);
        }

        class LinkView extends CellView {
            getConnectionLength(): number;
            getPointAtLength(length: number): { x: number; y: number; };
        }
    
    }

    module ui { }

    module shapes {
        module basic {
            class Generic extends joint.dia.Element {

                processPorts();
            }
            class Rect extends Generic { }
            class Text extends Generic { }
            class Circle extends Generic { }
            class Image extends Generic { }

            interface IPortsModelInterface {
                initialize();
                updatePortsAttrs(eventName:string);
                getPortSelector(name):string;
            }
            var PortsModelInterface:IPortsModelInterface;

            interface IPortsViewInterface {
                initialize();
                renderPorts();
                update();
            }
            var PortsViewInterface:IPortsViewInterface;
        }
    }

    module layout {
        class DirectedGraph {
            static layout(graph:joint.dia.Graph,opts:any);
        }
    }

    module util {
        function uuid(): string;
        function guid(obj: any): string;
        function mixin(objects: any[]): any;
        function supplement(objects: any[]): any;
        function deepMixin(objects: any[]): any;
        function deepSupplement(destination: any,...sources: any[]): any;
    }

}
