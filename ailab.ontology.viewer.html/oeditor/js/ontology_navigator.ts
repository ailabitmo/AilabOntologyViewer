/// <reference path="klib.d.ts"/>
/// <reference path="primitives.d.ts"/>
/// <reference path="d3.d.ts"/>
/// <reference path="svgui.d.ts"/>
module Ontology {
    var idCounter = 0;
    function generateUniqueId(): string {
        return (++idCounter).toString();
    }

    /**
     * Get either label or modified URI
     */
    function getName(uri, label) {
        if (label && label.length > 0) return label;
        else return uri2Name(uri);
    }

    function uri2Name(uri: string) {
        //We get info after last slash (usually it is the best)
        //Anonym URI's usually don't contain /
        if (uri.indexOf("/") != -1) return uri.substring(uri.lastIndexOf('/') + 1);
        return uri;
    }

    /**
     * Check collection for name of some object
     */
    function getNameFromCollection(uri: string, collection: any) {
        if (uri in collection) return (containsInObj(collection[uri], 'label')) ? getName(uri, collection[uri].label) : uri2Name(uri);
        else return uri2Name(uri);
    }

    var tooltip = kiv.tooltip("tooltip");

    interface AbstractIndicator {
        error: () => void;
        remove: () => void;
        status: (text: string) => void;
    }

    /**
     * Types of possible elements in the tree.
     */
    enum ElementType {
        /** Object instance. Round rectangle in initial design */
        instance,
        /** Object property (link). Simple text combined with a line in initial design */
        objProperty,
        /** Loader. Element with loading animation, possibility to cancel it and information text. Can't have children */
        loader,
        /** Pagination element. Can't have children */
        paginator
    }

    interface Element {
        type: ElementType;
        /** globally unique id of element to identify it */
        uniqueId: string;
        parent?: AggregatingElement;
        /** Field of ui related structures. Needed to calc height for example. */
        ui?: any;
        /** Not null if there was a request for loading children  */
        pageRequest?: kiv.SmartServerRequest;
        /** Children's page loading indicator instance */
        pageIndicator?: any;
        x?: number;
        y?: number;
    }

    interface AggregatingElement extends Element {
        /** [*] Children are forming tree structure. * - is needed for d3 */
        children: Element[];
        /** color of element */
        color: D3.Color.Color;
    }

    interface Instance extends AggregatingElement {
        uniqueId: string;
        /** id of instance */
        id: string;
        /** some error occured during forming instance. We do not show ears on error'd nodes */
        error: any;
        /** name of instance (label or substring of id) */
        name: string;
        /** if true - data properties are visible, else data props are hidden */
        expanded: boolean;
        /** Class id's of instance */
        class: string[];
        /** Data property id's of instance */
        dataProps: string[];
        /** Ui field if expanded is true */
        uiExpanded: any;
        /** If data properties were not loaded - it is false, else it is true */
        dpLoaded: boolean;
        /** Data properties loading indicator *model* */
        dataIndicator: any;
        /** Instance was discarded by loading another page within it's parent */
        wasDiscarded: boolean;
        label?: string;
    }

    interface ObjProperty extends AggregatingElement {
        uniqueId: string;
        /** id of object property */
        objPropId: string;
        /** name of object property */
        name: string;
        /** property direction (either "IN" or "OUT") */
        direction: string;
    }

    interface Loader extends Element, AbstractIndicator {
        uniqueId: string;
        /** String with information about loading */
        info: string;
        /** true if any error occured during remote request, otherwise false */
        isErrorOccurred: boolean;
        isRemoved: boolean;
    }

    interface Paginator extends Element {
        uniqueId: string;
        /** current page of the indicator */
        currentPage: number;
        /** overall number of pages */
        overallPages: number;
        /** current limit */
        limit: number;
    }

    function willBeDiscarded(model: Element) {
        if (model.type != ElementType.instance && model.type != ElementType.objProperty) { return false; }
        return model.parent && model.parent.pageRequest &&
            (model.parent.pageRequest.isRunning || model.parent.pageRequest.isFailed);
    }

    export class PagedViewer {
        nodeWidth = 330;
        nodeDiff = 100;
        heightBetweenNodesOfOneParent = 10;
        heightBetweenNodesOfDifferentParent = 40;
        animdur = 500;
        buttonWidth = 15;
        discardAnimDuration = 200;
        childrenLoaderSize = 30;
        pageIndicatorSize = 40;
        tooltiper = tooltip;

        pageLimitForObjectProperties = 15;
        pageLimitForInstances = 10;

        private w = 1200;
        private h = 800;

