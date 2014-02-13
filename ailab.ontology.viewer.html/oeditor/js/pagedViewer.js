/**
 * Created with IntelliJ IDEA.
 * User: Kivan
 * Date: 07.02.14
 * Time: 10:02
 * To change this template use File | Settings | File Templates.
 */

var tooltip = kiv.tooltip("tooltip");
var idCounter = 0;
ailab = {};
ailab.kiv = {};
ailab.kiv.pageViewer = function(p){
    function returned() {}
    var defaultParams = {
        width: 1200, height: 600,   // Width and height of SVG
        nodeWidth: 330, nodeDif: 100,  //Width of element and width of sum of left and right link connectors between elements
        heightBetweenNodesOfOneParent: 10, heightBetweenNodesOfDifferentParent: 40, //Height between leaf nodes of one parent and different parents
        animdur: 500, buttonWidth: 15, // animation duration and width of buttons
        tooltiper:tooltip //tooltiper
    };
    p = (arguments.length == 1) ? mergeProperties(p, defaultParams) : defaultParams;
//------------------------------------------------FIELDS-------------------------
    var graphId = generateUniqueId(); // unique pageviewer id
    var w = p.width;
    var h = p.height;
    var ui = kiv.UI(p.tooltiper);//Generator of UI elements
    var tree = d3.layout.tree()
        .nodeSize([1, p.nodeWidth])
        .separation(separationFunc);
    var diagonal = d3.svg.diagonal().projection(function (d) {
        return [d.y, d.x];
    });
    var elementTypes = { // Types of possible elements in the tree
        instance:"instance", // Object instance. Round rectangle in initial design
        objProperty:"objProperty", // Object property (link). Simple text combined with a line in initial design
        loader:"loader", // Loader. Element with loading animation, possibility to cancel it and information text. Can't have children
        paginator:"paginator" // Pagination element. Can't have children
    };

    //-----STATE of the TREE
    var Oclasses = {}; // known classes
    var arrayOfClassVals = null; // cached array of class values
    var arrayOfClassKeys = null; // cached array of class keys
    var objectProperties = {}; //known object properties
    var arrayOfObjectPropVals = null; //array of object property valuess
    var arrayOfObjectPropKeys = null; //array of object property keys
    var dataTypeProperties = {}; // known data properties
    var arrayOfDataPropsVals = null; // array of data properties values

    var classColorGetter = kiv.colorHelper();//choose color by set of classes

    var svg = null;//svg root
    var panel = null;//zooming group is here to place elements
    var zoomer = null;//zoomer contains zooming viewpoint
    var renderParams = null;//When an object is rendered, render parameters are contained here
    var mainRoot = null;//ROOT of the tree
    //var usedElements = d3.map();//Elements, which were used

    //STATE of the TREE-----

//-----------------------/FIELDS--------------------------------------------------

//-------------------------------------------------------PUBLIC------------------------

    //Initiates tree selection and rendering. If invoked second time - nullifies previous state
    returned.RENDER = function(renderParamz){
        resetState();
        var defaultParams = {
            containerid: 'chart', idOfInstance: null, sparqlEndpoint: "", service: "",
            pageLimitForObjectProperties:15, pageLimitForInstances:10, interval:500/*ms*/
        };
        renderParams = (arguments.length == 1) ? mergeProperties(renderParamz, defaultParams) : defaultParams;

        svg = d3.select("#" + renderParams.containerid).text("")
            .append("svg:svg").attr("width", w).attr("height", h).attr("pointer-events", "all");

        var zoomPart = formD3ChainCalls(svg, "g#zoom_part"+graphId+"|id'zoom_part"+graphId);
        zoomer = kiv.zoomingArea(w, h, zoomPart, 'white', [0.6, 2], d3.rgb(252,252,252).toString());
        zoomer.getOuterGroup().on("dblclick.zoom", null);
        panel = zoomer.getZoomingGroup();

        initialRootRequest();
    };

//-----------------------/PUBLIC-------------------------------------------------------

//-------------------------------------------------------PRIVATE------------------------

    //Separation functions between neighbouring leafs of the tree
    function separationFunc(a, b) {
        //a and b should have ui field with height() method

        var height1 = calcHeight(a);
        var height2 = calcHeight(b);

        var dif = height1 / 2 + height2 / 2 + (a.parent == b.parent ? p.heightBetweenNodesOfOneParent : p.heightBetweenNodesOfDifferentParent);

        return dif;

        //We are calculating height depending on the element type differently
        function calcHeight(element){
            if(element.type == elementTypes.instance ) return ( element.expanded)?  element.uiExpanded.height(p.nodeWidth-p.nodeDif) : element.ui.height(p.nodeWidth-p.nodeDif);
            else if (element.type == elementTypes.objProperty) return element.ui.height(p.nodeWidth-p.nodeDif)+30;
            //else if (element.type == elementTypes.paginator) return element.ui.height(p.nodeWidth-p.nodeDif)+30;
            else if (element.type == elementTypes.paginator) return 35;
            else if (element.type == elementTypes.loader) return element.ui.height(p.nodeWidth-p.nodeDif)+30;
        }
    }

    //Reseting state of the tree
    function resetState(){
        Oclasses = {}; // known classes
        arrayOfClassVals = null; // cached array of class values
        arrayOfClassKeys = null; // cached array of class keys
        objectProperties = {}; //known object properties
        arrayOfObjectPropVals = null; //array of object property valuess
        arrayOfObjectPropKeys = null; //array of object property keys
        dataTypeProperties = {}; // known data properties
        arrayOfDataPropsVals = null; // array of data properties values

        classColorGetter = kiv.colorHelper();
        svg = null;
        zoomer = null;
        renderParams = null;
        mainRoot = null;
        panel = null;
        //usedElements = d3.map();
    }

    //paint function. Should be invoked each time when something changes in representation
    function paintAll(){
        var nodes = tree.nodes(mainRoot);
        var links = tree.links(nodes);

        setParent(mainRoot);

        paintLinks();
        paintNodes();

        //Setting parents for each element
        function setParent(node) {
            if ('children' in node) {
                for (var index in node.children) {
                    node.children[index].parent = node;
                    setParent(node.children[index]);
                }
            }
        }

        //painting nodes
        function paintNodes(){
            var forNodes = formD3ChainCalls(panel, "g#noderz"+graphId+"|id'noderz"+graphId);
            var update = forNodes.selectAll(".node").data(nodes, function (d) {return ""+ d.uniqueId + d.expanded;});
            var enter = update.enter();
            var exit = update.exit();

            enter.append("g").attr("class", "node").style('opacity', 0).attr('transform', function (d) {
                    if (typeof d === 'object' && 'parent' in d) {
                        if (!d._ui) {
                            if (d.type == elementTypes.paginator) createPaginator(d, d3.select(this));
                            else if (d.type == elementTypes.loader) createLoader(d, d3.select(this));
                        } else {
                            if (d.type == elementTypes.paginator) this.appendChild(d._ui.root.node());
                        }
                        return "translate(" + d.parent.y + "," + d.parent.x + ")";
                    } else return "translate(0,0)";
            });

            exit.transition().duration(p.animdur).style('opacity', 0).attr('transform', function (d) {
                    if (typeof d === 'object' && 'parent' in d) return "translate(" + d.parent.y + "," + d.parent.x + ")";
                    else return "translate(0,0)";}).remove();

            update.transition().duration(p.animdur).attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")";})
                .style('opacity', 1)
                .each(function (d) {
                    var thisItem = d3.select(this);
                    if (d.type == elementTypes.paginator)   { updatePaginator(d, thisItem); }
                    else if (d.type == elementTypes.loader) { updateLoader(d, thisItem); }
                    else {
                        thisItem.text('');
                        if (d.type == elementTypes.objProperty) paintObjProperty(d,thisItem);
                        else if (d.type == elementTypes.instance) paintInstance(d,thisItem);
                    }
                });

            function createPaginator(d, parent) {
                d._ui = svgui.Paginator({parent: parent, color: d.parent.color, width: 160});
                d._ui.onPageChanged = function (page) {
                    if (d.parent.type == elementTypes.objProperty) {
                        requestForInstances(d.parent.parent, d.parent, page, renderParams.pageLimitForInstances);
                    } else if (d.parent.type == elementTypes.instance) {
                        requestForObjPropPage(d.parent, page, renderParams.pageLimitForObjectProperties);
                    }
                };
            }

            function createLoader(d, parent) {
                var indicatorSize = 30;
                var container = parent.append("g").attr("width", indicatorSize).attr("height", indicatorSize);
                d._ui = Indicator.create(container, indicatorSize);
            }

            function paintObjProperty(d,d3This){
                var uiElement = d.ui; // ui.SimpleText({ text: d.name, textClass: "paragraphHeaderGraph", vertMargin: 5, raze: true});
                var halfWidth = (p.nodeWidth-p.nodeDif) / 2;
                var ti = textInfo(d.name, "basicTextInGraph");
                uiElement.render(d3This, 0 -( (ti.width/2>=halfWidth)?halfWidth:((ti.width)/2)), 10, p.nodeWidth - p.nodeDif);

                var path = (d.direction == 'OUT') ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";//Triangle
                d3This.append("path").attr("d", path).attr("fill", d.parent.color);

                //Circle expander
                var circle = d3This.append("circle").attr({cx:halfWidth,cy:0,r:10, fill:'white',stroke: d.color,'stroke-width':2});
                path = (!d.children) ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";
                var triangle = d3This.append("path").attr("d", path).attr("fill", d.parent.color).attr("transform","translate(" + ((!d.children)?(halfWidth-4):(halfWidth+3)) + "," + 0 + ")");
                circle.on("mousedown", rightAction);
                triangle.on("mousedown", rightAction);

                function rightAction(){
                    if(d['children'] || d['_children'] ){ //If children exist - swaping children
                        if (!('_children' in d))d._children = false;
                        if (d._children) {d.children = d._children;d._children = false;}
                        else {d._children = d.children;d.children = false;}
                        paintAll();
                    } else rightActionForObjectProperty(d); // else trying to execute right action
                }

            }

            function paintInstance(d,d3This){
                var uiElement = (d.expanded)?  d.uiExpanded : d.ui;
                var leftRightHeight = uiElement.height(p.nodeWidth - p.nodeDif);
                var halfWidth = (p.nodeWidth-p.nodeDif) / 2;
                //If it's not root - we create left ear
                var leftEar=null;
                var rightEar=null;
                if (d.parent && !d.error){
                    leftEar = createEar(d, d3This,-halfWidth - p.buttonWidth,
                        -(leftRightHeight / 2) + 1, halfWidth , leftRightHeight,
                        uiElement, leftAction(d), "M5,-5L-5,0L5,5",-halfWidth-(p.buttonWidth)/2);
                }
                //right ear
                if(!d.error){
                    rightEar = createEar(d, d3This, 0 , -(leftRightHeight / 2) + 1, halfWidth + p.buttonWidth ,
                        leftRightHeight, uiElement, function(){
                            if(d['children'] || d['_children'] ){ //If children exist - swaping children
                                if (!('_children' in d))d._children = false;
                                if (d._children) {d.children = d._children;d._children = false;}
                                else {d._children = d.children;d.children = false;}
                                paintAll();
                            } else rightActionForInstance(d); // else trying to execute right action
                        } ,
                        (d.children)?"M5,-5L-5,0L5,5":"M-5,-5L-5,5L5,0", (d.children)?(halfWidth+(p.buttonWidth-4)/2):(halfWidth+(p.buttonWidth)/2));
                }
                //render main element after ears
                uiElement.render(d3This, -halfWidth, -leftRightHeight / 2, p.nodeWidth-p.nodeDif);
                if (!d.error) uiElement.setAction("mousedown.open", centerAction(d));
                uiElement.setAction("mouseover.uwi", onMouseElement(1));
                uiElement.setAction("mouseout.uwi", onMouseElement(0));

                //Changing opacity to 0 or 1
                function onMouseElement(opacity){
                    return function () {
                        if(rightEar!=null) rightEar.transition().duration(p.animdur).attr("opacity", opacity);
                        if (leftEar != null) leftEar.transition().duration(p.animdur).attr("opacity", opacity);
                    };
                }

                //create left or right ear
                function createEar(d, d3This, x ,y, width, height, uiElement, action, path, translate){
                    var ear = d3This.append("g").attr("opacity",0);
                    addBorderedRect(ear, x , y, width, height, 2, "white", uiElement.RxRy(), uiElement.RxRy(), d.color);
                    ear.append("path").attr("d", path).attr("fill", d.color).attr("transform","translate("+translate+",0)");
                    actionSet(ear);
                    return ear;

                    function actionSet(item){
                        item.on("mousedown", action);
                        item.on('mouseover', function () { ear.transition().duration(p.animdur).attr("opacity",1);});
                        item.on('mouseout', function () { ear.transition().duration(p.animdur).attr("opacity",0);});
                    }
                }
            }

            function paintLoader(d,d3This){
                var leftRightHeight = d.ui.height(p.nodeWidth - p.nodeDif);
                d.ui.render(d3This, -((p.nodeWidth-p.nodeDif) / 2)+5, -leftRightHeight / 2, p.nodeWidth-p.nodeDif);
            }

            function updatePaginator(d, d3This) {
                d._ui.currentPage = d.currentPage;
                d._ui.pageCount = d.overallPages;
                d._ui.update();
                var size = svgui.measure(d._ui, vector(p.nodeWidth - p.nodeDif, Infinity));
                svgui.arrange(d._ui, -((size.x / 2 >= (p.nodeWidth - p.nodeDif) / 2)
                    ? (p.nodeWidth - p.nodeDif) / 2 : size.x / 2), -10);
            }

            function updateLoader(d, d3This) {
                var height = d._ui.size;
                d._ui.parent.attr("transform", "translate(" +
                    (-(p.nodeWidth - p.nodeDif) / 2 + 5) + "," + (-height / 2) + ")");
            }
        }

        //painting links
        function paintLinks(){
            var forLinks = formD3ChainCalls(panel, "g#linkers"+graphId+"|id'linkers"+graphId);
            var update = forLinks.selectAll(".link").data(links, function (d) {return d.source.uniqueId + "_" + d.target.uniqueId;});
            var enter = update.enter();
            var exit = update.exit();

            enter.append("path").attr("class", "link").attr('stroke', function (d) {
                    if(d.source.type == elementTypes.instance) return d.source.color;
                    else if(d.source.type == elementTypes.objProperty) return d.source.parent.color;
            }).style('opacity',0);

            update.transition().duration(p.animdur).attr("d", function (d) {
                /// !!!!! X and Y are inverted here!!!!!
                    if(d.source.type == elementTypes.paginator || d.target.type == elementTypes.paginator ) return "M"+ d.target.y+","+ d.target.x;
                    var m = (d.source.y + d.target.y) / 2;
                    var halfWidth = (p.nodeWidth-p.nodeDif) / 2;
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
                    if (d.target.type==elementTypes.objProperty)//if left element is object property - we make a long line
                        suffix += "M" + (d.target.y - halfWidth) + "," + d.target.x +" L" + (d.target.y+halfWidth ) + "," + d.target.x;

                    k = k.map(function (d) { return [ d.y, d.x ];});
                    each(k, function (d) {
                        if (!firstDone) {toRet += d + " C";firstDone = true;}
                        else toRet += d + " ";
                    });

                    return prefix + toRet.trim() + suffix;
                }).style('opacity',1);

            exit.transition().duration(p.animdur).attr("d", function (d) {
                    var o = {x: d.target.x, y: d.target.y};
                    return diagonal({source: o, target: o});
                }).style('opacity', 0).remove();

        }
    }

    //Creates kiv.ui.NiceRoundRectangle with simple text
    function fillInstanceUI(d, expanded, indicatorText){
        var classesString = ( d.class.length>0)?"":"! NO CLASS !";
        each(d.class, function (obj) {
            classesString += getNameFromCollection(obj, Oclasses)+", ";
        });
        classesString = classesString.substr(0, classesString.length-2);

        var lContainerContents = ui.SimpleText({text: d.name,textClass: "basicTextInGraph",vertMargin: 5});
        if(expanded){ //if an item is expanded
            if(!indicatorText){ // if data properties are loaded
                var dataProps = [{left: "отсутствуют", right: ""}];
                if (containsInObj(d, "dataProps") && d.dataProps.length>0) {
                    dataProps = [];
                    each(d.dataProps, function (d) { dataProps.push({left: getNameFromCollection(d.id,dataTypeProperties), right: d.val});});
                }
                var text = ui.StructuredText({nameTextClass: "paragraphHeaderGraph", valTextClass: "basicTextInGraph",
                    struct_text: [{name: "Свойства:", val: dataProps}],
                    percent_leftright: 50, indentBetweenLeftAndRight: 0, horIndent: 15, vertMargin: 3});
                lContainerContents.vertMargin = 3;
                lContainerContents = ui.LayoutContainer1(
                    {upperText: lContainerContents, lowerText: text, lineFill: d.color, lineSize: 2, vertMargin: 6});
            } else { //if data properties are not loaded and indicator should be placed
                lContainerContents =ui.LayoutContainer1(
                    {upperText: ui.SimpleText({text: d.name,textClass: "basicTextInGraph",vertMargin: 5}),
                        lowerText: ui.SimpleText({text: indicatorText,textClass: "basicTextInGraph",vertMargin: 5}), lineFill: d.color, lineSize: 2, vertMargin: 6});
            }
        }

        var toRet = ui.NiceRoundRectangle({uText: classesString,
            lContainer: lContainerContents, color: d.color, marginX: (expanded)?0:20, marginXTop: 20, marginY: 5, borderSize: 2,
            classUpperText: "headersInGraph"
        });
        return toRet;
    }

    //Creates kiv.ui.SimpleText
    function fillObjectPropertyUI(d){
        var toRet = ui.SimpleText({
            text: d.name,
            textClass: "paragraphHeaderGraph",
            vertMargin: 5,
            raze: true
        });
        return toRet;
    }

    //Ui representation of an indicator
    function fillIndicatorUI(item){
        return ui.SimpleText({text: item.info,textClass: "basicTextInGraph",vertMargin: 5});
    }

    function fillPaginatorUI(item){
        return ui.SimpleText({text:
            "Paginator. "+item.currentPage+"/"+item.overallPages+"("+item.limit+"max)",
            textClass: "basicTextInGraph",vertMargin: 5});
    }

    //Generate function which will be invoked if clicked on left ear of some element with d data
    function leftAction(d){
        return function (j) {
            window.location.assign("/resource/?uri=" + encodeURIComponent(j.id).replace(/'/g,"%27").replace(/"/g,"%22"));
        };
    }

    //Generate function which will be invoked if clicked on right ear of some element with d data
    function rightActionForInstance(d){
        requestForObjPropPage(d,1, renderParams.pageLimitForObjectProperties);
    }

    //Generate function which will be invoked if clicked on right ear of some element with d data
    function rightActionForObjectProperty(d){
        requestForInstances(d.parent,d,1,renderParams.pageLimitForInstances);
    }

    //Generate function which will be invoked if clicked on center of instance element
    function centerAction(d){
        return function () {
            if(!d.dpLoaded) requestForDataProperties(d, d.uiExpanded);
            d.expanded = !d.expanded;
            paintAll();
        };
    }

    //MUST be invoked after each request to maintain cache
    function updateCachedData(requestResult){
        mergeProperties(Oclasses, requestResult['classes']);
        arrayOfClassVals = objToArrayValues(Oclasses);
        arrayOfClassKeys = objToArrayKeys(Oclasses);

        mergeProperties(objectProperties, requestResult['objProps']);
        arrayOfObjectPropVals = objToArrayValues(objectProperties);
        arrayOfObjectPropKeys = objToArrayKeys(objectProperties);

        mergeProperties(dataTypeProperties, requestResult['dataProps']);
        arrayOfDataPropsVals = objToArrayValues(dataTypeProperties);
    }

    //Generate unique id
    function generateUniqueId(){
        return (++idCounter);
    }

    //Get either label or modified URI
    function getName(uri, label){
        if(label && label.length>0) return label;
        else return uri2Name(uri);
    }

    //Check collection for name of some object
    function getNameFromCollection(uri, collection) {
        if (uri in collection) return (containsInObj(collection[uri], 'label')) ? getName(uri,collection[uri].label) : uri2Name(uri);
        else return uri2Name(uri);
    }

    //We get info after last slash (usually it is the best)
    function uri2Name(uri){
        //Anonym URI's usually don't contain /
        if (uri.indexOf("/") != -1) return uri.substring(uri.lastIndexOf('/') + 1);
        return uri;
    }

    //filling model for instance from request. It should have id, label, class and dataProps
    function fillModelForInstance(instance, hasDataProps){
        instance.uniqueId = generateUniqueId();
        instance.name = getName(instance.id,instance.label);
        instance.class.sort();
        instance.color = classColorGetter.getSomeObjectColor(instance.class);
        instance.expanded = false;
        instance.ui = fillInstanceUI(instance,false); //collapsed version in ui
        if(hasDataProps) instance.uiExpanded = fillInstanceUI(instance, true, null); //expanded version in uiExpanded, before request, it should be indicator
        else instance.uiExpanded = fillInstanceUI(instance, true, "Loading..."); //expanded version in uiExpanded, before request, it should be indicator
        instance.dpLoaded = hasDataProps;
        instance.type = elementTypes.instance;
        //usedElements.set(instance.uniqueId,instance);
        return instance;
    }

    //filling model for object property
    function fillModelForObjectProperty(objProperty, color){
        objProperty.uniqueId = generateUniqueId();
        objProperty.name = getNameFromCollection(objProperty.objPropId,objectProperties);
        objProperty.color = color;
        objProperty.ui = fillObjectPropertyUI(objProperty);
        objProperty.type = elementTypes.objProperty;
        //usedElements.set(objProperty.uniqueId,objProperty);
        return objProperty;
    }

    //filling model for loading indicator
    function fillModelForIndicator(text){
        var indicator = {}; //creating loader and setting it as a child until loading done
        indicator.uniqueId =generateUniqueId();
        indicator.info= text;
        indicator.ui = fillIndicatorUI(indicator);
        indicator.type = elementTypes.loader;
        return indicator;
    }

    function fillPaginatorModel(pageNum,currentLimit,maxPages){
        var paginator = {}; //creating loader and setting it as a child until loading done
        paginator.uniqueId =generateUniqueId();
        paginator.currentPage= pageNum;
        paginator.overallPages = maxPages;
        paginator.limit = currentLimit;
        paginator.type = elementTypes.paginator;
        paginator.ui =  fillPaginatorUI(paginator);
        return paginator;
    }

    //_______________REQUESTS

    //First request which retrieves info about root element
    //example: http://dbpedia.org/sparql$instanceGeneralInfo.InstanceGeneralInfoRequest$http://dbpedia.org/resource/Blackmore's_Night
    function initialRootRequest(){
        var indicator = Indicator.create(svg);
        var request = kiv.smartServerRequest({
            request: renderParams.sparqlEndpoint+"$instanceGeneralInfo.InstanceGeneralInfoRequest$"+renderParams.idOfInstance,
            url: renderParams.service,
            waitHandler: function(d){indicator.status(d);},
            finishHandler: function(d){
                try {
                    var result = (eval('(' + d + ')'));
                    updateCachedData(result);
                    mainRoot = fillModelForInstance(result.request,false);
                    indicator.stop();
                    requestForObjPropPage(mainRoot,1, renderParams.pageLimitForObjectProperties);
                    zoomer.translate(-mainRoot.y+ p.nodeWidth/2, -mainRoot.x+h/2);
                } catch (e) {
                    alert(e);
                    /*indicator.error();indicator.text(e, *//*TODO style for error msg*//* "error style???");*/
                }
            },
            errorHandler:function(d){indicator.error();indicator.status(d);},
            interval:renderParams.interval
        });
        //todo there should exist ui component which would invoke request.cancel() if needed
    }

    //Request for object properties page of an instance
    //example: http://dbpedia.org/sparql$objPropsPage.ObjPropsPageRequest$http://dbpedia.org/resource/United_States$BOTH$1$10
    function requestForObjPropPage(instance, pageNum, currentLimit){
        instance.children = [fillModelForIndicator("Loading...")];
        var request = kiv.smartServerRequest({
            request: renderParams.sparqlEndpoint+"$objPropsPage.ObjPropsPageRequest$"+instance.id+"$BOTH$"+pageNum+"$"+currentLimit,
            url: renderParams.service,
            waitHandler: function(d){/*TODO indicatorUi.text(d,  style for wait msg "wait style???");*/},
            finishHandler: function(d){
                try {
                    var result = (eval('(' + d + ')'));
                    updateCachedData(result);
                    instance.children = [];
                    if (result.request.pageNum > 1) {
                        instance.children.push(fillPaginatorModel(pageNum, currentLimit, result.request.pageNum));
                    }
                    each(result.request.values, function(d){
                        instance.children.push(fillModelForObjectProperty(d,instance.color));
                    });
                    paintAll();
                    zoomer.translate(-instance.y+ p.nodeWidth/2, -instance.x+h/2);
                } catch (e) {
                    alert(e);
                    /*todo indicatorUi.error();indicatorUi.text(d, TODO style for error msg "error style???");*/
                }
            },
            errorHandler:function(d){/*todo indicatorUi.error();indicatorUi.text(d, TODO style for error msg "error style???");*/},
            interval:renderParams.interval
        });
        //todo there should exist ui component which would invoke request.cancel() if needed
        paintAll();
    }

    //Request for instances of a particular object property (of a particular instance :))
    //example: http://dbpedia.org/sparql$instsPage.InstsPageRequest$http://dbpedia.org/resource/United_States$IN$http://dbpedia.org/ontology/almaMater$1$503
    function requestForInstances(instance,objProperty, pageNum, currentLimit){
        objProperty.children = [fillModelForIndicator("Loading...")];
        var request = kiv.smartServerRequest({
            request: renderParams.sparqlEndpoint+"$instsPage.InstsPageRequest$"+instance.id+"$"+objProperty.direction+"$"+objProperty.objPropId+"$"+pageNum+"$"+currentLimit,
            url: renderParams.service,
            waitHandler: function(d){/*TODO indicatorUi.text(d,  style for wait msg "wait style???");*/},
            finishHandler: function(d){
                try {
                    var result = (eval('(' + d + ')'));
                    updateCachedData(result);
                    objProperty.children = [];
                    if (result.request.pageNum > 1) {
                        objProperty.children.push(fillPaginatorModel(pageNum, currentLimit, result.request.pageNum));
                    }
                    each(result.request.values, function(d){
                        objProperty.children.push(fillModelForInstance(d,false));
                    });
                    paintAll();
                    //zoomer.translate(-instance.y+ p.nodeWidth/2, -instance.x+h/2);
                    zoomer.translate(-objProperty.y+ p.nodeWidth/2, -objProperty.x+h/2);
                } catch (e) {
                    alert(e);
                    /*todo indicatorUi.error();indicatorUi.text(d, TODO style for error msg "error style???");*/
                }
            },
            errorHandler:function(d){/*todo indicatorUi.error();indicatorUi.text(d, TODO style for error msg "error style???");*/},
            interval:renderParams.interval
        });
        //todo there should exist ui component which would invoke request.cancel() if needed
        paintAll();
    }

    //Request for data properties
    //example: http://dbpedia.org/sparql$instanceInfoWithDP.InstanceInfoWithDPRequest$http://dbpedia.org/resource/Blackmore's_Night
    function requestForDataProperties(element, indicatorUi){
        var request = kiv.smartServerRequest({
            request: renderParams.sparqlEndpoint+"$instanceInfoWithDP.InstanceInfoWithDPRequest$"+element.id,
            url: renderParams.service,
            waitHandler: function(d){/*TODO indicatorUi.text(d,  style for wait msg "wait style???");*/},
            finishHandler: function(d){
                try {
                    var result = (eval('(' + d + ')'));
                    updateCachedData(result);
                    var newinstance = fillModelForInstance(result.request,true);
                    element.uiExpanded = newinstance.uiExpanded;
                    element.dpLoaded = newinstance.dpLoaded;
                    paintAll();
                } catch (e) {
                    alert(e);
                    /*todo indicatorUi.error();indicatorUi.text(d, TODO style for error msg "error style???");*/
                }
            },
            errorHandler:function(d){/*todo indicatorUi.error();indicatorUi.text(d, TODO style for error msg "error style???");*/},
            interval:renderParams.interval
        });
        //todo there should exist ui component which would invoke request.cancel() if needed
    }

    //REQUESTS_______________

//-----------------------/PRIVATE-------------------------------------------------------

    return returned;
};

function startIt(containerid,sefvice,endpoint, idOfInstance){
    var pageViewer = ailab.kiv.pageViewer({width:$(window).width()-20,height:$(window).height()-20});
    pageViewer.RENDER({
        containerid: containerid,
        idOfInstance: idOfInstance,
        sparqlEndpoint: endpoint,
        service: sefvice
    });
}

/////////////////////////TREE ELEMENT PROPERTIES (RENDERED DATA MODEL)/////
/*
instance type = {
    uniqueId,        globally unique id of element to identify it
    id,              id of instance
    color,           color of instance
    error,           some error occured during forming instance. We do not show ears on error'd nodes
    name,            name of instance (label or substring of id)
    expanded,        if true - data properties are visible, else data props are hidden
    class[],         Class id's of instance
    dataProps[],     Data property id's of instance
    children*[],     Children are forming tree structure. * - is needed for d3
    ui,              Ui field if expanded is false
    uiExpanded,      Ui field if expanded is true
    dpLoaded,        If data properties were not loaded - it is false, else it is true
    type:"instance"
}

objProperty type = {
    objPropId             id of object property
    uniqueId,             globally unique id of element to identify it
    name,                 name of object property
    color,                color
    children*[],          Children are forming tree structure. * - is needed for d3
    direction,            "IN" or "OUT"
    ui,                   Field of ui related structures. Needed to calc height for example.
    type: "objProperty"
}

loader type = {
    uniqueId,             globally unique id of element to identify it
    info,                 String with information about loading
    ui                    Field of ui related structures. Needed to calc height for example.
}

paginator type = {
    uniqueId,             globally unique id of element to identify it
    currentPage,          current page of the indicator
    overallPages,         overall number of pages
    limit,                current limit
    ui
}
*/
//////////////////////////////////////////////////////////////////////////////