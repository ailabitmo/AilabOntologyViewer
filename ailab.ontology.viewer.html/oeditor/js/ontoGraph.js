//-----------------------------------------------------------------------------------------
//-----------------------------------------ONTOLOGY VIEWER
//-----------------------------------------------------------------------------------------
var tooltip = kiv.tooltip("tooltip");
kiv.graphStuff.ontologyViewerTreeNew = function (params) {
    var defaultParams = {
        width: 1200, height: 600, nodewidth: 330, nodeDif: 100, heightPerTextLine: 1,
        heightBetweenNodesOfOneParent: 10, heightBetweenNodesOfDifferentParent: 40,
        animdur: 500, containerid: 'chart', buttonWidth: 0,buttonWidth2: 15, textInLine: 35,
        tooltiper:tooltip
    };
    params = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;

    var w = params.width;
    var h = params.height;
    var nodeWidth = params.nodewidth;
    var nodeDif = params.nodeDif;
    var buttonWidth = params.buttonWidth;
    var buttonWidth2 = params.buttonWidth2;
    var heightPerTextLine = params.heightPerTextLine;
    var heightBetweenNodesOfOneParent = params.heightBetweenNodesOfOneParent;
    var heightBetweenNodesOfDifferentParent = params.heightBetweenNodesOfDifferentParent;
    var animationDuration = params.animdur;
    var tooltiper = params.tooltiper;
    var ui = kiv.UI(tooltiper);
    var textInLine = params.textInLine;
    var histowidth = nodeWidth - nodeDif + 20;

    var history = [];

    function calcHeight(d) {
        var a;
        if (!d.expanded) {
            var name = (d.classes && d.classes.length>0)?"":"! NO CLASS !";
            each(d.classes, function (obj) {
                if (obj.name != 'owl#NamedIndividual') name += obj.name+",";
            });
            a = ui.NiceRoundRectangle({uText: name,
                lContainer: ui.SimpleText({
                    text: d.name,
                    textClass: "basicTextInGraph",
                    vertMargin: 5
                }), color: d.headcolor, marginX: 20, marginXTop: 20, marginY: 5, borderSize: 2,
                classUpperText: "headersInGraph"
            });

            return a.height(nodeWidth - nodeDif);
        } else {
            var dataProps = [
                {left: "отсутствуют", right: ""}
            ];
            if (containsInObj(d, "dataProps")) {
                dataProps = [];
                each(d.dataProps, function (d) {
                    dataProps.push({left: d.name, right: d.value});
                });
            }

            var text = ui.StructuredText(
                {nameTextClass: "paragraphHeaderGraph", valTextClass: "basicTextInGraph",
                    struct_text: [
                        {name: "Свойства:", val: dataProps}
                    ],
                    percent_leftright: 50, indentBetweenLeftAndRight: 0, horIndent: 15, vertMargin: 3
                }
            );

            var textSimple = ui.SimpleText({
                text: d.name,
                textClass: "basicTextInGraph",
                vertMargin: 3
            });

            var container = ui.LayoutContainer1(
                {upperText: textSimple, lowerText: text, lineFill: d.headcolor, lineSize: 2, vertMargin: 6}
            );

            var name = (d.classes && d.classes.length>0)?"":"! NO CLASS !";
            each(d.classes, function (obj) {
                if (obj.name != 'owl#NamedIndividual') name += obj.name+",";
            });
            a = ui.NiceRoundRectangle({
                uText: name,
                //lContainer: textSimple,
                lContainer: container,
                color: d.headcolor, marginX: 0, marginXTop: 20, marginY: 5, borderSize: 2,
                classUpperText: "headersInGraph"});

            return a.height(nodeWidth - nodeDif);
            /*var rects = getExpandedlementList(d);
             var currentY = 0;
             var allHeight = d['_$_height_$_'];
             for (var rectI in rects) {
             var rect = rects[rectI].render(d3.select(this), 0, -allHeight / 2 + currentY + rects[rectI].height() / 2);
             a = (a == 0) ? rect : a;
             currentY += rects[rectI].height();
             }
             var x = 0;*/
        }
    }

    var tree = d3.layout.tree()
        .nodeSize([heightPerTextLine, nodeWidth])
        .separation(function (a, b) {

            var height1 = calcHeight(a);
            var height2 = calcHeight(b);
            /*name = "";
             each(b.classes,function(obj){
             if(obj.name!='owl#NamedIndividual') name = obj.name;
             });
             var height2 = kiv.UI().NiceRoundRectangle({uText: name,
             lContainer: kiv.UI().SimpleText({
             text: b.name,
             textClass:"basicTextInGraph",
             vertMargin:5
             }), color:b.headcolor,marginX:20,marginXTop:20,marginY:5,borderSize:2,
             classUpperText:"headersInGraph"
             }).height(nodeWidth - nodeDif);*/

            var dif = height1 / 2 + height2 / 2 + (a.parent == b.parent ? heightBetweenNodesOfOneParent : heightBetweenNodesOfDifferentParent);

            return dif;
        });

    var diagonal = d3.svg.diagonal().projection(function (d) {
        return [d.y, d.x];
    });

    var svg = d3.select("#" + params.containerid).append("svg:svg")
        .attr('id',"svg_id")
        .attr("width", w).attr("height", h)
        .attr("pointer-events", "all");

    var indi = null;
    var zoomPart = formD3ChainCalls(svg, "g#zoom_part|id'zoom_part");
    /*var historypart = formD3ChainCalls(svg, "g#hist_part|id'hist_part");
     addRect(historypart, 30, 50, histowidth, h - 100, 5, 5)
     .attr("fill", "lightgray")
     .attr("stroke", 'blue')
     .attr("stroke-width", 2);*/

    var zoomer = kiv.zoomingArea(w, h, zoomPart, 'white', [0.6, 2]);
    zoomer.getOuterGroup().on("dblclick.zoom", null);
    zoomer.translate(-nodeWidth/2, h / 2);


    svg = zoomer.getZoomingGroup();

    function ontologyViewerTree() {
    }

    var KID = 0;

    ontologyViewerTree.render = function (ip) {
        var defaultParams = {
            idOfInstance: null, requestString: "", mainRoot: null, currentRoot: null, usedElements: {},
            sparqlEndpoint: "", service: ""
        };
        ip = (arguments.length == 1) ? mergeProperties(ip, defaultParams) : defaultParams;
        indi = Indicator.create(d3.select("#svg_id"));
        queryService(ip.sparqlEndpoint + "$" + ip.idOfInstance, ip.service, function (d) {
            try {
                var allData = eval('(' + d + ')');
                indi.stop();
            } catch (e) {
                indi.error();
                return;
            }

            var objects = allData['objects'];

            mergeProperties(Oclasses, allData['classes']);
            arrayOfClassVals = objToArrayValues(Oclasses);
            arrayOfClassKeys = objToArrayKeys(Oclasses);

            mergeProperties(objectProperties, allData['objProps']);
            arrayOfObjectPropVals = objToArrayValues(objectProperties);
            arrayOfObjectPropKeys = objToArrayKeys(objectProperties);

            mergeProperties(dataTypeProperties, allData['dataProps']);
            arrayOfDataPropsVals = objToArrayValues(dataTypeProperties);

            var mainElement = ip.idOfInstance;
            var objProperties = {parent: mainElement};
            var nodemap = formNodeMap(objects, ip.idOfInstance, objProperties);
            //var objPropElements = formObjProperties(nodemap);
            var usedElements = ip.usedElements;

            //формируем дерево с классами.
            var root = (ip.currentRoot == null) ? nodemap[mainElement] : ip.currentRoot;
            var objPropNodes = {};
            //Формируем дерево
            each(nodemap, function (d, i) {
                if (d != root)
                    each(objProperties, function (jj, dd) {
                        if (!(typeof objProperties[dd] === "string") && containsInObj(objProperties[dd], d.id) && (dd in objectProperties)) {
                            var children = [];
                            if (!(dd in objPropNodes)) {
                                objPropNodes[dd] = {name: getLabel(objectProperties[dd].id, objectProperties), children: children, IN:jj.IN, isRoot: true, headcolor: (d.parent)?d.parent.headcolor: d.headcolor};
                                if (!containsInObj(usedElements, dd))  usedElements[dd] = 1;
                                else objPropNodes[dd].cloned = '_' + (KID++);
                            }
                            children = objPropNodes[dd].children;
                            if (!(i in usedElements)) {
                                children.push(nodemap[i]);
                                usedElements[i] = 1;
                            } else {
                                var newObj = jQuery.extend(true, {}, nodemap[i]);
                                newObj.cloned = '_' + (KID++);
                                children.push(newObj);
                            }
                        }
                    });
                else {
                    if (!(i in usedElements)) {
                        usedElements[i] = 1;
                    } else {
                        var newObj = jQuery.extend(true, {}, nodemap[i]);
                        newObj.cloned = '_' + (KID++);
                        root = newObj;
                    }
                }
            });

            //Назначаем последователей
            root.children = objToArrayValues(objPropNodes);
            //root.isRoot = true;
            root.querry = ip.requestString;
            root.usedElements = usedElements;
            if (ip.mainRoot == null) ip.mainRoot = root;

            paintAll(svg, ip.mainRoot, function () {
                    return function (j) {
                        window.location.assign("/resource/?uri=" + encodeURIComponent(j.id).replace(/'/g,"%27").replace(/"/g,"%22"));
                    }
                }, function (a, bbb) {
                    return function (j) {
                        bbb.expanded = !bbb.expanded;
                    }
                },
                function (d) {
                    return function (k) {
                        ontologyViewerTree.render({idOfInstance: k.id, requestString: getRequestToInstance(k.id), mainRoot: ip.mainRoot, currentRoot: k, usedElements: ip.usedElements, sparqlEndpoint: ip.sparqlEndpoint, service: ip.service});
                    }
                }
            );
        },function(d){
            indi.error();
            return;
        });

        function formNodeMap(objects, idroot, objProperties) {
            var nodemap = {};
            for (var indexx in objects) {
                var obj = objects[indexx];
                var node = ((obj['id'] == idroot)) ? {id: indexx, /*x: 0, y: 0,*/ main: true} : {id: indexx, main: false/*, x: 0, y: 0*/};
                node.headcolor = function () {
                    var classes = [];
                    each(obj.class,function(d){classes.push(d);});
                    classes.sort();
                    return getSomeObjectColor(classes, arrayOfClassKeys);
                }();
                node['label'] = getLabel(obj.id, objects);
                node['name'] = getLabel(obj.id, objects);
                node['classes'] = [];
                each(obj.class,function(d){
                    node['classes'].push( {'name': getLabel(d, Oclasses), id: d});
                });


                var dataProps = [];
                for (var indexz in obj.dataProps) {
                    var dataPropId = obj.dataProps[indexz].id;
                    var dataPropValue = obj.dataProps[indexz].val;
                    var dataPropName = getLabel(dataPropId, dataTypeProperties);
                    dataProps.push({name: dataPropName, value: dataPropValue});
                }
                node['dataProps'] = dataProps;
                node['expanded'] = false;

                if (obj.id == idroot) {
                    node['inProperties'] = addObjPropsToNode(obj.inObjProps, objProperties, true);
                    node['outProperties'] = addObjPropsToNode(obj.outObjProps, objProperties, false);
                }
                nodemap[indexx] = node;
            }
            return nodemap;
        }

        function addObjPropsToNode(objProps, objProperties, inOrOut) {
            var props = [];
            for (var index in objProps) {
                /*var opID = objProps[index].id;
                 var opVal = objProps[index].val;*/
                var opName = getLabel(index, objectProperties);
                each(objProps[index],function(d){
                    props.push({id: index, name: opName, value: d});
                    if (!containsInObj(objProperties, index)) {
                        objProperties[index] = {};
                    }
                    objProperties[index]['IN'] = inOrOut;
                    objProperties[index][d] = 1;
                });
            }
            return props;
        }
    };

    return ontologyViewerTree;

    function paintAll(svgParent, root, leftActionGenerator, centerActionGenerator, rightActionForLeafs) {
        var nodes = tree.nodes(root);
        var links = tree.links(nodes);

        setParent(nodes);

        var imbaelement = formD3ChainCalls(svgParent, "g#imbah|id'imbah");
        imbaelement.text('');
        var forLinks = formD3ChainCalls(svgParent, "g#linkers|id'linkers");
        forLinks.attr('transform', 'translate(' + nodeWidth + ',' + 0 + ')');
        var link = forLinks.selectAll(".link")
            .data(links, function (d) {
                return d.source.name + (containsInObj(d.source, 'cloned') ? d.source.cloned : "") + "_" + d.target.name + (containsInObj(d.target, 'cloned') ? d.target.cloned : "");
            });
        var linkEnter = link
            .enter().append("path")
            .attr("class", "link")
            .attr('stroke', function (d) {
                if(d.source.label) return d.source.headcolor;
                else return d.source.parent.headcolor;
            });

        var linkUpdate = link;
        linkUpdate
            .attr("d", function (d) {
                var m = (d.source.y + d.target.y) / 2;
                var p = [
                    {x: d.source.x, y: d.source.y + (nodeWidth-nodeDif) / 2 +buttonWidth},
                    {x: d.source.x, y: m},
                    {x: d.target.x, y: m},
                    {x: d.target.x, y: d.target.y - (nodeWidth-nodeDif) / 2 + ((d.target.isRoot) ? buttonWidth * 2 : buttonWidth)}
                ];

                var toRet = "";
                var prefix = "M";
                var suffix = "";
                var firstDone = false;

                if (!containsInObj(d.source, "classes")) {
                    prefix += d.source.y + "," + d.source.x + " L" + (d.source.y + (nodeWidth-nodeDif) / 2 - buttonWidth) + "," + d.source.x + " M";
                }
                if (!containsInObj(d.target, "classes")) {
                    suffix += " L" + d.target.y + "," + d.target.x;
                }

                p = p.map(function (d) {
                    return [ d.y, d.x ]
                });

                each(p, function (d) {
                    if (!firstDone) {
                        toRet += d + " C";
                        firstDone = true;
                    }
                    else {
                        toRet += d + " ";
                    }
                });
                toRet = toRet.trim();

                return prefix + toRet + suffix;
            });
        //return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
        //M0,0C150,0 150,-146.25 300,-146.25

        var linkExit = link.exit().transition().duration(animationDuration)
            .attr("d", function (d) {
                var o = {x: d.target.x, y: d.target.y};
                return diagonal({source: o, target: o});
            })
            .style('opacity', 0).remove();

        var forNodes = formD3ChainCalls(svgParent, "g#noderz|id'noderz");
        forNodes.attr('transform', 'translate(' + nodeWidth + ',' + 0 + ')');
        var node = forNodes.selectAll(".node").data(nodes, function (d) {
            var name = d.name + ((('children' in d) || ('_children' in d)) ? "_children" : "_nochildren");
            if ('cloned' in d) name += d.cloned;
            name += d.expanded;
            return name;
        });
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr('transform', function (d) {
                if (typeof d === 'object' && 'parent' in d) return "translate(" + d.parent.y + "," + d.parent.x + ")";
                else return "translate(0,0)"
            })
            .style('opacity', 0);

        var nodeUpdate = node;
        nodeUpdate.transition().duration(animationDuration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .style('opacity', 1)
            .each(function (d) {
                d3.select(this).text('');

                if (!containsInObj(d, "classes")) {
                    //In or out
                    var inOrOut = (d.IN)?"IN":"OUT";

                    var text = ui.SimpleText({
                        text: d.name,
                        textClass: "paragraphHeaderGraph",
                        vertMargin: 5,
                        raze: true
                    });
                    var ti = textInfo(d.name, "basicTextInGraph");
                    text.render(d3.select(this), 0 -( (ti.width/2>=(nodeWidth - nodeDif)/2)?(nodeWidth - nodeDif) / 2:((ti.width)/2)), 10, nodeWidth - nodeDif);

                    var path = (inOrOut == 'OUT') ? "M0,-5L10,0L0,5" : "M0,-5L-10,0L0,5";
                    d3.select(this).append("path").attr("d", path).attr("fill", d.parent.headcolor);

                    return;
                }

                var a = 0;
                if (!d.expanded) {
                    var name = ( d.classes.length>0)?"":"! NO CLASS !";
                    each(d.classes, function (obj) {
                        if (obj.name != 'owl#NamedIndividual') name+= obj.name+", ";
                    });
                    name = name.substr(0, name.length-2);
                    a = ui.NiceRoundRectangle({uText: name,
                        lContainer: ui.SimpleText({
                            text: d.name,
                            textClass: "basicTextInGraph",
                            vertMargin: 5
                        }), color: d.headcolor, marginX: 20, marginXTop: 20, marginY: 5, borderSize: 2,
                        classUpperText: "headersInGraph"
                    });
                    d['_$_uirect_$_'] = [a];
                    /*a = addRectWithFullText(d, nodeWidth - nodeDif, 5, 5, ('headcolor' in d) ? (d.headcolor != null) ? d.headcolor : 'gray' : 'lightgray', d.name, 'headersInGraph', d3.select(this), 0, 0, 5, 5);
                     a.render();*/
                } else {
                    var dataProps = [
                        {left: "отсутствуют", right: ""}
                    ];
                    if (containsInObj(d, "dataProps")) {
                        dataProps = [];
                        each(d.dataProps, function (d) {
                            dataProps.push({left: d.name, right: d.value});
                        });
                    }

                    var text = ui.StructuredText(
                        {nameTextClass: "paragraphHeaderGraph", valTextClass: "basicTextInGraph",
                            struct_text: [
                                {name: "Свойства:", val: dataProps}
                            ],
                            percent_leftright: 50, indentBetweenLeftAndRight: 0, horIndent: 15, vertMargin: 3
                        }
                    );

                    var textSimple = ui.SimpleText({
                        text: d.name,
                        textClass: "basicTextInGraph",
                        vertMargin: 3
                    });

                    var container = ui.LayoutContainer1(
                        {upperText: textSimple, lowerText: text, lineFill: d.headcolor, lineSize: 2, vertMargin: 6}
                    );

                    var name = (d.classes.length>0)?"":"! NO CLASS !";
                    each(d.classes, function (obj) {
                        if (obj.name != 'owl#NamedIndividual')name+= obj.name+", ";

                    });
                    name = name.substr(0, name.length-2);
                    a = ui.NiceRoundRectangle({
                        uText: name,
                        //lContainer: textSimple,
                        lContainer: container,
                        color: d.headcolor, marginX: 0, marginXTop: 20, marginY: 5, borderSize: 2,
                        classUpperText: "headersInGraph"});
                    d['_$_uirect_$_'] = [a];
                    /*var rects = getExpandedlementList(d);
                     var currentY = 0;
                     var allHeight = d['_$_height_$_'];
                     for (var rectI in rects) {
                     var rect = rects[rectI].render(d3.select(this), 0, -allHeight / 2 + currentY + rects[rectI].height() / 2);
                     a = (a == 0) ? rect : a;
                     currentY += rects[rectI].height();
                     }
                     var x = 0;*/
                }

                var leftRightheight = d['_$_uirect_$_'][0].height(nodeWidth - nodeDif);
                var left=null;
                if (d.parent) {
                    left = d3.select(this).append("g").attr("opacity",0);
                    var rrect = addBorderedRect(left, -(nodeWidth - nodeDif) / 2 -buttonWidth2 , -(leftRightheight / 2) + 1, (nodeWidth - nodeDif) / 2 + buttonWidth, leftRightheight, 2, "white", a.RxRy(), a.RxRy(), d.headcolor);
                    rrect.on("mousedown.left", leftActionGenerator());
                    rrect.on('mouseover.left', function (d, i) {
                        left.transition().duration(animationDuration).attr("opacity",1);
                    });
                    rrect.on('mouseout.left', function (d, i) {
                        left.transition().duration(animationDuration).attr("opacity",0);
                    });

                    var lpth = left.append("path").attr("d", "M0,-5L-10,0L0,5").attr("fill", d.headcolor).attr("transform","translate("+(-(nodeWidth - nodeDif) / 2-(buttonWidth2-10)/2)+",0)");
                    lpth.on("mousedown.left", leftActionGenerator());
                    lpth.on('mouseover.left', function (d, i) {
                        left.transition().duration(animationDuration).attr("opacity",1);
                    });
                    lpth.on('mouseout.left', function (d, i) {
                        left.transition().duration(animationDuration).attr("opacity",0);
                    });

                }

                var right = d3.select(this).append("g").attr("opacity",0);
                var rRect = addBorderedRect(right, 0, -(leftRightheight / 2) + 1, (nodeWidth - nodeDif) / 2 + buttonWidth2, leftRightheight, 2, "white", a.RxRy(), a.RxRy(), d.headcolor);

                if (('children' in d) || containsInObj(d, '_children')) rRect.on("mousedown.close", function (dd) {
                    var cur = d;
                    if (!('_children' in cur))cur._children = false;
                    if (cur._children) {
                        cur.children = cur._children;
                        cur._children = false;
                    } else {
                        cur._children = cur.children;
                        cur.children = false;
                    }
                    paintAll(svg, root, leftActionGenerator, centerActionGenerator, rightActionForLeafs);
                });
                else rRect.on("mousedown.close", rightActionForLeafs(d));
                rRect.on('mouseover.left', function (d, i) {
                    right.transition().duration(animationDuration ).attr("opacity", 1);
                });
                rRect.on('mouseout.left', function (d, i) {
                    right.transition().duration(animationDuration ).attr("opacity", 0);
                });

                var rpth = (d.children)?right.append("path").attr("d", "M0,-5L-10,0L0,5").attr("fill", d.headcolor).attr("transform","translate("+((nodeWidth - nodeDif) / 2+(buttonWidth2+8)/2)+",0)")
                    :right.append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", d.headcolor).attr("transform","translate("+((nodeWidth - nodeDif) / 2+(buttonWidth2-10)/2)+",0)");
                if (('children' in d) || containsInObj(d, '_children')) rpth.on("mousedown.close", function (dd) {
                    var cur = d;
                    if (!('_children' in cur))cur._children = false;
                    if (cur._children) {
                        cur.children = cur._children;
                        cur._children = false;
                    } else {
                        cur._children = cur.children;
                        cur.children = false;
                    }
                    paintAll(svg, root, leftActionGenerator, centerActionGenerator, rightActionForLeafs);
                });
                else rpth.on("mousedown.close", rightActionForLeafs(d));
                rpth.on('mouseover.left', function (d, i) {
                    right.transition().duration(animationDuration).attr("opacity",1);
                });
                rpth.on('mouseout.left', function (d, i) {
                    right.transition().duration(animationDuration).attr("opacity",0);
                });

                a.render(d3.select(this), -(nodeWidth - nodeDif) / 2, -a.height(nodeWidth - nodeDif) / 2, nodeWidth - nodeDif);
                if (containsInObj(d, 'classes'))
                    a.setAction("click.open", function () {
                        centerActionGenerator(imbaelement, d)();
                        paintAll(svg, root, leftActionGenerator, centerActionGenerator, rightActionForLeafs);
                    });
                a.setAction("mouseover.uwi", function () {
                    right.transition().duration(animationDuration).attr("opacity",1);
                    if(left!=null) left.transition().duration(animationDuration).attr("opacity",1);
                });
                a.setAction("mouseout.uwi", function () {
                    right.transition().duration(animationDuration).attr("opacity",0);
                    if(left!=null) left.transition().duration(animationDuration).attr("opacity",0);
                });
            });

        var nodeExit = node.exit().transition().duration(animationDuration)
            .style('opacity', 0)
            .attr('transform', function (d) {
                if (typeof d === 'object' && 'parent' in d) return "translate(" + d.parent.y + "," + d.parent.x + ")";
                else return "translate(0,0)"
            })
            .remove();
    }

    function setParent(node) {
        if ('children' in node) {
            for (var index in node.children) {
                node.children[index].parent = node;
                setParent(node.children[index]);
            }
        }
    }
};

//-----------------------------------------------------------------------------------------
//-----------------------------------------/ONTOLOGY VIEWER
//-----------------------------------------------------------------------------------------