        /** unique pageviewer id */
        private graphId = generateUniqueId();
        /** svg root */
        private svg: D3.Selection;
        /** zoomer contains zooming viewpoint */
        private zoomer: kiv.ZoomingArea;
        /** zooming group is here to place elements */
        private panel: D3.Selection;
        /** ROOT of the tree */
        private mainRoot: any;

        private tree: D3.Layout.TreeLayout;
        private diagonal = d3.svg.diagonal().projection(function (d) {
            return [d.y, d.x];
        });

        private idOfInstance: string;
        private sparqlEndpoint: string;
        private service: string;

        private Oclasses = {}; // known classes
        private arrayOfClassVals = null; // cached array of class values
        private arrayOfClassKeys = null; // cached array of class keys
        private objectProperties = {}; //known object properties
        private arrayOfObjectPropVals = null; //array of object property valuess
        private arrayOfObjectPropKeys = null; //array of object property keys
        private dataTypeProperties = {}; // known data properties
        private arrayOfDataPropsVals = null; // array of data properties values

        private classColorGetter = kiv.colorHelper();//choose color by set of classes

        constructor(width?: number, height?: number) {
            if (width) { this.w = width; }
            if (height) { this.h = height; }
            this.tree = d3.layout.tree()
                .nodeSize([1, this.nodeWidth])
                .separation((a, b) => this.separationFunc(<any>a, <any>b));
        }

        render(container: HTMLElement, idOfInstance: string, sparqlEndpoint: string, service: string) {
            this.resetState();
            this.idOfInstance = idOfInstance;
            this.sparqlEndpoint = sparqlEndpoint;
            this.service = service;

            this.svg = d3.select(container).text("")
                .append("svg:svg")
                .attr("width", this.w)
                .attr("height", this.h)
                .attr("pointer-events", "all");

            var zoomPart = formD3ChainCalls(this.svg, "g#zoom_part" + this.graphId + "|id'zoom_part" + this.graphId);
            this.zoomer = kiv.zoomingArea(this.w, this.h, zoomPart, 'white', [0.6, 2], d3.rgb(252, 252, 252).toString());
            this.zoomer.getOuterGroup().on("dblclick.zoom", null);
            this.panel = this.zoomer.getZoomingGroup();

            this.initialRootRequest();
        }

        private nodeInnerWidth() {
            return this.nodeWidth - this.nodeDiff;
        }

        /**
         * Separation functions between neighbouring leafs of the tree
         */
        private separationFunc(a: Element, b: Element) {
            var height1 = this.calcHeight(a);
            var height2 = this.calcHeight(b);
            var diff = height1 / 2 + height2 / 2 + (a.parent == b.parent
                ? this.heightBetweenNodesOfOneParent : this.heightBetweenNodesOfDifferentParent);
            return diff;
        }

        private calcHeight(element: Element): number {
            //We are calculating height depending on the element type differently
            if (element.type == ElementType.instance) {
                var instance = <Instance>element;
                return instance.expanded ? instance.uiExpanded.height(this.nodeInnerWidth()) : element.ui.height(this.nodeInnerWidth());
            } else if (element.type == ElementType.objProperty) {
                return element.ui.height(this.nodeInnerWidth()) + 30;
            } else if (element.type == ElementType.paginator) {
                return 35;
            } else if (element.type == ElementType.loader) {
                return this.childrenLoaderSize;
            }
        }

        /**
         * Resetting state of the tree
         */
        private resetState() {
            this.Oclasses = {};                // known classes
            this.arrayOfClassVals = null;      // cached array of class values
            this.arrayOfClassKeys = null;      // cached array of class keys
            this.objectProperties = {};        // known object properties
            this.arrayOfObjectPropVals = null; // array of object property values
            this.arrayOfObjectPropKeys = null; // array of object property keys
            this.dataTypeProperties = {};      // known data properties
            this.arrayOfDataPropsVals = null;  // array of data properties values

            this.classColorGetter = kiv.colorHelper();
            this.svg = null;
            this.zoomer = null;
            this.mainRoot = null;
            this.panel = null;
        }

        private paintAll() {
            var nodes = this.tree.nodes(this.mainRoot);
            var links = this.tree.links(nodes);

            setParent(this.mainRoot);

            this.paintLinks(links);
            this.paintNodes(nodes);

            /** Setting parents for each element */
            function setParent(node) {
                if ('children' in node) {
                    for (var index in node.children) {
                        node.children[index].parent = node;
                        setParent(node.children[index]);
                    }
                }
            }
        }

