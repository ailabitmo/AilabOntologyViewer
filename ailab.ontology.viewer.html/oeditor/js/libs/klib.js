/**
 * Created by Khodyrev Ivan
 * Licensed under Apache 2.0
 * Repository: https://github.com/kivan-mih/JSHelpers
 */
kiv = {};
kiv.graphStuff = {};
//-----------------------------------------------------------------------------------------
//-----------------------------------------GRAPH
//-----------------------------------------------------------------------------------------
kiv.graphStuff.graph = function (outer, linesFirst) {
    //Линии рисуются первыми
    linesFirst = (arguments.length == 2) ? linesFirst : 0;
    //Внешний элемент
    var outerElement = outer,
    //Функция вызывается в начале перерисовки
        rebuildSVGStart = function () {
        },
    //Функция вызывается в конце перерисовки
        rebuildSVGEnd = function () {
        },
    //Функции создания, обновления и удаления линков и нодов
        linkCreator = function (link) {
            link.append('path').attr('stroke', 'black').attr('fill', 'none').attr('stroke-width', function (d, i) {
                return '2px';
            });
        },
        linkUpdater = function (link) {
            link.select('path').attr("d", function (d, i) {
                return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y;
            });
        },
        linkRemover = function (link) {
            link.remove() ;
        },
        nodeCreator = function (node) {
            node.append('circle').attr("r", 5);
        },
        nodeUpdater = function (node) {
            node.attr('transform', function (d, i) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        },
        nodeRemover = function (node) {
            node.remove() ;
        },
    //Это контейнер с линками. Линки задаются пафами
        linksOnSVG = false,
    //Это контейнер с нодами. Ноды задаются группами элементов
        nodesOnSVG = false,
    //Это реальные ноды (в примере обязательные поля, которые будут использоваться)
        nodes = [
            {x: 0, y: 0},
            {x: 5, y: 5}
        ],
    //Это реальные линки (в примере обязательные поля, которые будут использоваться)
        links = [
            {source: nodes[0], target: nodes[1]}
        ],
    //Функции мапинга для линков и нодов
        keyFuncLinks,
        keyFuncNodes,
    //Функции для удаления линков и нодов
        deleteLink = function (link) {
            links.splice(links.indexOf(link), 1);
        },
        deleteNode = function (node) {
            spliceNodes(node);
        },
        updatePositions = function (updateInfo) {
            defaultTick(updateInfo);
        }
        ;

    function graph() {
    }

    graph.rebuildSVG = function () {
        rebuildSVGStart();
        if (!linksOnSVG) {
            if (linesFirst) {
                linksOnSVG = outerElement.append('g').selectAll('g');
                nodesOnSVG = outerElement.append('g').selectAll('g');
            } else {
                linksOnSVG = outerElement.append('g').selectAll('g');
                nodesOnSVG = outerElement.append('g').selectAll('g');
            }
        }

        if (!keyFuncLinks) linksOnSVG = linksOnSVG.data(links);
        else linksOnSVG = linksOnSVG.data(links, keyFuncLinks);
        if (!linksOnSVG.enter().empty()) linkCreator(linksOnSVG.enter().append("g"));
        linksOnSVG.each(function (d) {
            linkUpdater(d3.select(this));
        });
        linkRemover(linksOnSVG.exit());

        if (!keyFuncNodes) nodesOnSVG = nodesOnSVG.data(nodes);
        else nodesOnSVG = nodesOnSVG.data(nodes, keyFuncNodes);
        var entered = nodesOnSVG.enter();
        if (!entered.empty()) nodeCreator(nodesOnSVG.enter().append("g"));
        nodesOnSVG.each(function (d) {
            nodeUpdater(d3.select(this)) ;
        });
        nodeRemover(nodesOnSVG.exit());

        rebuildSVGEnd();

        return graph;
    };

    graph.nodeCreator = function (elementCreator) {
        if (typeof (elementCreator) == "function") nodeCreator = elementCreator;
        return graph;
    };

    graph.nodeUpdater = function (elementUpdater) {
        if (typeof (elementUpdater) == "function") nodeUpdater = elementUpdater;
        return graph;
    };

    graph.nodeRemover = function (elementRemover) {
        if (typeof (elementRemover) == "function") nodeRemover = elementRemover;
        return graph;
    };

    graph.linkCreator = function (elementCreator) {
        if (typeof (elementCreator) == "function") linkCreator = elementCreator;
        return graph;
    };

    graph.linkUpdater = function (elementUpdater) {
        if (typeof (elementUpdater) == "function") linkUpdater = elementUpdater;
        return graph;
    };

    graph.linkRemover = function (elementRemover) {
        if (typeof (elementRemover) == "function") linkRemover = elementRemover;
        return graph;
    };

    graph.keyFuncLinks = function (keyFunc) {
        if (typeof (keyFunc) == "function") keyFuncLinks = keyFunc;
        return graph;
    };

    graph.keyFuncNodes = function (keyFunc) {
        if (typeof (keyFunc) == "function") keyFuncNodes = keyFunc;
        return graph;
    };

    graph.links = function (linkz) {
        if (!arguments.length) return links;
        if (Array.isArray(linkz))links = linkz;
        return graph;
    };

    graph.nodes = function (nodez) {
        if (!arguments.length) return nodes;
        if (Array.isArray(nodez)) {
            nodes = nodez;
            graph.nodeDurationsShouldBeUpdated();
        }
        return graph;
    };

    graph.deleteLink = function (link) {
        deleteLink(link);
        return graph;
    };

    graph.deleteNode = function (node) {
        deleteNode(node);
        return graph;
    };

    graph.nodesOnSVG = function () {
        return nodesOnSVG;
    };

    graph.linksOnSVG = function () {
        return linksOnSVG;
    };

    graph.setUpdatePositions = function (update) {
        if (typeof update == "function") updatePositions = update;
        return graph;
    };

    graph.updatePositions = function (update) {
        return updatePositions(update);
    };

    graph.rebuildSVGStart = function (rebuildSvgStrt) {
        if (typeof rebuildSvgStrt == "function") rebuildSVGStart = rebuildSvgStrt;
        return graph;
    };

    graph.rebuildSVGEnd = function (rebuildSvgEnd) {
        if (typeof rebuildSvgEnd == "function") rebuildSVGEnd = rebuildSvgEnd;
        return graph;
    };

    graph.nodeDurationsShouldBeUpdated = function () {
        each(nodes, function (d) {
            d['update_duration'] = true;
        });
    };
    graph.linkDurationsShouldBeUpdated = function () {
        each(links, function (d) {
            d['update_duration'] = true;
        });
    };

    function spliceNodes(node) {
        nodes.splice(nodes.indexOf(node), 1);
        var toSplice = links.filter(
            function (l) {
                return (l.source === node) || (l.target === node);
            });
        toSplice.map(
            function (l) {
                links.splice(links.indexOf(l), 1);
            });
    }

    function defaultTick(updateInfo) {
        /*linksOnSVG.select('path').attr('d', function (d) {
         return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y
         });
         nodesOnSVG.attr('transform', function (d, i) {
         return 'translate(' + d.x + ',' + d.y + ')';
         })*/
        graph.rebuildSVG();
    }

    return graph;
};
//-----------------------------------------------------------------------------------------
//-----------------------------------------/GRAPH
//-----------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------
//-----------------------------------------Zooming area
//-----------------------------------------------------------------------------------------
/**
 * Создает зумер
 * @param width ширина зумабельного пространства
 * @param height высота зумабельного пространства
 * @param baseElementForOuter элемент (обычно SVG) выбранный D3, в который будет добавлена область с зумом
 * @param borderfill цвет заливки границы. Можно оставить белым.
 * @param scaleExtent это массив-пара, задающая границы зуминга, например [0.5,2]
 */
kiv.zoomingArea = function (width, height, baseElementForOuter, borderfill, scaleExtent, innerFill) {
    var zoomingGroup, outerGroup, zoom, x, y, trans = [0, 0], scale = 1;

    x = d3.scale.linear().domain([-width / 2, width / 2]).range([0, width]);
    y = d3.scale.linear().domain([-height / 2, height / 2]).range([height, 0]);

    zoom = d3.behavior.zoom().x(x).y(y).scaleExtent(scaleExtent).on("zoom", rescale);
    //zoom.center();
    //На эту группу должны вешаться все обработчики
    outerGroup = baseElementForOuter
        .append('svg:g')
        .call(zoom);

    if(arguments.length==5) innerFill = "white";
    addBorderRect(outerGroup, width, height, 1, borderfill).attr("fill",innerFill);

    //В этой группе внутри все будет перемещаться
    zoomingGroup = outerGroup.append('svg:g');

    function zoomingArea() {
    }

    /**
     * @returns Возвращает внешнюю группу. На эту группу должны вешаться все обработчики. Важно, что
     * необходимо рескейлить координаты мыши в этих обработчиках методом rescaleCoords
     */
    zoomingArea.getOuterGroup = function () {
        return outerGroup;
    };

    /**
     * @returns Возвращает внутреннюю группу. Добавленное в эту группу будет соотственно зумиться и перемещаться.
     * Добавлять в эту группу обработчики достаточно бесполезно
     */
    zoomingArea.getZoomingGroup = function () {
        return zoomingGroup;
    };

    /**
     * Отменяет зумабельное поведение
     */
    zoomingArea.disableZoom = function () {
        zoomingGroup.call(d3.behavior.zoom().on("zoom", null));
    };

    /**
     * Включает зумабельное поведение
     */
    zoomingArea.enableZoom = function () {
        zoomingGroup.call(d3.behavior.zoom().on("zoom", rescale));
    };

    /**
     * Рескейлит координаты на картинке и координаты в координатной плоскости.
     * @param coords на картинке в браузере
     * @returns {Array} координаты в координатной плоскости
     */
    zoomingArea.rescaleCoords = function (coords) {
        return [(coords[0] - trans[0]) / scale, (coords[1] - trans[1]) / scale];
    };

    /**
     * Выполняет перемещение к исходным координатам. Должно быть плавно, но не получилось пока
     */
    zoomingArea.returnBack = function () {
        zoomingArea.translate(100, 100);
    };

    zoomingArea.translate = function (toX, toY) {
        d3.transition().duration(500).tween("zoom", function () {
            var trans = d3.interpolate(zoom.translate(), [toX, toY]);
            var scale = d3.interpolate(zoom.scale(), 1);
            return function (yyy) {
                zoom.translate(trans(yyy));
                zoom.scale(scale(yyy));
                rescale();
            };
        });
    };

    /**
     * Выполняет преобразование координат в координатной плоскости
     */
    function rescale() {
        trans = zoom.translate();
        scale = zoom.scale();
        zoomingGroup.attr("transform",
            "translate(" + trans + ")"
                + " scale(" + scale + ")");
    }

    return zoomingArea;
};
//-----------------------------------------------------------------------------------------
//-----------------------------------------/Zooming area
//-----------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------
//-----------------------------------------TOOLTIPER
//-----------------------------------------------------------------------------------------
var tooltipHelperId = 0;
/**
 * Создает тултип контейнер
 * @param style название класса стиля
 * стиль в вакууме:
 * tooltip {
            position: absolute;
            text-align: center;
            width: 60px;
            padding: 2px;
            font: 12px sans-serif;
            background: lightsteelblue;
            border: 0px;
            border-radius: 8px;
            pointer-events: none;
        }
 * @returns {Function}
 */
kiv.tooltip = function (style) {

    var div = d3.select("body").append("span").attr('id', "__tooltipHelper_" + tooltipHelperId++).attr("class", style).style("opacity", "0");

    function tooltip() {
    }

    /**
     * Привязывет тултип к элементу
     * @param element элемент. Работает так: если наводят мышь - тултип появляется, если отводят - пропадает
     * @param textFormer - функция, позволяющая сформировать текст, для его рендеринга в тултипе
     * @param params - параметры, на данный момент доступны следующие параметры:
     *      x - сдвиг по х от событиия
     *      y - сдвиг по y от события
     *      sdelay - задержка при начале показа
     *      edelay - задержка при конце показа
     *      sduration - время начала показа
     *      eduration - время конца показа
     * defaultParams = {x:5,y:5,sdelay:0, edelay:0, sduration:200,eduration:500 }
     * @constructor
     */
    tooltip.AddToolTip = function (element, textFormer, params) {
        var defaultParams = {x: 5, y: 5, sdelay: 0, edelay: 0, sduration: 200, eduration: 500 };
        params = (arguments.length == 3) ? mergeProperties(params, defaultParams) : defaultParams;
        element.on("mouseover.tooltip", function (d) {
            div.transition()
                .delay(params.sdelay)
                .duration(params.sduration)
                .style("opacity", "0.95");
            div.html(textFormer(d))
                .style("left", (d3.event.pageX + params.x) + "px")
                .style("top", (d3.event.pageY + params.y) + "px");
        })
            .on("mousemove.tooltip", function (d) {
                div.style("left", (d3.event.pageX + params.x) + "px")
                    .style("top", (d3.event.pageY + params.y) + "px");
            })
            .on("mouseout.tooltip", function (d) {
                div.transition()
                    .delay(params.edelay)
                    .duration(params.eduration)
                    .style("opacity", "0");
            });
    };

    return tooltip;
};
//-----------------------------------------------------------------------------------------
//-----------------------------------------/TOOLTIPER
//-----------------------------------------------------------------------------------------

kiv.krand = function () {

    function krand() {
    }

    /**
     * Рандомный int, включая последний в интервале
     * @param from
     * @param to
     */
    krand.rInt = function (min, max) {
        if (min == max) return min;
        var ax = Math.floor(min + Math.random() * (max - min + 1));
        return ax;
    };

    return krand;
};
//-----------------------------------------------------------------------------------------
//-----------------------------------------UI elements
//-----------------------------------------------------------------------------------------
// All UI elements:
// 1. have render(parent,x,y, width)
// 2. have height(width - input, to calc height) getter
// 3. width in constructor params
// 4. In containers only UI elements allowed
// 5. Use id with uiCounter variable
// 6. Could be set action to all elements .setAction = function (targetAction, functor)
var uiCounter = 0;
var uiTooltip = kiv.tooltip("tooltip");
kiv.UI = function (tooltiper) {
    function UI() {
    }

    if (arguments.length == 0) tooltiper = uiTooltip;

    UI.NiceRoundRectangle = function (params) {
        var defaultParams = {
            roundXY: 10, uText: "123", lContainer: {},
            color: "red", marginXTop: 5, marginX: 5, marginY: 5, borderSize: 1,
            classUpperText: "upper_element_text"
        };
        var p = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;

        var tiUp = textInfo(p.uText, p.classUpperText);
        var lowerHeight = 50;
        var allHeight = null;
        var g = null;
        var roundXY = tiUp.height;
        var bgSize = 5;

        var els = {bg_d: null, bigColoredRect_a: null, bigWhiteRect_b: null, smallWhite_c: null, upperText_d: null, container_e: null};
        var renderedElements = [];

        function NiceRoundRectangle() {
        }

        NiceRoundRectangle.height = function (width) {
            if (lowerHeight == 50 && containsInObj(p.lContainer, "height")) {
                lowerHeight = p.lContainer.height(width - 2 * p.marginX - 2 * p.borderSize);
            }
            if (allHeight == null) allHeight = (tiUp.height) + 2 * p.marginY + lowerHeight + p.borderSize;
            return allHeight;
            //return vertMargin + (listOFStrings.length * (ti.height - 2 * ti.baseLineHeight + vertMargin));
        };

        NiceRoundRectangle.setAction = function (targetAction, functor, capture) {
            each(renderedElements, function (d) {
                d.on(targetAction, functor, capture);
            });
        };

        NiceRoundRectangle.render = function (parent, x, y, width) {
            uiCounter++;
            if (g != null) g.text("");
            g = formD3ChainCalls(parent, "g#id" + uiCounter + "|id'" + uiCounter);

            if (lowerHeight == 50 && containsInObj(p.lContainer, "height")) {
                lowerHeight = p.lContainer.height(width - 2 * p.marginX - 2 * p.borderSize);
            }
            var dataHeight = (tiUp.height) + 2 * p.marginY + lowerHeight + 2 * p.borderSize;

            els.bigColoredRect_a = {type: "rect", attr: {height: dataHeight, width: width, y: y, x: x, fill: p.color, rx: roundXY, ry: roundXY}};
            els.bigWhiteRect_b = {type: "rect", attr: {
                height: dataHeight - roundXY - p.borderSize, width: width - 2 * p.borderSize, y: y + roundXY, x: x + p.borderSize,
                fill: "white", rx: Math.max(roundXY - p.borderSize, 0), ry: Math.max(roundXY - p.borderSize, 0)
            }};
            els.smallWhite_c = {type: "rect", attr: {height: roundXY, width: width - 2 * p.borderSize, y: y + roundXY, x: x + p.borderSize, fill: "white"}};
            els.upperText_d = {type: "text", attr: {props: tiUp, width: width - 2 * p.marginXTop, y: y + tiUp.height - tiUp.baseLineHeight - 1, x: x + p.borderSize + p.marginXTop, class: p.classUpperText, text: p.uText}};
            els.container_e = {type: "g", attr: {container: p.lContainer, x: x + p.borderSize + p.marginX, y: y + roundXY + p.marginY, width: width - 2 * p.marginX - 2 * p.borderSize}};
            //els.bg_d = {type:"rect",attr:{height:dataHeight+bgSize*2, width: width+bgSize*2, y:y-bgSize, x:x-bgSize,rx: roundXY+bgSize, ry: roundXY+bgSize, opacity:0.05, fill:d3.rgb(p.color)}};
            renderAllElements();
        };

        NiceRoundRectangle.RxRy = function () {
            return roundXY;
        };

        return NiceRoundRectangle;

        function renderAllElements() {
            each(objToArrayKeys(els), function (element) {
                if (els[element] != null) {
                    els[element].attr.id = "id" + (++uiCounter);
                    var el = g.append(els[element].type).attr(els[element].attr);
                    if (containsInObj(els[element].attr, "text")) {
                        razeText(el, els[element].attr.text, "", els[element].attr.width, els[element].attr.props, null, tooltiper);
                    } else if (els[element].type == "g") {
                        els[element].attr.container.render(el, els[element].attr.x, els[element].attr.y, els[element].attr.width);
                    }
                    renderedElements.push(el);
                }
            });
        }
    };

    UI.SimpleText = function (params) {
        var defaultParams = {text: "123", textClass: "upper_element_text", vertMargin: 3, raze: false};
        var p = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;

        var ti = textInfo(p.text, p.textClass);
        var g = null;
        var renderedElements = [];

        function SimpleText() {
        }

        SimpleText.height = function (width) {
            if (p.raze) {
                return ti.height;
            } else {
                var textLines = splitIntoLines(width, p.text, p.textClass);
                return (textLines.length * (ti.height - ti.baseLineHeight + p.vertMargin)) - p.vertMargin;
            }
        };

        SimpleText.render = function (parent, x, y, width) {
            var hyperlink = mav.wrapHyperlink(p.raze ? parent : parent.append("g"), p.text);
            ti = textInfo(hyperlink.text);
            var iconSize = hyperlink.icon != null ? ti.height : 0;
            if (hyperlink.icon != null) {
                hyperlink.icon
                    .attr("x", x + ti.height * 0.1)
                    .attr("y", y + ti.height * 0.1)
                    .attr("width", ti.height * 0.8)
                    .attr("height", ti.height * 0.8);
            }
            if (p.raze) {
                var textElement = hyperlink.parent.append("text")
                    .attr("width", width)
                    .attr("y", y + ti.offsetY)
                    .attr("x", x + iconSize)
                    .attr("class", p.textClass);
                razeText(textElement, hyperlink.text, "", width - iconSize, ti, null, tooltiper);
                if (hyperlink.url != null && tooltiper != null)
                    tooltiper.AddToolTip(textElement, function () { return hyperlink.url; });
                renderedElements.push(textElement);
            } else {
                var textLines = splitIntoLines(function (i) {return width - (i == 0 ? iconSize : 0);}, hyperlink.text, p.textClass);
                for (var i = 0; i < textLines.length; i++) {
                    var lineText = textLines[i];
                    var lineElement = hyperlink.parent.append("text")
                        .attr("width", width)
                        .attr("y", y + ti.offsetY + (ti.offsetY + p.vertMargin) * i)
                        .attr("x", x + (i == 0 ? iconSize : 0))
                        .attr("class", p.textClass)
                        .text(lineText);
                    renderedElements.push(lineElement);
                }
            }
        };

        SimpleText.setAction = function (targetAction, functor, capture) {
            each(renderedElements, function (d) {
                d.on(targetAction, functor, capture);
            });
        };

        return SimpleText;
    };

    UI.StructuredText = function (params) {
        var defaultParams = {struct_text: [
                {name: "Test", val: [
                    {left: "трам-пам-пам", right: "Да"},
                    {left: "Lelele", right: "Дудудуд аа"}
                ]},
                {name: "Test", val: [
                    {left: "трам-пам-пам", right: "Да"},
                    {left: "Pdf test", right: "http://example.com/file1.pdf"}
                ]}
            ],
            nameTextClass: "upper_element_text", valTextClass: "upper_element_text",
            percent_leftright: 50, indentBetweenLeftAndRight: 10, horIndent: 10, vertMargin: 3};
        var p = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;

        var g = null;
        var tiName = textInfo("A", p.nameTextClass);
        var tiVal = textInfo("A", p.valTextClass);
        var renderedElements = [];
        var numOfBlocks = p.struct_text.length;
        var numOfVals = 0;
        each(p.struct_text, function (d) {
            numOfVals += d.val.length;
        });

        function StructuredText() {
        }

        StructuredText.height = function (width) {
            return (numOfBlocks * (tiName.offsetY + p.vertMargin)) + (numOfVals * (tiVal.offsetY + p.vertMargin)) - p.vertMargin;
        };

        StructuredText.render = function (parent, x, y, width) {
            if (g != null) {
                g.text("");
            }
            g = parent.append("svg:g");
            var currentY = y;
            each(p.struct_text, function (group) {
                var tiGroupName = textInfo(group.name, p.nameTextClass);
                var groupNameElement = g.append("text")
                    .attr("width", width)
                    .attr("x", x)
                    .attr("y", currentY + tiGroupName.offsetY - 1)
                    .attr("class", p.nameTextClass);
                razeText(groupNameElement, group.name, "", width, tiGroupName, null, tooltiper);
                renderedElements.push(groupNameElement);
                currentY += tiName.offsetY + p.vertMargin;
                each(group.val, function (pair) {
                    var tiLeft = textInfo(pair.left, p.valTextClass);
                    var yForLine = currentY + tiGroupName.offsetY - 1;
                    var leftElement = g.append("text")
                        .attr("width", (width * p.percent_leftright) / 100 - p.indentBetweenLeftAndRight / 2)
                        .attr("y", yForLine)
                        .attr("x", x + p.horIndent)
                        .attr("class",  p.valTextClass);
                    var hyperlink = mav.wrapHyperlink(g, pair.right);
                    var tiRight = textInfo(hyperlink.text);
                    var xForRight = x + p.horIndent + (width * p.percent_leftright) / 100 + p.indentBetweenLeftAndRight / 2;
                    var iconSize = hyperlink.icon != null ? tiRight.height : 0;
                    if (hyperlink.icon != null) {
                        hyperlink.icon
                            .attr("x", xForRight + tiRight.height * 0.1)
                            .attr("y", currentY + tiRight.height * 0.1)
                            .attr("width", tiRight.height * 0.8)
                            .attr("height", tiRight.height * 0.8);
                    }
                    var rightElement = hyperlink.parent.append("text")
                        .attr("width", (width * (100 - p.percent_leftright)) / 100 - p.indentBetweenLeftAndRight / 2)
                        .attr("y", yForLine)
                        .attr("x", xForRight + iconSize)
                        .attr("class",  p.valTextClass);
                    razeText(leftElement, pair.left, "", leftElement.attr("width"), tiLeft, null, tooltiper);
                    razeText(rightElement, hyperlink.text, "", rightElement.attr("width") - iconSize, tiRight, null, tooltiper);
                    if (hyperlink.url != null && tooltiper != null)
                        tooltiper.AddToolTip(rightElement, function () { return hyperlink.url; });
                    currentY += tiVal.offsetY + p.vertMargin;
                    renderedElements.push(leftElement);
                    renderedElements.push(rightElement);
                });
            });
        };

        StructuredText.setAction = function (targetAction, functor, capture) {
            each(renderedElements, function (d) {
                d.on(targetAction, functor, capture);
            });
        };

        return StructuredText;
    };
    //Container with 3 elements:
    //text, then line of some fill, then structred text
    UI.LayoutContainer1 = function (params) {
        var defaultParams = {upperText: {}, lowerText: {}, lineFill: "red", lineSize: 2, vertMargin: 4, horMargin: 20};
        var p = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;

        var g = null;
        var els = {upperElement: null, lineBetween: null, lowerElement: null};
        var upperHeight = null;
        var lowerHeight = null;
        var renderedElements = [];

        function LayoutContainer1() {
        }

        LayoutContainer1.height = function (width) {
            if (upperHeight == null) upperHeight = p.upperText.height(width - 2 * p.horMargin);
            if (lowerHeight == null) lowerHeight = p.lowerText.height(width - 2 * p.horMargin);
            return upperHeight + p.vertMargin + p.lineSize + lowerHeight;
        };

        LayoutContainer1.render = function (parent, x, y, width) {
            uiCounter++;
            if (g != null) g.text("");
            g = formD3ChainCalls(parent, "g#id" + uiCounter + "|id'" + uiCounter);
            if (upperHeight == null) upperHeight = p.upperText.height(width - 2 * p.horMargin);
            if (lowerHeight == null) lowerHeight = p.lowerText.height(width - 2 * p.horMargin);

            els.upperElement = {type: "g", attr: {container: p.upperText, x: x + p.horMargin, y: y, width: width - 2 * p.horMargin}};
            els.lineBetween = {type: "line", attr: {x1: x, y1: y + upperHeight + p.vertMargin + p.lineSize / 2, x2: x + width, y2: y + upperHeight + p.vertMargin + p.lineSize / 2, style: "stroke:" + p.lineFill + ";stroke-width:" + p.lineSize}};
            els.lowerElement = {type: "g", attr: {container: p.lowerText, x: x + p.horMargin, y: y + upperHeight + p.vertMargin + p.lineSize, width: width - 2 * p.horMargin}};

            renderAllElements();
        };

        LayoutContainer1.setAction = function (targetAction, functor, capture) {
            each(renderedElements, function (d) {
                d.on(targetAction, functor, capture);
            });
        };

        return LayoutContainer1;

        function renderAllElements() {
            each(objToArrayKeys(els), function (element) {
                if (els[element] != null) {
                    els[element].attr.id = "id" + (++uiCounter);
                    var el = g.append(els[element].type).attr(els[element].attr);
                    if (containsInObj(els[element].attr, "text")) {
                        razeText(el, els[element].attr.text, "", els[element].attr.width, els[element].attr.props, null, tooltiper);
                    } else if (els[element].type == "g") {
                        els[element].attr.container.render(el, els[element].attr.x, els[element].attr.y, els[element].attr.width);
                    }
                    renderedElements.push(el);
                }
            });
        }
    };

    return UI;
};

/**
 * Work logic:
 * 1. Sending http [request] to [server url] with some [interval] in ms. Sent request also have a GUID string added to an end
 * of the request line after [some prefix]. This guid could be used to identify request.
 * 2. Server responds with one of three possible answers to each request: wait, finished or error.
 * Each answer is identified by predefined prefix. After prefix, a string with info goes, describing the state
 * (for finish for example it could be json of result, for error - error reason, for wait - some wait counter)
 *      [wait answer prefix] - it means, we have to continue sending messages, because operation still in progress on server.
 *      [finished answer prefix] - it means we have to finish sending messages, operation was successful.
 *      [error answer prefix] - it means we have to finish sending messages, operation was not successful.
 * 3. For each answer there is [handler], which takes a string parameter - substring of reply without prefix.
 * Also wait handler don't need to resend message, it's done automatically.
 * 4. There should be a possibility to cancel request.
 * @param params
 */
kiv.smartServerRequest = function(params){
    var defaultParams = {
        request:"", url:"", interval:1000,
        guidPrefix:"$@#$", cancelPrefix:"$!c#",
        waitPrefix:"!w#", finishPrefix:"!f#", errorPrefix:"!e#",
        waitHandler:function(str){},finishHandler:function(str){},errorHandler:function(str){}
    };
    var p = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;
    var requestCancelled = false;
    var guidD = guid();
    var guidV = p.guidPrefix+ guidD;
    var lasWaitResponse=null;
    p.request += guidV;

    var requestId = 0;

    queryService(p.request+ p.guidPrefix+requestId++, p.url, requestHandler, function(){p.errorHandler("Connection error");});

    function smartServerRequest(){}
    smartServerRequest.cancel = function(){
        /*requestCancelled=true;*/
        queryService(p.cancelPrefix + guidV + p.guidPrefix+requestId++, p.url, requestHandler, function(){p.errorHandler("Connection error");});
    };
    smartServerRequest.getGuid = function(){return guidD;};
    return smartServerRequest;

    function requestHandler(serverResponse){
        if(serverResponse==null || serverResponse == "") p.errorHandler("Server sent no response");
        if(serverResponse.indexOf(p.waitPrefix)==0){
            var response = serverResponse.substring(p.waitPrefix.length);
            if(lasWaitResponse==null || lasWaitResponse!=response){
                lasWaitResponse = response;
                p.waitHandler(response);
            }
            setTimeout(
                function(){
                    if(!requestCancelled) queryService(p.request+ p.guidPrefix+requestId++, p.url, requestHandler, function(){p.errorHandler("Connection error");});
                }, p.interval
            );
        } else if (serverResponse.indexOf(p.finishPrefix)==0) p.finishHandler(serverResponse.substring(p.finishPrefix.length));
        else if (serverResponse.indexOf(p.errorPrefix)==0) p.errorHandler(serverResponse.substring(p.errorPrefix.length));
        else p.errorHandler("Unknown response signature");
    }
};

kiv.colorHelper = function(params){
    function toRet(){}
    var defaultParams = {};
    var p = (arguments.length == 1) ? mergeProperties(params, defaultParams) : defaultParams;

    var colorState = {
        colorMap : d3.map(), //hashmap of class sequences to values
        lastIndex : 0, // num of elements in colorMap
        param_maxValue : 360 // значение генерится от 0 до param_maxValue
    };
    //Selects color for some object, depending on colorState
    toRet.getSomeObjectColor = function(objId) {
        if(colorState.colorMap.has(objId)) return colorState.colorMap.get(objId);//Если есть цвет в словаре - возвращаем

        //если цвета нет, начинаем его формировать
        colorState.lastIndex++;//Для начала понимаем, какой у нас элемент по счету.
        var realHue = 0;
        if(colorState.lastIndex==1) realHue = colorState.param_maxValue/2;
        else {
            var inBinary = (colorState.lastIndex).toString(2);//Переводим в бинарный вид
            var delitelj = Math.pow(2,inBinary.length)/2;//Считаем делитель, число box-ов в уровне
            var binaryIndex = inBinary.substring(1);//Считаем в бинарном виде индекс, в соответствующем уровне бинарного дерева (просто отрезаем старший бит)
            var boxIndexInLevel = parseInt(binaryIndex,2);//Теперь индекс уже в десятичном виде
            var razmer = colorState.param_maxValue/delitelj;//Размер box-а в уровне
            realHue = boxIndexInLevel*razmer + razmer/2;//Применяем индекс и прибавляем еще половину размера box-a (центрируем)
        }
        var realColor = d3.hsl(Math.round(realHue), v((kiv.krand().rInt(0,100000)), 0.4, 0.8, 5), v((kiv.krand().rInt(0,100000)), 0.3, 0.6, 5)).toString();
        colorState.colorMap.set(objId, realColor);
        return realColor;
    };

    // numoftimes - должно быть простое число!!! Иначе получится меньше цветов.
    function v(d, min, max, numoftimes) {
        var mult = (max - min) / (numoftimes);
        return min + mult * (d % numoftimes);
    }

    return toRet;
};



mav = {};
/**
 * text is a URL, if any below condition is met:
 *  - starts with http:// etc
 *  - looks like www.<name1>.<...>.<nameN>
 *  - starts with / или ./ или ../
 */
mav.matchUrl = function (text) {
    function nullIfUndefined(value) {
        return value === undefined ? null : value;
    }
    var match = text.match(/^(http|ftp|https):\/\/([\w\-_]+(?:\.[\w\-_]+)+)([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-@?^=%&amp;/~\+#])?\s*$/);
    if (match)
        return {protocol: match[1], host: match[2], path: nullIfUndefined(match[3])};
    match = text.match(/^([a-zA-Z]+[a-zA-Z-]*(?:\.[a-zA-Z]+[a-zA-Z-]*)+)(\/[\w\-\.,@?^=%&amp;:/~\+#]*[\w\-@?^=%&amp;/~\+#])?\s*$/);
    if (match)
        return {protocol: null, host: match[1], path: nullIfUndefined(match[2])};
    match = text.match(/^(\.{0,2}\/[\w\-\.,@?^=%&amp;:/~\+#]*[\w\-@?^=%&amp;/~\+#])\s*$/);
    if (match)
        return {protocol: null, host: null, path: nullIfUndefined(match[1])};
    return null;
} ;
/**
 * Creates a parent for a hyperlink content and (for some URLs) appends an icon.
 * Doesn't do anything if textOrUrl isn't a URL.
 * @returns {
 *     parent: <new parent selector for link content>,
 *     text: <text or url to display>,
 *     icon: <icon selector if present; otherwise null>
 *     url: <url if present; otherwise null>
 * }
 */
mav.wrapHyperlink = function (hyperlinkParent, textOrUrl) {
    function emptyIfNull(text) {
        return text == null ? "" : text;
    }
    function getFileName(path, extension) {
        var match = new RegExp("([\\w\\.\\+\\-]+)\\." + extension + "$", "i").exec(path);
        return match ? match[1] : null;
    }
    var match = mav.matchUrl(textOrUrl);
    if (!match) {
        return {parent: hyperlinkParent, text: textOrUrl};
    }
    var url = textOrUrl;
    var text = textOrUrl;
    if (match.protocol != null) {
        text = emptyIfNull(match.host) + emptyIfNull(match.path);
    } else if (match.host != null) {
        url = "http://" + textOrUrl;
    }
    var path = match.path;
    var imageUrl = null;
    var fileName;
    if (fileName = getFileName(path, "pdf")) {
        imageUrl = "../images/icons/pdf.svg";
    } else if (fileName = getFileName(path, "(?:doc|docx|docm)")) {
        imageUrl = "../images/icons/doc.svg";
    } else if (fileName = getFileName(path, "(?:xls|xlsx|xlsm)")) {
        imageUrl = "../images/icons/xls.svg";
    } else if (fileName = getFileName(path, "(?:ppt|pptx|pptm)")) {
        imageUrl = "../images/icons/ppt.svg";
    } else if (/youtube\.com$/i.test(match.host)) {
        imageUrl = "../images/icons/youtube.svg";
    }
    var parent = hyperlinkParent.append("svg:a")
        .attr("xlink:href", url)
        .attr("class", "hyperlink")
        .on("click", function () {
            d3.event.stopPropagation();
        });
    var icon = null;
    if (imageUrl != null) {
        icon = parent.append("svg:image")
            .attr("xlink:href", imageUrl);
    }
    return {parent: parent, text: fileName != null ? fileName : text, icon: icon, url: url};
};

//-----------------------------------------------------------------------------------------
//-----------------------------------------/GOOD PLOTS
//-----------------------------------------------------------------------------------------