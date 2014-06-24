/// <reference path="klib.d.ts"/>
/// <reference path="primitives.d.ts"/>
/// <reference path="d3.d.ts"/>
/// <reference path="svgui.d.ts"/>
var Ontology;
(function (Ontology) {
    var idCounter = 0;
    function generateUniqueId() {
        return (++idCounter).toString();
    }

    /**
    * Get either label or modified URI
    */
    function getName(uri, label) {
        if (label && label.length > 0)
            return label;
        else
            return uri2Name(uri);
    }

    function uri2Name(uri) {
        //We get info after last slash (usually it is the best)
        //Anonym URI's usually don't contain /
        if (uri.indexOf("/") != -1)
            return uri.substring(uri.lastIndexOf('/') + 1);
        return uri;
    }

    /**
    * Check collection for name of some object
    */
    function getNameFromCollection(uri, collection) {
        if (uri in collection)
            return (containsInObj(collection[uri], 'label')) ? getName(uri, collection[uri].label) : uri2Name(uri);
        else
            return uri2Name(uri);
    }

    var tooltip = kiv.tooltip("tooltip");

    /**
    * Types of possible elements in the tree.
    */
    var ElementType;
    (function (ElementType) {
        /** Object instance. Round rectangle in initial design */
        ElementType[ElementType["instance"] = 0] = "instance";

        /** Object property (link). Simple text combined with a line in initial design */
        ElementType[ElementType["objProperty"] = 1] = "objProperty";

        /** Loader. Element with loading animation, possibility to cancel it and information text. Can't have children */
        ElementType[ElementType["loader"] = 2] = "loader";

        /** Pagination element. Can't have children */
        ElementType[ElementType["paginator"] = 3] = "paginator";
    })(ElementType || (ElementType = {}));

    var ObjPropertyDirection;
    (function (ObjPropertyDirection) {
        ObjPropertyDirection[ObjPropertyDirection["In"] = 0] = "In";
        ObjPropertyDirection[ObjPropertyDirection["Out"] = 1] = "Out";
    })(ObjPropertyDirection || (ObjPropertyDirection = {}));

    function willBeDiscarded(model) {
        if (model.type != 0 /* instance */ && model.type != 1 /* objProperty */) {
            return false;
        }

        return model.parent && model.parent.pageRequest && (model.parent.pageRequest.isRunning || model.parent.pageRequest.isFailed);
    }

    var PagedViewer = (function () {
        function PagedViewer(width, height) {
            var _this = this;
            this.nodeWidth = 330;
            this.nodeDiff = 100;
            this.heightBetweenNodesOfOneParent = 10;
            this.heightBetweenNodesOfDifferentParent = 40;
            this.animdur = 500;
            this.buttonWidth = 15;
            this.discardAnimDuration = 200;
            this.childrenLoaderSize = 30;
            this.pageIndicatorSize = 40;
            this.tooltiper = tooltip;
            this.pageLimitForObjectProperties = 15;
            this.pageLimitForInstances = 10;
            this.w = 1200;
            this.h = 800;
            /** unique pageviewer id */
            this.graphId = generateUniqueId();
            this.tree = d3.layout.tree().nodeSize([1, this.nodeWidth]).separation(function (a, b) {
                return _this.separationFunc(a, b);
            });
            this.diagonal = d3.svg.diagonal().projection(function (d) {
                return [d.y, d.x];
            });
            this.Oclasses = {};
            this.arrayOfClassVals = null;
            this.arrayOfClassKeys = null;
            this.objectProperties = {};
            this.arrayOfObjectPropVals = null;
            this.arrayOfObjectPropKeys = null;
            this.dataTypeProperties = {};
            this.arrayOfDataPropsVals = null;
            this.classColorGetter = kiv.colorHelper();
            if (width) {
                this.w = width;
            }
            if (height) {
                this.h = height;
            }
        }
        PagedViewer.prototype.render = function (container, idOfInstance, sparqlEndpoint, service) {
            this.resetState();
            this.idOfInstance = idOfInstance;
            this.sparqlEndpoint = sparqlEndpoint;
            this.service = service;

            this.svg = d3.select(container).text("").append("svg:svg").attr("width", this.w).attr("height", this.h).attr("pointer-events", "all");

            var zoomPart = formD3ChainCalls(this.svg, "g#zoom_part" + this.graphId + "|id'zoom_part" + this.graphId);
            this.zoomer = kiv.zoomingArea(this.w, this.h, zoomPart, 'white', [0.6, 2], d3.rgb(252, 252, 252).toString());
            this.zoomer.getOuterGroup().on("dblclick.zoom", null);
            this.panel = this.zoomer.getZoomingGroup();

            this.initialRootRequest();
        };

        PagedViewer.prototype.nodeInnerWidth = function () {
            return this.nodeWidth - this.nodeDiff;
        };

        /**
        * Separation functions between neighbouring leafs of the tree
        */
        PagedViewer.prototype.separationFunc = function (a, b) {
            var height1 = this.calcHeight(a);
            var height2 = this.calcHeight(b);
            var diff = height1 / 2 + height2 / 2 + (a.parent == b.parent ? this.heightBetweenNodesOfOneParent : this.heightBetweenNodesOfDifferentParent);
            return diff;
        };

        PagedViewer.prototype.calcHeight = function (element) {
            //We are calculating height depending on the element type differently
            if (element.type == 0 /* instance */) {
                var instance = element;
                return instance.expanded ? instance.uiExpanded.height(this.nodeInnerWidth()) : element.ui.height(this.nodeInnerWidth());
            } else if (element.type == 1 /* objProperty */) {
                return element.ui.height(this.nodeInnerWidth()) + 30;
            } else if (element.type == 3 /* paginator */) {
                return 35;
            } else if (element.type == 2 /* loader */) {
                return this.childrenLoaderSize;
            }
        };

        /**
        * Reseting state of the tree
        */
        PagedViewer.prototype.resetState = function () {
            this.Oclasses = {}; // known classes
            this.arrayOfClassVals = null; // cached array of class values
            this.arrayOfClassKeys = null; // cached array of class keys
            this.objectProperties = {}; // known object properties
            this.arrayOfObjectPropVals = null; // array of object property values
            this.arrayOfObjectPropKeys = null; // array of object property keys
            this.dataTypeProperties = {}; // known data properties
            this.arrayOfDataPropsVals = null; // array of data properties values

            this.classColorGetter = kiv.colorHelper();
            this.svg = null;
            this.zoomer = null;
            this.mainRoot = null;
            this.panel = null;
        };

        PagedViewer.prototype.paintAll = function () {
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
        };

        PagedViewer.prototype.paintLinks = function (links) {
            var forLinks = formD3ChainCalls(this.panel, "g#linkers" + this.graphId + "|id'linkers" + this.graphId);
            var update = forLinks.selectAll(".link").data(links, function (d) {
                return d.source.uniqueId + "_" + d.target.uniqueId;
            });
            var enter = update.enter();
            var exit = update.exit();

            enter.append("path").attr("class", "link").attr('stroke', function (d) {
                if (d.source.type == 0 /* instance */)
                    return d.source.color;
                else if (d.source.type == 1 /* objProperty */)
                    return d.source.parent.color;
            }).style('opacity', 0);

            exit.filter(function (d) {
                return !d.target.wasDiscarded;
            }).transition().duration(this.animdur).attr("d", function (d) {
                var o = { x: d.target.x, y: d.target.y };
                return this.diagonal({ source: o, target: o });
            }).style('opacity', 0).remove();
            exit.filter(function (d) {
                return d.target.wasDiscarded;
            }).remove();

            update.transition().duration(function (d) {
                return willBeDiscarded(d.target) ? this.discardAnimDuration : this.animdur;
            }).attr("d", function (d) {
                /// !!!!! X and Y are inverted here!!!!!
                if (d.target.type == 3 /* paginator */)
                    return "M" + d.target.y + "," + d.target.x;
                var m = (d.source.y + d.target.y) / 2;
                var halfWidth = (this.nodeWidth - this.nodeDif) / 2;
                var k = [
                    { x: d.source.x, y: d.source.y + halfWidth },
                    { x: d.source.x, y: m },
                    { x: d.target.x, y: m },
                    { x: d.target.x, y: d.target.y - halfWidth }
                ];

                var toRet = "";
                var prefix = "M";
                var suffix = "";
                var firstDone = false;
                if (d.target.type == 1 /* objProperty */)
                    suffix += "M" + (d.target.y - halfWidth) + "," + d.target.x + " L" + (d.target.y + halfWidth) + "," + d.target.x;

                var points = k.map(function (d) {
                    return [d.y, d.x];
                });
                each(points, function (d) {
                    if (!firstDone) {
                        toRet += d + " C";
                        firstDone = true;
                    } else
                        toRet += d + " ";
                });

                return prefix + toRet.trim() + suffix;
            }).style('opacity', function (d) {
                return willBeDiscarded(d.target) ? 0.2 : 1;
            });
        };

        PagedViewer.prototype.paintNodes = function (nodes) {
            var forNodes = formD3ChainCalls(this.panel, "g#noderz" + this.graphId + "|id'noderz" + this.graphId);
            var update = forNodes.selectAll(".node").data(nodes, function (d) {
                return "" + d.uniqueId + d.expanded;
            });
            var enter = update.enter();
            var exit = update.exit();
            var navigator = this;

            enter.append("g").attr("class", "node").style('opacity', 0).attr('transform', function (d) {
                if (typeof d === 'object' && 'parent' in d) {
                    if (!d.ui) {
                        if (d.type == 3 /* paginator */)
                            navigator.createPaginator(d, d3.select(this));
                        else if (d.type == 2 /* loader */)
                            navigator.createLoader(d, d3.select(this));
                    } else {
                        if (d.type == 3 /* paginator */)
                            this.appendChild(d.ui.root.node());
                        else if (d.type == 2 /* loader */)
                            this.appendChild(d.ui.root.node());
                    }
                    return "translate(" + d.parent.y + "," + d.parent.x + ")";
                } else
                    return "translate(0,0)";
            });

            exit.filter(function (d) {
                return !d.wasDiscarded;
            }).transition().duration(this.animdur).style('opacity', 0).attr('transform', function (d) {
                if (typeof d !== 'object' || !('parent' in d))
                    return "translate(0,0)";
                else
                    return "translate(" + d.parent.y + "," + d.parent.x + ")";
            }).remove();
            exit.filter(function (d) {
                return d.wasDiscarded;
            }).transition().duration(this.animdur).style('opacity', 0).remove();

            update.attr('pointer-events', function (d) {
                return willBeDiscarded(d) ? 'none' : null;
            }).transition().duration(function (d) {
                return willBeDiscarded(d) ? this.discardAnimDuration : this.animdur;
            }).attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            }).style('opacity', function (d) {
                return willBeDiscarded(d) ? 0.2 : 1;
            }).each(function (d) {
                var thisItem = d3.select(this);
                if (d.type == 3 /* paginator */) {
                    navigator.updatePaginator(d);
                } else if (d.type == 2 /* loader */) {
                    navigator.updateLoader(d);
                } else if (d.type == 1 /* objProperty */) {
                    thisItem.text('');
                    navigator.paintObjProperty(d, thisItem);
                } else if (d.type == 0 /* instance */) {
                    if (d.dataIndicator && d.dataIndicator.ui) {
                        d.dataIndicator.ui.remove();
                        d.dataIndicator.ui = null;
                    }
                    thisItem.text('');
                    navigator.paintInstance(d, thisItem);
                }
                if (d.pageIndicator) {
                    navigator.arrangePageIndicator(d, d.pageIndicator);
                }
            });
        };

        PagedViewer.prototype.createPaginator = function (d, parent) {
            var _this = this;
            d.ui = svgui.Paginator({ parent: parent, color: d.parent.color, width: 160 });
            d.ui.onPageChanged = function (page) {
                _this.onPageChanged(page, d, d.parent);
            };
        };

        PagedViewer.prototype.onPageChanged = function (newPage, paginatorModel, parentModel) {
            if (parentModel.pageRequest && parentModel.pageRequest.isRunning)
                parentModel.pageRequest.cancel();
            if (parentModel.pageIndicator)
                parentModel.pageIndicator.remove();

            var margin = 15, nodeSize = this.nodeWidth - this.nodeDiff;
            var indicator = Indicator.create(this.panel, { size: this.pageIndicatorSize, maxWidth: nodeSize - margin }).run();
            this.arrangePageIndicator(parentModel, indicator);
            parentModel.pageIndicator = indicator;
            paginatorModel.currentPage = newPage;

            if (parentModel.type == 1 /* objProperty */) {
                parentModel.pageRequest = this.requestForInstances(parentModel, newPage, this.pageLimitForInstances, indicator);
            } else if (parentModel.type == 0 /* instance */) {
                parentModel.pageRequest = this.requestForObjPropPage(parentModel, newPage, this.pageLimitForObjectProperties, indicator);
            }
            this.paintAll();
        };

        PagedViewer.prototype.arrangePageIndicator = function (parentModel, indicatorInstance) {
            var minX = Infinity;
            var minY = Infinity, maxY = -Infinity;
            this.panel.selectAll(".node").filter(function (nodeData) {
                return nodeData.parent === parentModel && nodeData.type != 3 /* paginator */;
            }).each(function (d) {
                // d.x and d.y are swapped here
                minX = Math.min(minX, d.y);
                var height = this.calcHeight(d);
                minY = Math.min(minY, d.x - height / 2);
                maxY = Math.max(maxY, d.x + height / 2);
            });

            var margin = 15, nodeSize = this.nodeInnerWidth();
            var position = vector(minX - nodeSize / 2 + this.pageIndicatorSize / 2 + margin, minY + (maxY - minY) / 2);
            indicatorInstance.moveTo(position);
        };

        PagedViewer.prototype.createLoader = function (d, parent) {
            var container = parent.append("g").attr("width", this.childrenLoaderSize).attr("height", this.childrenLoaderSize);
            d.ui = Indicator.create(container, { size: this.childrenLoaderSize }).run();
            d.ui.root = container;
            this.updateIndicatorUI(d);
        };

        PagedViewer.prototype.paintObjProperty = function (d, d3This) {
            var _this = this;
            var uiElement = d.ui;
            var parentInstance = d.parent;
            var halfWidth = this.nodeInnerWidth() / 2;
            var ti = textInfo(d.name, "basicTextInGraph");
            uiElement.render(d3This, 0 - ((ti.width / 2 >= halfWidth) ? halfWidth : ((ti.width) / 2)), 10, this.nodeInnerWidth());

            var path = (d.direction == 1 /* Out */) ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";
            d3This.append("path").attr("d", path).attr("fill", parentInstance.color);

            //Circle expander
            var circle = d3This.append("circle").attr({ cx: halfWidth, cy: 0, r: 10, fill: 'white', stroke: d.color, 'stroke-width': 2 });
            path = (!d.children) ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";
            var triangle = d3This.append("path").attr("d", path).attr("fill", parentInstance.color).attr("transform", "translate(" + ((!d.children) ? (halfWidth - 4) : (halfWidth + 3)) + "," + 0 + ")");
            var mouseHandler = function () {
                return _this.invokeRightAction(d, function (elem) {
                    return _this.rightActionForObjectProperty(elem);
                });
            };
            circle.on("mousedown", mouseHandler);
            triangle.on("mousedown", mouseHandler);
        };

        PagedViewer.prototype.paintInstance = function (d, d3This) {
            var _this = this;
            var uiElement = (d.expanded) ? d.uiExpanded : d.ui;
            var leftRightHeight = uiElement.height(this.nodeInnerWidth());
            var halfWidth = this.nodeInnerWidth() / 2;

            //If it's not root - we create left ear
            var leftEar = null;
            var rightEar = null;
            if (d.parent && !d.error) {
                leftEar = createEar(d, d3This, -halfWidth - this.buttonWidth, -(leftRightHeight / 2) + 1, halfWidth, leftRightHeight, uiElement, this.leftAction(), "M5,-5L-5,0L5,5", -halfWidth - (this.buttonWidth) / 2);
            }

            //right ear
            if (!d.error) {
                rightEar = createEar(d, d3This, 0, -(leftRightHeight / 2) + 1, halfWidth + this.buttonWidth, leftRightHeight, uiElement, function () {
                    _this.invokeRightAction(d, function (elem) {
                        _this.rightActionForInstance(elem);
                    });
                }, (d.children) ? "M5,-5L-5,0L5,5" : "M-5,-5L-5,5L5,0", (d.children) ? (halfWidth + (this.buttonWidth - 4) / 2) : (halfWidth + (this.buttonWidth) / 2));
            }

            //render main element after ears
            uiElement.render(d3This, -halfWidth, -leftRightHeight / 2, this.nodeInnerWidth());
            if (!d.error)
                uiElement.setAction("mousedown.open", this.centerAction(d));
            uiElement.setAction("mouseover.uwi", onMouseElement(1));
            uiElement.setAction("mouseout.uwi", onMouseElement(0));

            //Changing opacity to 0 or 1
            function onMouseElement(opacity) {
                return function () {
                    if (rightEar != null)
                        rightEar.transition().duration(this.animdur).attr("opacity", opacity);
                    if (leftEar != null)
                        leftEar.transition().duration(this.animdur).attr("opacity", opacity);
                };
            }

            //create left or right ear
            function createEar(d, d3This, x, y, width, height, uiElement, action, path, translate) {
                var ear = d3This.append("g").attr("opacity", 0);
                addBorderedRect(ear, x, y, width, height, 2, "white", uiElement.RxRy(), uiElement.RxRy(), d.color);
                ear.append("path").attr("d", path).attr("fill", d.color).attr("transform", "translate(" + translate + ",0)");
                actionSet(ear);
                return ear;

                function actionSet(item) {
                    item.on("mousedown", action);
                    item.on('mouseover', function () {
                        ear.transition().duration(this.animdur).attr("opacity", 1);
                    });
                    item.on('mouseout', function () {
                        ear.transition().duration(this.animdur).attr("opacity", 0);
                    });
                }
            }
        };

        PagedViewer.prototype.invokeRightAction = function (d, rightActionHandler) {
            var isExpanded = d['children'], hasCollapsedChildren = d['_children'];
            var isLoadingError = d.pageRequest && d.pageRequest.isFailed;
            if (isExpanded || !isLoadingError && hasCollapsedChildren) {
                this.expandOrCollapseChildren(d);
                this.paintAll();
            } else {
                d['_children'] = false;
                rightActionHandler(d);
            }
        };

        PagedViewer.prototype.updatePaginator = function (d) {
            d.ui.currentPage = d.currentPage;
            d.ui.pageCount = d.overallPages;
            d.ui.update();
            var size = svgui.measure(d.ui, vector(this.nodeInnerWidth(), Infinity));
            svgui.arrange(d.ui, -((size.x / 2 >= this.nodeInnerWidth() / 2) ? this.nodeInnerWidth() / 2 : size.x / 2), -10);
        };

        PagedViewer.prototype.updateLoader = function (d) {
            var height = d.ui.size;
            d.ui.parent.attr("transform", "translate(" + (-this.nodeInnerWidth() / 2 + 5) + "," + (-height / 2) + ")");
        };

        /**
        * Creates kiv.ui.NiceRoundRectangle with simple text
        */
        PagedViewer.prototype.fillInstanceUI = function (d, expanded, indicatorText) {
            var _this = this;
            var classesString = (d.class.length > 0) ? "" : "! NO CLASS !";
            each(d.class, function (obj) {
                classesString += getNameFromCollection(obj, _this.Oclasses) + ", ";
            });
            classesString = classesString.substr(0, classesString.length - 2);

            var lContainerContents = kiv.ui.SimpleText({ text: d.name, textClass: "basicTextInGraph", vertMargin: 5 });
            if (expanded) {
                if (!indicatorText) {
                    var dataProps = [{ left: "отсутствуют", right: "" }];
                    if (containsInObj(d, "dataProps") && d.dataProps.length > 0) {
                        dataProps = [];
                        each(d.dataProps, function (d) {
                            dataProps.push({ left: getNameFromCollection(d.id, _this.dataTypeProperties), right: d.val });
                        });
                    }
                    var text = kiv.ui.StructuredText({
                        nameTextClass: "paragraphHeaderGraph", valTextClass: "basicTextInGraph",
                        struct_text: [{ name: "Свойства:", val: dataProps }],
                        percent_leftright: 50, indentBetweenLeftAndRight: 0, horIndent: 15, vertMargin: 3 });
                    lContainerContents = kiv.ui.LayoutContainer1({ upperText: lContainerContents, lowerText: text, lineFill: d.color, lineSize: 2, vertMargin: 6 });
                } else {
                    var indicatorSize = 25, margin = { top: 8, bottom: 0, left: 0, right: 0 };
                    lContainerContents = kiv.ui.LayoutContainer1({
                        lineFill: d.color,
                        upperText: kiv.ui.SimpleText({ text: d.name, textClass: "basicTextInGraph", vertMargin: 5 }),
                        lowerText: {
                            height: function () {
                                return indicatorSize + margin.top + margin.bottom;
                            },
                            render: function (parent, x, y, width) {
                                d.dataIndicator.status(indicatorText);
                                d.dataIndicator.ui = Indicator.create(parent, {
                                    size: indicatorSize,
                                    position: vector(x + margin.left + indicatorSize / 2, y + margin.top + indicatorSize / 2),
                                    maxWidth: Math.max(0, width - margin.left - margin.right - indicatorSize / 2) });
                                this.updateIndicatorUI(d.dataIndicator);
                                d.dataIndicator.ui.run();
                            },
                            setAction: function () {
                            }
                        }
                    });
                }
            }

            var toRet = kiv.ui.NiceRoundRectangle({
                uText: classesString,
                lContainer: lContainerContents, color: d.color, marginX: (expanded) ? 0 : 20, marginXTop: 20, marginY: 5, borderSize: 2,
                classUpperText: "headersInGraph"
            });
            return toRet;
        };

        /**
        * Creates kiv.ui.SimpleText
        */
        PagedViewer.prototype.fillObjectPropertyUI = function (d) {
            var toRet = kiv.ui.SimpleText({
                text: d.name,
                textClass: "paragraphHeaderGraph",
                vertMargin: 5,
                raze: true
            });
            return toRet;
        };

        /**
        * Generate function which will be invoked if clicked on left ear of some element with d data
        */
        PagedViewer.prototype.leftAction = function () {
            return function (j) {
                window.location.assign("/resource/?uri=" + encodeURIComponent(j.id).replace(/'/g, "%27").replace(/"/g, "%22"));
            };
        };

        /**
        * Generate function which will be invoked if clicked on right ear of some element with d data
        */
        PagedViewer.prototype.rightActionForInstance = function (d) {
            var indicatorModel = this.fillModelForIndicator();
            d.children = [indicatorModel];
            d.pageRequest = this.requestForObjPropPage(d, 1, this.pageLimitForObjectProperties, indicatorModel);
            this.paintAll();
        };

        /**
        * Generate function which will be invoked if clicked on right ear of some element with d data
        */
        PagedViewer.prototype.rightActionForObjectProperty = function (d) {
            var indicatorModel = this.fillModelForIndicator();
            d.children = [indicatorModel];
            d.pageRequest = this.requestForInstances(d, 1, this.pageLimitForInstances, indicatorModel);
            this.paintAll();
        };

        /**
        * Generate function which will be invoked if clicked on center of instance element
        */
        PagedViewer.prototype.centerAction = function (d) {
            var _this = this;
            return function () {
                if (!d.dpLoaded) {
                    d.dataIndicator = _this.fillModelForIndicator();
                    _this.requestForDataProperties(d, d.dataIndicator);
                }
                d.expanded = !d.expanded;
                _this.paintAll();
            };
        };

        /**
        * MUST be invoked after each request to maintain cache
        */
        PagedViewer.prototype.updateCachedData = function (requestResult) {
            mergeProperties(this.Oclasses, requestResult['classes']);
            this.arrayOfClassVals = objToArrayValues(this.Oclasses);
            this.arrayOfClassKeys = objToArrayKeys(this.Oclasses);

            mergeProperties(this.objectProperties, requestResult['objProps']);
            this.arrayOfObjectPropVals = objToArrayValues(this.objectProperties);
            this.arrayOfObjectPropKeys = objToArrayKeys(this.objectProperties);

            mergeProperties(this.dataTypeProperties, requestResult['dataProps']);
            this.arrayOfDataPropsVals = objToArrayValues(this.dataTypeProperties);
        };

        /**
        * filling model for instance from request. It should have id, label, class and dataProps
        */
        PagedViewer.prototype.fillModelForInstance = function (instance, hasDataProps) {
            instance.uniqueId = generateUniqueId();
            instance.name = getName(instance.id, instance.label);
            instance.class.sort();
            instance.color = this.classColorGetter.getSomeObjectColor(instance.class);
            instance.expanded = false;
            instance.ui = this.fillInstanceUI(instance, false); //collapsed version in ui
            if (hasDataProps)
                instance.uiExpanded = this.fillInstanceUI(instance, true, null); //expanded version in uiExpanded, before request, it should be indicator
            else
                instance.uiExpanded = this.fillInstanceUI(instance, true, "Loading..."); //expanded version in uiExpanded, before request, it should be indicator
            instance.dpLoaded = hasDataProps;
            instance.type = 0 /* instance */;
            return instance;
        };

        /**
        * filling model for object property
        */
        PagedViewer.prototype.fillModelForObjectProperty = function (objProperty, color) {
            objProperty.uniqueId = generateUniqueId();
            objProperty.name = getNameFromCollection(objProperty.objPropId, this.objectProperties);
            objProperty.color = color;
            objProperty.ui = this.fillObjectPropertyUI(objProperty);
            objProperty.type = 1 /* objProperty */;
            return objProperty;
        };

        /**
        * filling model for loading indicator
        */
        PagedViewer.prototype.fillModelForIndicator = function (text) {
            if (typeof text === "undefined") { text = null; }
            var navigator = this;
            return {
                uniqueId: generateUniqueId(),
                type: 2 /* loader */,
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
        };

        PagedViewer.prototype.updateIndicatorUI = function (indicatorModel) {
            var ui = indicatorModel.ui;
            if (ui) {
                if (indicatorModel.info)
                    ui.status(indicatorModel.info);
                if (indicatorModel.isErrorOccurred)
                    ui.error();
                if (indicatorModel.isRemoved)
                    ui.remove();
            }
        };

        PagedViewer.prototype.fillPaginatorModel = function (pageNum, currentLimit, maxPages) {
            return {
                uniqueId: generateUniqueId(),
                currentPage: pageNum,
                overallPages: maxPages,
                limit: currentLimit,
                type: 3 /* paginator */
            };
        };

        PagedViewer.prototype.expandOrCollapseChildren = function (parent) {
            if (!('_children' in parent)) {
                parent._children = false;
            }
            var isCollapsed = Boolean(parent._children);
            if (parent.pageIndicator) {
                parent.pageIndicator.visible(isCollapsed);
            }
            if (isCollapsed) {
                parent.children = parent._children;
                parent._children = false;
            } else {
                parent._children = parent.children;
                parent.children = false;
            }
        };

        /**
        * First request which retrieves info about root element
        * example: http://dbpedia.org/sparql$instanceGeneralInfo.InstanceGeneralInfoRequest$http://dbpedia.org/resource/Blackmore's_Night
        */
        PagedViewer.prototype.initialRootRequest = function () {
            var _this = this;
            var indicator = WrapIndicator.wrap(this.svg);
            var onError = function (e) {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = function (d) {
                try  {
                    var result = (eval('(' + d + ')'));
                    _this.updateCachedData(result);
                    _this.mainRoot = _this.fillModelForInstance(result.request, false);
                    indicator.remove();
                    var indicatorModel = _this.fillModelForIndicator();
                    _this.mainRoot.children = [indicatorModel];
                    _this.mainRoot.pageRequest = _this.requestForObjPropPage(_this.mainRoot, 1, _this.pageLimitForObjectProperties, indicatorModel);
                    _this.paintAll();
                    _this.zoomer.translate(-_this.mainRoot.y + _this.nodeWidth / 2, -_this.mainRoot.x + _this.h / 2);
                } catch (e) {
                    onError(e);
                }
            };
            var request = kiv.smartServerRequest({
                request: "endpoint=" + this.sparqlEndpoint + "&requestType=instanceGeneralInfo.InstanceGeneralInfoRequest&idOfInstance=" + this.idOfInstance,
                url: this.service,
                waitHandler: function (d) {
                    indicator.status(d);
                },
                finishHandler: onFinish,
                errorHandler: onError
            });
            return request;
        };

        /**
        * Request for object properties page of an instance
        * example: http://dbpedia.org/sparql$objPropsPage.ObjPropsPageRequest$http://dbpedia.org/resource/United_States$BOTH$1$10
        */
        PagedViewer.prototype.requestForObjPropPage = function (instance, pageNum, currentLimit, indicator) {
            var _this = this;
            indicator.status("Loading...");
            var onError = function (e) {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = function (d) {
                try  {
                    var result = (eval('(' + d + ')'));
                    _this.updateCachedData(result);
                    var children = _this.getChildren(instance);
                    _this.discardPageElements(children, 1 /* objProperty */);
                    if (result.request.pageNum > 1 && children.length == 0) {
                        children.push(_this.fillPaginatorModel(pageNum, currentLimit, result.request.pageNum));
                    }
                    each(result.request.values, function (d) {
                        children.push(_this.fillModelForObjectProperty(d, instance.color));
                    });
                    _this.paintAll();
                    _this.zoomer.translate(-instance.y + _this.nodeWidth / 2, -instance.x + _this.h / 2);
                    indicator.remove();
                } catch (e) {
                    onError(e);
                }
            };
            var request = kiv.smartServerRequest({
                request: "endpoint=" + this.sparqlEndpoint + "&requestType=objPropsPage.ObjPropsPageRequest&idOfInstance=" + instance.id + "&direction=BOTH&pageNum=" + pageNum + "&currentLimit=" + currentLimit,
                url: this.service,
                waitHandler: function (d) {
                    indicator.status(d);
                },
                finishHandler: onError,
                errorHandler: onFinish
            });
            return request;
        };

        /**
        * Request for instances of a particular object property (of a particular instance :))
        * example: http://dbpedia.org/sparql$instsPage.InstsPageRequest$http://dbpedia.org/resource/United_States$IN$http://dbpedia.org/ontology/almaMater$1$503
        *
        * @param indicator {status: function(text), error: function(), remove: function()}
        * @returns kiv.smartServerRequest object
        */
        PagedViewer.prototype.requestForInstances = function (objProperty, pageNum, currentLimit, indicator) {
            var _this = this;
            var instance = objProperty.parent;
            indicator.status("Loading...");
            var onError = function (e) {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = function (d) {
                if (objProperty.pageRequest.isCancelled) {
                    indicator.remove();
                    return;
                }
                try  {
                    var result = (eval('(' + d + ')'));
                    _this.updateCachedData(result);
                    var children = _this.getChildren(objProperty);
                    _this.discardPageElements(children, 0 /* instance */);
                    if (result.request.pageNum > 1 && children.length == 0) {
                        children.push(_this.fillPaginatorModel(pageNum, currentLimit, result.request.pageNum));
                    }
                    each(result.request.values, function (d) {
                        children.push(this.fillModelForInstance(d, false));
                    });
                    _this.paintAll();
                    _this.zoomer.translate(-objProperty.y + _this.nodeWidth / 2, -objProperty.x + _this.h / 2);
                    indicator.remove();
                } catch (e) {
                    indicator.status(e);
                    indicator.error();
                }
            };
            var request = kiv.smartServerRequest({
                request: "endpoint=" + this.sparqlEndpoint + "&requestType=instsPage.InstsPageRequest&idOfInstance=" + instance.id + "&direction=" + objProperty.direction + "&objPropId=" + objProperty.objPropId + "&pageNum=" + pageNum + "&currentLimit=" + currentLimit,
                url: this.service,
                waitHandler: function (d) {
                    indicator.status(d);
                },
                finishHandler: onFinish,
                errorHandler: onError
            });
            return request;
        };

        PagedViewer.prototype.getChildren = function (parentModel) {
            return parentModel.children || parentModel._children;
        };

        PagedViewer.prototype.discardPageElements = function (children, type) {
            var hasPaginator = children.length > 0 && children[0].type == 3 /* paginator */;
            if (hasPaginator) {
                each(children, function (child) {
                    if (child.type === type)
                        child.wasDiscarded = true;
                });
            }
            children.length = hasPaginator ? 1 : 0; // keep paginator if exists
        };

        /**
        * Request for data properties
        * example: http://dbpedia.org/sparql$instanceInfoWithDP.InstanceInfoWithDPRequest$http://dbpedia.org/resource/Blackmore's_Night
        */
        PagedViewer.prototype.requestForDataProperties = function (element, indicator) {
            var _this = this;
            var onError = function (e) {
                indicator.error();
                indicator.status(e);
            };
            var onFinish = function (d) {
                try  {
                    var result = (eval('(' + d + ')'));
                    _this.updateCachedData(result);
                    var newInstance = _this.fillModelForInstance(result.request, true);
                    element.uiExpanded = newInstance.uiExpanded;
                    element.dpLoaded = newInstance.dpLoaded;
                    indicator.remove();
                    _this.paintAll();
                } catch (e) {
                    onError(e);
                }
            };
            var request = kiv.smartServerRequest({
                request: "endpoint=" + this.sparqlEndpoint + "&requestType=instanceInfoWithDP.InstanceInfoWithDPRequest&idOfInstance=" + element.id,
                url: this.service,
                waitHandler: function (d) {
                    indicator.status(d);
                },
                finishHandler: onFinish,
                errorHandler: onError
            });
            return request;
        };
        return PagedViewer;
    })();
    Ontology.PagedViewer = PagedViewer;
})(Ontology || (Ontology = {}));

function startIt(containerID, service, endpoint, idOfInstance) {
    var pageViewer = new Ontology.PagedViewer($(window).width() - 20, $(window).height() - 20);
    pageViewer.render(document.getElementById(containerID), idOfInstance, endpoint, service);
}
//# sourceMappingURL=ontology_navigator.js.map