        private paintLinks(links: D3.Layout.GraphLink[]) {
            var forLinks = formD3ChainCalls(this.panel, "g#linkers"+this.graphId+"|id'linkers"+this.graphId);
            var update = forLinks.selectAll(".link").data(links, function (d) {return d.source.uniqueId + "_" + d.target.uniqueId;});
            var enter = update.enter();
            var exit = update.exit();

            enter.append("path").attr("class", "link").attr('stroke', function (d) {
                if (d.source.type == ElementType.instance) return d.source.color;
                else if (d.source.type == ElementType.objProperty) return d.source.parent.color;
            }).style('opacity', 0);

            exit.filter(function (d) { return !d.target.wasDiscarded; })
                .transition().duration(this.animdur).attr("d", (d) => {
                    var o = {x: d.target.x, y: d.target.y};
                    return this.diagonal({source: o, target: o});
                }).style('opacity', 0).remove();
            exit.filter(function (d) { return d.target.wasDiscarded; }).remove();

            update.transition().duration((d) => { return willBeDiscarded(d.target) ? this.discardAnimDuration : this.animdur; })
                .attr("d", (d) => {
                    /// !!!!! X and Y are inverted here!!!!!
                    if (d.target.type == ElementType.paginator) return "M" + d.target.y + "," + d.target.x;
                    var m = (d.source.y + d.target.y) / 2;
                    var halfWidth = this.nodeInnerWidth() / 2;
                    var k = [
                        {x: d.source.x, y: d.source.y + halfWidth },  //left point
                        {x: d.source.x, y: m},                //middle left
                        {x: d.target.x, y: m},                //middle right
                        {x: d.target.x, y: d.target.y - halfWidth }   //right point
                    ];

                    var toRet = "";
                    var prefix = "M";
                    var suffix = "";
                    var firstDone = false;
                    if (d.target.type == ElementType.objProperty)//if left element is object property - we make a long line
                        suffix += "M" + (d.target.y - halfWidth) + "," + d.target.x +" L" + (d.target.y+halfWidth ) + "," + d.target.x;

                    var points = k.map(function (d) { return [ d.y, d.x ];});
                    each(points, function (d) {
                        if (!firstDone) {toRet += d + " C";firstDone = true;}
                        else toRet += d + " ";
                    });

                    return prefix + toRet.trim() + suffix;
                }).style('opacity', function (d) { return willBeDiscarded(d.target) ? 0.2 : 1; });
        }

        private paintNodes(nodes: D3.Layout.GraphNode[]) {
            var forNodes = formD3ChainCalls(this.panel, "g#noderz"+this.graphId+"|id'noderz"+this.graphId);
            var update = forNodes.selectAll(".node").data(nodes, function (d) {return ""+ d.uniqueId + d.expanded;});
            var enter = update.enter();
            var exit = update.exit();
            var navigator = this;

            enter.append("g").attr("class", "node").style('opacity', 0).attr('transform', function (d) {
                if (typeof d === 'object' && 'parent' in d) {
                    if (!d.ui) {
                        if (d.type == ElementType.paginator) navigator.createPaginator(d, d3.select(this));
                        else if (d.type == ElementType.loader) navigator.createLoader(d, d3.select(this));
                    } else {
                        if (d.type == ElementType.paginator)   this.appendChild(d.ui.root.node());
                        else if (d.type == ElementType.loader) this.appendChild(d.ui.root.node());
                    }
                    return "translate(" + d.parent.y + "," + d.parent.x + ")";
                } else return "translate(0,0)";
            });

            exit.filter(function (d) { return !d.wasDiscarded; })
                .transition().duration(this.animdur).style('opacity', 0).attr('transform', function (d) {
                    if (typeof d !== 'object' || !('parent' in d)) return "translate(0,0)";
                    else return "translate(" + d.parent.y + "," + d.parent.x + ")";
                }).remove();
            exit.filter(function (d) { return d.wasDiscarded; })
                .transition().duration(this.animdur).style('opacity', 0).remove();

            update.attr('pointer-events', function (d) { return willBeDiscarded(d) ? 'none' : null; })
                .transition().duration((d) => { return willBeDiscarded(d) ? this.discardAnimDuration : this.animdur; })
                .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style('opacity', function (d) { return willBeDiscarded(d) ? 0.2 : 1; })
                .each(function (d) {
                    var thisItem = d3.select(this);
                    if (d.type == ElementType.paginator) { navigator.updatePaginator(d); }
                    else if (d.type == ElementType.loader) { navigator.updateLoader(d); }
                    else if (d.type == ElementType.objProperty) {
                        thisItem.text('');
                        navigator.paintObjProperty(d, thisItem);
                    } else if (d.type == ElementType.instance) {
                        if (d.dataIndicator && d.dataIndicator.ui) {
                            d.dataIndicator.ui.remove();
                            d.dataIndicator.ui = null;
                        }
                        thisItem.text('');
                        navigator.paintInstance(d, thisItem);
                    }
                    if (d.pageIndicator) { navigator.arrangePageIndicator(d, d.pageIndicator); }
                });
        }

