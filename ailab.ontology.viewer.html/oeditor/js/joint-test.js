/// <reference path="klib.d.ts"/>
/// <reference path="primitives.d.ts"/>
/// <reference path="d3.d.ts"/>
/// <reference path="svgui.d.ts"/>
/// <reference path="joint/jointjs.d.ts"/>
var JointTest;
(function (JointTest) {
    var Diagram = (function () {
        function Diagram(rootElement, service, sparqlEndpoint, idOfInstance) {
            var _this = this;
            this.rootElement = rootElement;
            this.service = service;
            this.sparqlEndpoint = sparqlEndpoint;
            this.graph = new joint.dia.Graph;
            this.instances = {};
            this.linkByTypes = {};
            this.paper = new joint.dia.Paper({
                el: $(rootElement),
                width: 1600,
                height: 720,
                model: this.graph,
                gridSize: 1
            });

            var addElem = function (name) {
                return _this.createIfNeeded({
                    id: name, label: name, request: {}
                });
            };
            var foo = addElem("foo");
            var bar = addElem("bar");
            var quix = addElem("quix");
            var gadget = addElem("gadget");

            this.linkInstances(foo.template.id, bar.template.id, { objPropId: "inherits", direction: "IN" });
            this.linkInstances(bar.template.id, quix.template.id, { objPropId: "contains", direction: "OUT" });
            this.linkInstances(quix.template.id, gadget.template.id, { objPropId: "equals", direction: "BOTH" });
            //            this.paper.on('cell:pointerdblclick', (cellView: joint.dia.CellView) => {
            //                var element = <Element> cellView.model;
            //                if ('isLoaded' in element && !element.isLoaded) {
            //                    element.isLoaded = true;
            //                    var instanceID = element.template.id;
            //                    $.get(service, {
            //                        endpoint: this.sparqlEndpoint,
            //                        requestType: "objPropsPage.ObjPropsPageRequest",
            //                        idOfInstance: instanceID,
            //                        direction: "BOTH",
            //                        pageNum: 1,
            //                        currentLimit: 10
            //                    }, (result: LinkRequestResult) => {
            //                        for (var i = 0; i < result.request.values.length; i++) {
            //                            var objectProperty = result.request.values[i];
            //                            this.loadLinkedElems(instanceID, objectProperty);
            //                        }
            //                    }, "json");
            //                }
            //            });
            //
            //            $.get(service, {
            //                endpoint: this.sparqlEndpoint,
            //                requestType: "instanceGeneralInfo.InstanceGeneralInfoRequest",
            //                idOfInstance: idOfInstance
            //            }, (data: ElementTemplate) => this.createIfNeeded(data.request), "json");
        }
        Diagram.prototype.getGridPosition = function () {
            var index = _.size(this.instances);
            return { x: (25 + 200 * (index % 8)), y: (30 + 70 * Math.floor(index / 8)) };
        };

        Diagram.prototype.createIfNeeded = function (instanceTemplate) {
            if (instanceTemplate.id in this.instances)
                return this.instances[instanceTemplate.id];

            var rect = new joint.shapes.basic.Rect({
                position: this.getGridPosition(),
                size: { width: 150, height: 40 },
                attrs: { rect: { fill: 'green' }, text: { text: instanceTemplate.label, fill: 'white' } }
            });
            rect.template = instanceTemplate;
            rect.isLoaded = false;
            rect.linkedTo = {};
            this.instances[instanceTemplate.id] = rect;

            this.graph.addCell(rect);
            return rect;
        };

        Diagram.prototype.loadLinkedElems = function (instanceID, objProperty) {
            var _this = this;
            $.get(this.service, {
                endpoint: this.sparqlEndpoint,
                requestType: "instsPage.InstsPageRequest",
                idOfInstance: instanceID,
                direction: "BOTH",
                objPropId: objProperty.objPropId,
                pageNum: 1,
                currentLimit: 10
            }, function (result) {
                for (var i = 0; i < result.request.values.length; i++) {
                    var instanceTemplate = result.request.values[i];
                    _this.createIfNeeded(instanceTemplate);
                    if (objProperty.direction == "IN") {
                        _this.linkInstances(instanceID, instanceTemplate.id, objProperty);
                    } else {
                        _this.linkInstances(instanceTemplate.id, instanceID, objProperty);
                    }
                }
            }, "json");
        };

        Diagram.prototype.linkInstances = function (objectInstanceID, subjectInstanceID, objectProperty) {
            var objectInstance = this.instances[objectInstanceID];
            var subjectInstance = this.instances[subjectInstanceID];
            if (objectInstanceID in subjectInstance.linkedTo)
                return subjectInstance.linkedTo[objectInstanceID];

            var link = new joint.dia.Link({
                source: { id: subjectInstance.id },
                target: { id: objectInstance.id },
                attrs: {
                    '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
                },
                labels: [
                    { position: .5, attrs: { text: { text: uri2Name(objectProperty.objPropId) } } }
                ]
            });
            link.template = objectProperty;
            subjectInstance.linkedTo[objectInstanceID] = link;
            this.graph.addCell(link);
            return link;
        };
        return Diagram;
    })();
    JointTest.Diagram = Diagram;

    function uri2Name(uri) {
        if (uri.indexOf("/") != -1)
            return uri.substring(uri.lastIndexOf('/') + 1);
        return uri;
    }
})(JointTest || (JointTest = {}));
//# sourceMappingURL=joint-test.js.map