        private createPaginator(d: Paginator, parent: D3.Selection) {
            d.ui = svgui.Paginator({parent: parent, color: d.parent.color, width: 160});
            d.ui.onPageChanged = page => { this.onPageChanged(page, d, d.parent); };
        }

        private onPageChanged(newPage: number, paginatorModel: Paginator, parentModel: Element) {
            if (parentModel.pageRequest && parentModel.pageRequest.isRunning)
                parentModel.pageRequest.cancel();
            if (parentModel.pageIndicator)
                parentModel.pageIndicator.remove();

            var margin = 15, nodeSize = this.nodeWidth - this.nodeDiff;
            var indicator = Indicator.create(this.panel, {size: this.pageIndicatorSize, maxWidth: nodeSize - margin}).run();
            this.arrangePageIndicator(parentModel, indicator);
            parentModel.pageIndicator = indicator;
            paginatorModel.currentPage = newPage;

            if (parentModel.type == ElementType.objProperty) {
                parentModel.pageRequest = this.requestForInstances(<ObjProperty>parentModel, newPage, this.pageLimitForInstances, indicator);
            } else if (parentModel.type == ElementType.instance) {
                parentModel.pageRequest = this.requestForObjPropPage(<Instance>parentModel, newPage, this.pageLimitForObjectProperties, indicator);
            }
            this.paintAll();
        }

        private arrangePageIndicator(parentModel: Element, indicatorInstance: Indicator) {
            var minX = Infinity;
            var minY = Infinity, maxY = -Infinity;
            this.panel.selectAll(".node").filter(function (nodeData) {
                return nodeData.parent === parentModel && nodeData.type != ElementType.paginator;
            }).each((d) => {
                // d.x and d.y are swapped here
                minX = Math.min(minX, d.y);
                var height = this.calcHeight(d);
                minY = Math.min(minY, d.x - height / 2);
                maxY = Math.max(maxY, d.x + height / 2);
            });

            var margin = 15, nodeSize = this.nodeInnerWidth();
            var position = vector(minX - nodeSize / 2 + this.pageIndicatorSize / 2 + margin,  minY + (maxY - minY) / 2);
            indicatorInstance.moveTo(position);
        }

        private createLoader(d: Loader, parent: D3.Selection) {
            var container = parent.append("g").attr("width", this.childrenLoaderSize).attr("height", this.childrenLoaderSize);
            d.ui = Indicator.create(container, {size: this.childrenLoaderSize}).run();
            d.ui.root = container;
            this.updateIndicatorUI(d);
        }

        private paintObjProperty(d: ObjProperty, d3This: D3.Selection) {
            var uiElement: kiv.ui.UIElement = d.ui;
            var parentInstance = <Instance>d.parent;
            var halfWidth = this.nodeInnerWidth() / 2;
            var ti = textInfo(d.name, "basicTextInGraph");
            uiElement.render(d3This, 0 -( (ti.width/2>=halfWidth)?halfWidth:((ti.width)/2)), 10, this.nodeInnerWidth());

            var path = (d.direction == "OUT") ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";//Triangle
            d3This.append("path").attr("d", path).attr("fill", parentInstance.color);

            //Circle expander
            var circle = d3This.append("circle").attr({cx:halfWidth,cy:0,r:10, fill:'white',stroke: d.color,'stroke-width':2});
            path = (!d.children) ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";
            var triangle = d3This.append("path").attr("d", path).attr("fill", parentInstance.color).attr("transform","translate(" + ((!d.children)?(halfWidth-4):(halfWidth+3)) + "," + 0 + ")");
            var mouseHandler = () => this.invokeRightAction(d, elem => this.rightActionForObjectProperty(elem));
            circle.on("mousedown", mouseHandler);
            triangle.on("mousedown", mouseHandler);
        }

        private paintInstance(d: Instance, d3This: D3.Selection) {
            var uiElement = d.expanded ?  d.uiExpanded : d.ui;
            var leftRightHeight = uiElement.height(this.nodeInnerWidth());
            var halfWidth = this.nodeInnerWidth() / 2;
            //If it's not root - we create left ear
            var leftEar = null;
            var rightEar = null;
            if (d.parent && !d.error){
                leftEar = this.createEar(
                    d, d3This, -halfWidth - this.buttonWidth, -(leftRightHeight / 2) + 1, halfWidth, leftRightHeight, uiElement,
                    this.leftAction(), "M5,-5L-5,0L5,5",-halfWidth-(this.buttonWidth)/2);
            }
            //right ear
            if (!d.error) {
                rightEar = this.createEar(
                    d, d3This, 0, -(leftRightHeight / 2) + 1, halfWidth + this.buttonWidth, leftRightHeight, uiElement,
                    () => { this.invokeRightAction(d, elem => { this.rightActionForInstance(elem); }); },
                    (d.children) ? "M5,-5L-5,0L5,5" : "M-5,-5L-5,5L5,0",
                    (d.children) ? (halfWidth+(this.buttonWidth-4)/2) : (halfWidth+(this.buttonWidth)/2));
            }

            //Changing opacity to 0 or 1
            var onMouseElement = (opacity) => () => {
                if (rightEar!=null) { rightEar.transition().duration(this.animdur).attr("opacity", opacity); }
                if (leftEar != null) { leftEar.transition().duration(this.animdur).attr("opacity", opacity); }
            };

            //render main element after ears
            uiElement.render(d3This, -halfWidth, -leftRightHeight / 2, this.nodeInnerWidth());
            if (!d.error) uiElement.setAction("mousedown.open", this.centerAction(d));
            uiElement.setAction("mouseover.uwi", onMouseElement(1));
            uiElement.setAction("mouseout.uwi", onMouseElement(0));
        }

        /**
         * Create left or right ear
         */
        private createEar(d: Instance, d3This: D3.Selection,
                          x: number, y: number, width: number, height: number,
                          uiElement: any, action: (d: Instance) => void, path: string, translate: number): D3.Selection {
            var addActionSet = (item) => {
                item.on("mousedown", action);
                item.on('mouseover', () => { ear.transition().duration(this.animdur).attr("opacity", 1);});
                item.on('mouseout', () => { ear.transition().duration(this.animdur).attr("opacity", 0);});
            };
            var ear = d3This.append("g").attr("opacity", 0);
            addBorderedRect(ear, x , y, width, height, 2, "white", uiElement.RxRy(), uiElement.RxRy(), d.color);
            ear.append("path").attr("d", path).attr("fill", d.color).attr("transform","translate(" + translate + ",0)");
            addActionSet(ear);
            return ear;
        }

        private invokeRightAction<TElement extends AggregatingElement>(d: TElement, rightActionHandler: (elem: TElement) => void) {
            var isExpanded = d['children'], hasCollapsedChildren = d['_children'];
            var isLoadingError = d.pageRequest && d.pageRequest.isFailed;
            if (isExpanded || !isLoadingError && hasCollapsedChildren) {
                this.expandOrCollapseChildren(d);
                this.paintAll();
            } else {
                d['_children'] = false;
                rightActionHandler(d);
            }
        }

        private updatePaginator(d: Paginator) {
            d.ui.currentPage = d.currentPage;
            d.ui.pageCount = d.overallPages;
            d.ui.update();
            var size = svgui.measure(d.ui, vector(this.nodeInnerWidth(), Infinity));
            svgui.arrange(d.ui, -((size.x / 2 >= this.nodeInnerWidth() / 2)
                ? this.nodeInnerWidth() / 2 : size.x / 2), -10);
        }

        private updateLoader(d: Loader) {
            var height = d.ui.size;
            d.ui.parent.attr("transform", "translate(" +
                (-this.nodeInnerWidth() / 2 + 5) + "," + (-height / 2) + ")");
        }

        /**
         * Creates kiv.ui.NiceRoundRectangle with simple text
         */
        private fillInstanceUI(d: Instance, expanded: boolean, indicatorText?: string): kiv.ui.UIElement {
            var classesString = ( d.class.length>0)?"":"! NO CLASS !";
            each(d.class, obj => {
                classesString += getNameFromCollection(obj, this.Oclasses)+", ";
            });
            classesString = classesString.substr(0, classesString.length-2);

            var lContainerContents = kiv.ui.SimpleText({text: d.name,textClass: "basicTextInGraph",vertMargin: 5});
            if (expanded){ //if an item is expanded
                if (!indicatorText){ // if data properties are loaded
                    var dataProps = [{left: "отсутствуют", right: ""}];
                    if (containsInObj(d, "dataProps") && d.dataProps.length>0) {
                        dataProps = [];
                        each(d.dataProps, d => { dataProps.push({left: getNameFromCollection(d.id, this.dataTypeProperties), right: d.val});});
                    }
                    var text = kiv.ui.StructuredText({nameTextClass: "paragraphHeaderGraph", valTextClass: "basicTextInGraph",
                        struct_text: [{name: "Свойства:", val: dataProps}],
                        percent_leftright: 50, indentBetweenLeftAndRight: 0, horIndent: 15, vertMargin: 3});
                    lContainerContents = kiv.ui.LayoutContainer1(
                        {upperText: lContainerContents, lowerText: text, lineFill: d.color, lineSize: 2, vertMargin: 6});
                } else { //if data properties are not loaded and indicator should be placed
                    var indicatorSize = 25, margin = {top: 8, bottom: 0, left: 0, right: 0};
                    var viewer = this;
                    lContainerContents = kiv.ui.LayoutContainer1({
                        lineFill: d.color,
                        upperText: kiv.ui.SimpleText({text: d.name, textClass: "basicTextInGraph", vertMargin: 5}),
                        lowerText: {
                            height: function () { return indicatorSize + margin.top + margin.bottom; },
                            render: function (parent, x, y, width) {
                                d.dataIndicator.status(indicatorText);
                                d.dataIndicator.ui = Indicator.create(parent, {size: indicatorSize,
                                    position: vector(x + margin.left + indicatorSize / 2, y + margin.top + indicatorSize / 2),
                                    maxWidth: Math.max(0, width - margin.left - margin.right - indicatorSize / 2)});
                                viewer.updateIndicatorUI(d.dataIndicator);
                                d.dataIndicator.ui.run();
                            },
                            setAction: function () {}
                        }
                    });
                }
            }

            return kiv.ui.NiceRoundRectangle({uText: classesString,
                lContainer: lContainerContents, color: d.color, marginX: (expanded)?0:20, marginXTop: 20, marginY: 5, borderSize: 2,
                classUpperText: "headersInGraph"
            });
        }

        /**
         * Creates kiv.ui.SimpleText
         */
        private fillObjectPropertyUI(d: ObjProperty): kiv.ui.UIElement {
            return kiv.ui.SimpleText({
                text: d.name,
                textClass: "paragraphHeaderGraph",
                vertMargin: 5,
                raze: true
            });
        }

        /**
         * Generate function which will be invoked if clicked on left ear of some element with d data
         */
        private leftAction() {
            return (j: Instance) => {
                window.location.assign("/resource/?uri=" + encodeURIComponent(j.id).replace(/'/g,"%27").replace(/"/g,"%22"));
            };
        }

        /**
         * Generate function which will be invoked if clicked on right ear of some element with d data
         */
        private rightActionForInstance(d: Instance) {
            var indicatorModel = this.fillModelForIndicator();
            d.children = [indicatorModel];
            d.pageRequest = this.requestForObjPropPage(d, 1, this.pageLimitForObjectProperties, indicatorModel);
            this.paintAll();
        }

        /**
         * Generate function which will be invoked if clicked on right ear of some element with d data
         */
        private rightActionForObjectProperty(d: ObjProperty) {
            var indicatorModel = this.fillModelForIndicator();
            d.children = [indicatorModel];
            d.pageRequest = this.requestForInstances(d, 1, this.pageLimitForInstances, indicatorModel);
            this.paintAll();
        }

        /**
         * Generate function which will be invoked if clicked on center of instance element
         */
        private centerAction(d: Instance) {
            return () => {
                if (!d.dpLoaded) {
                    d.dataIndicator = this.fillModelForIndicator();
                    this.requestForDataProperties(d, d.dataIndicator);
                }
                d.expanded = !d.expanded;
                this.paintAll();
            };
        }

        /**
         * MUST be invoked after each request to maintain cache
         */
        private updateCachedData(requestResult) {
            mergeProperties(this.Oclasses, requestResult['classes']);
            this.arrayOfClassVals = objToArrayValues(this.Oclasses);
            this.arrayOfClassKeys = objToArrayKeys(this.Oclasses);

            mergeProperties(this.objectProperties, requestResult['objProps']);
            this.arrayOfObjectPropVals = objToArrayValues(this.objectProperties);
            this.arrayOfObjectPropKeys = objToArrayKeys(this.objectProperties);

            mergeProperties(this.dataTypeProperties, requestResult['dataProps']);
            this.arrayOfDataPropsVals = objToArrayValues(this.dataTypeProperties);
        }

        /**
         * filling model for instance from request. It should have id, label, class and dataProps
         */
        private fillModelForInstance(instance: Instance, hasDataProps: boolean) {
            instance.uniqueId = generateUniqueId();
            instance.name = getName(instance.id, instance.label);
            instance.class.sort();
            instance.color = this.classColorGetter.getSomeObjectColor(instance.class);
            instance.expanded = false;
            instance.ui = this.fillInstanceUI(instance, false); //collapsed version in ui
            if (hasDataProps) instance.uiExpanded = this.fillInstanceUI(instance, true, null); //expanded version in uiExpanded, before request, it should be indicator
            else instance.uiExpanded = this.fillInstanceUI(instance, true, "Loading..."); //expanded version in uiExpanded, before request, it should be indicator
            instance.dpLoaded = hasDataProps;
            instance.type = ElementType.instance;
            return instance;
        }

        /**
         * filling model for object property
         */
        private fillModelForObjectProperty(objProperty: ObjProperty, color: D3.Color.Color) {
            objProperty.uniqueId = generateUniqueId();
            objProperty.name = getNameFromCollection(objProperty.objPropId, this.objectProperties);
            objProperty.color = color;
            objProperty.ui = this.fillObjectPropertyUI(objProperty);
            objProperty.type = ElementType.objProperty;
            return objProperty;
        }

        /**
         * filling model for loading indicator
         */
        private fillModelForIndicator(text: string = null): Loader {
            var navigator = this;
            return {
                uniqueId: generateUniqueId(),
                type: ElementType.loader,
                info: text,
                isErrorOccurred: false,
                isRemoved: false,
                status: function (text) {
                    this.info = text;
                    navigator.updateIndicatorUI(this);
                },
                error: function () {
                    this.isErrorOccurred = true;
                    navigator.updateIndicatorUI(this);
                },
                remove: function () {
                    this.isRemoved = true;
                    navigator.updateIndicatorUI(this);
                }
            };
        }

        private updateIndicatorUI(indicatorModel: Loader) {
            var ui = <AbstractIndicator>indicatorModel.ui;
            if (ui) {
                if (indicatorModel.info)
                    ui.status(indicatorModel.info);
                if (indicatorModel.isErrorOccurred)
                    ui.error();
                if (indicatorModel.isRemoved)
                    ui.remove();
            }
        }

        private fillPaginatorModel(pageNum: number, currentLimit: number, maxPages: number): Paginator {
            return {  //creating loader and setting it as a child until loading done
                uniqueId: generateUniqueId(),
                currentPage: pageNum,
                overallPages: maxPages,
                limit: currentLimit,
                type: ElementType.paginator
            };
        }

        private expandOrCollapseChildren(parent: AggregatingElement) {
            if (!('_children' in parent)) { parent['_children'] = false; }
            var isCollapsed = Boolean(parent['_children']);
            if (parent.pageIndicator) { parent.pageIndicator.visible(isCollapsed); }
            if (isCollapsed) { parent.children = parent['_children']; parent['_children'] = false; }
            else { parent['_children'] = parent.children; parent.children = <any>false; }
        }

        /**
         * First request which retrieves info about root element
         */
        private initialRootRequest(): kiv.SmartServerRequest {
            var indicator = WrapIndicator.wrap(this.svg);
            var onError = (e: string) => {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = (d: string) => {
                try {
                    var result = (eval('(' + d + ')'));
                    this.updateCachedData(result);
                    this.mainRoot = this.fillModelForInstance(result.request,false);
                    indicator.remove();
                    var indicatorModel = this.fillModelForIndicator();
                    this.mainRoot.children = [indicatorModel];
                    this.mainRoot.pageRequest = this.requestForObjPropPage(this.mainRoot, 1, this.pageLimitForObjectProperties, indicatorModel);
                    this.paintAll();
                    this.zoomer.translate(-this.mainRoot.y+ this.nodeWidth/2, -this.mainRoot.x+this.h/2);
                } catch (e) {
                    onError(e);
                }
            };
            return kiv.smartServerRequest({
                request: "endpoint=" + this.sparqlEndpoint+"&requestType=instanceGeneralInfo.InstanceGeneralInfoRequest&idOfInstance="+this.idOfInstance,
                url: this.service,
                waitHandler: function(d){indicator.status(d);},
                finishHandler: onFinish,
                errorHandler: onError
            });
        }

        /**
         * Request for object properties page of an instance
         */
        private requestForObjPropPage(instance: Instance, pageNum: number, currentLimit: number, indicator: AbstractIndicator): kiv.SmartServerRequest {
            indicator.status("Loading...");
            var onError = (e: string) => {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = (d: string) => {
                try {
                    var result = (eval('(' + d + ')'));
                    this.updateCachedData(result);
                    var children = this.getChildren(instance);
                    this.discardPageElements(children, ElementType.objProperty);
                    if (result.request.pageNum > 1 && children.length == 0) {
                        children.push(this.fillPaginatorModel(pageNum, currentLimit, result.request.pageNum));
                    }
                    each(result.request.values, d => {
                        children.push(this.fillModelForObjectProperty(d, instance.color));
                    });
                    this.paintAll();
                    this.zoomer.translate(-instance.y + this.nodeWidth / 2, -instance.x + this.h / 2);
                    indicator.remove();
                } catch (e) {
                    onError(e);
                }
            };
            return kiv.smartServerRequest({
                request: "endpoint=" + this.sparqlEndpoint+"&requestType=objPropsPage.ObjPropsPageRequest&idOfInstance="+instance.id+"&direction=BOTH&pageNum="+pageNum+"&currentLimit="+currentLimit,
                url: this.service,
                waitHandler: function(d) { indicator.status(d); },
                finishHandler: onFinish,
                errorHandler: onError
            });
        }

        /**
         * Request for instances of a particular object property (of a particular instance :))
         */
        private requestForInstances(objProperty: ObjProperty, pageNum: number, currentLimit: number, indicator: AbstractIndicator): kiv.SmartServerRequest {
            var instance = <Instance>objProperty.parent;
            indicator.status("Loading...");
            var onError = (e: string) => {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = (d: string) => {
                if (objProperty.pageRequest.isCancelled) {
                    indicator.remove();
                    return;
                }
                try {
                    var result = (eval('(' + d + ')'));
                    this.updateCachedData(result);
                    var children = this.getChildren(objProperty);
                    this.discardPageElements(children, ElementType.instance);
                    if (result.request.pageNum > 1 && children.length == 0) {
                        children.push(this.fillPaginatorModel(pageNum, currentLimit, result.request.pageNum));
                    }
                    each(result.request.values, (d) => {
                        children.push(this.fillModelForInstance(d, false));
                    });
                    this.paintAll();
                    this.zoomer.translate(-objProperty.y + this.nodeWidth/2, -objProperty.x + this.h / 2);
                    indicator.remove();
                } catch (e) {
                    indicator.status(e);
                    indicator.error();
                }
            };
            return kiv.smartServerRequest({
                request: "endpoint="+this.sparqlEndpoint+"&requestType=instsPage.InstsPageRequest&idOfInstance="+instance.id+"&direction="+objProperty.direction+"&objPropId="+objProperty.objPropId+"&pageNum="+pageNum+"&currentLimit="+currentLimit,
                url: this.service,
                waitHandler: function (d) { indicator.status(d); },
                finishHandler: onFinish,
                errorHandler: onError
            });
        }

        private getChildren(parentModel: AggregatingElement) {
            return parentModel.children || parentModel["_children"];
        }

        private discardPageElements(children: Element[], type: ElementType) {
            var hasPaginator = children.length > 0 && children[0].type == ElementType.paginator;
            if (hasPaginator) {
                each(children, child => {
                    if (child.type === type) {
                        child.wasDiscarded = true;
                    }
                });
            }
            children.length = hasPaginator ? 1 : 0; // keep paginator if exists
        }

        /**
         * Request for data properties
         */
        private requestForDataProperties(element: Instance, indicator: AbstractIndicator): kiv.SmartServerRequest {
            var onError = (e: string) => {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = (d: string) => {
                try {
                    var result = (eval('(' + d + ')'));
                    this.updateCachedData(result);
                    var newInstance = this.fillModelForInstance(result.request,true);
                    element.uiExpanded = newInstance.uiExpanded;
                    element.dpLoaded = newInstance.dpLoaded;
                    indicator.remove();
                    this.paintAll();
                } catch (e) {
                    onError(e);
                }
            };
            return kiv.smartServerRequest({
                request: "endpoint="+this.sparqlEndpoint+"&requestType=instanceInfoWithDP.InstanceInfoWithDPRequest&idOfInstance="+element.id,
                url: this.service,
                waitHandler: (d: string) => { indicator.status(d); },
                finishHandler: onFinish,
                errorHandler: onError
            });
        }
    }
}

declare var $: {
    (object: any): {
        width(): number;
        height(): number;
    };
};

var pageViewer: Ontology.PagedViewer;
function startIt(containerID: string, service: string, endpoint: string, idOfInstance: string) {
    pageViewer = new Ontology.PagedViewer($(window).width()-20, $(window).height()-20);
    pageViewer.render(document.getElementById(containerID), idOfInstance, endpoint, service);
}
