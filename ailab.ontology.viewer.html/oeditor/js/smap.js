/**
 * Created with IntelliJ IDEA.
 * User: Kivan
 * Date: 26.07.13
 * Time: 14:39
 * To change this template use File | Settings | File Templates.
 */


function sparql() {
    function sparql() {
    }

    var endpoint = "http://localhost:8888/sparql";

    sparql.getAllPerspectives = function (callback) {
        var request =
            "select distinct * where{\
            ?instance a <http://ailab.ifmo.ru/vocab/hseItModel#Perspective>.\
            ?instance <http://ailab.ifmo.ru/vocab/hseItModel#Perspective_id> ?value.\
            OPTIONAL {?instance <http://ailab.ifmo.ru/vocab/hseItModel#Perspective_name> ?label.}\
            }"       ;
        processAllQueriesAndGetResult([request], endpoint, callback);
    }

    sparql.getAllObjectivesForPerspective = function (strategy, perspectiveID, callback) {
        /*var request =
         "select distinct * where {\
         ?objpinval ?objpin <"+perspectiveID+">. \
         ?objpin a owl:ObjectProperty.\
         OPTIONAL {?objpinval rdfs:label ?label.}\
         }"*/
        var request = "select distinct * where {        \
            ?stratObj <http://ailab.ifmo.ru/vocab/hseItModel#StratObjective_perspective> ?perspId.\
            ?stratObj <http://ailab.ifmo.ru/vocab/hseItModel#StratObjective_directioninfluencefactor> ?influenceFactor.\
            <" + perspectiveID + "> <http://ailab.ifmo.ru/vocab/hseItModel#Perspective_id> ?perspId.      \
              ?stratObj <http://ailab.ifmo.ru/vocab/hseItModel#StratObjective_strategy> ?stratId.      \
            <" + strategy + "> <http://ailab.ifmo.ru/vocab/hseItModel#Strategy_id> ?stratId.      \
            OPTIONAL {?stratObj <http://ailab.ifmo.ru/vocab/hseItModel#StratObjective_name> ?label.}\
        }"        ;
        processAllQueriesAndGetResult([request], endpoint, callback);
    }

    sparql.getAllLinksBetweenObjectives = function (callback) {
        var request =
            "select distinct ?from ?to ?factor where {    \
                ?a <http://ailab.ifmo.ru/vocab/hseItModel#ObjectiveInfluence_objectiveInfluence> ?from.\
                ?a <http://ailab.ifmo.ru/vocab/hseItModel#ObjectiveInfluence_influenceObjective> ?to.   \
                    ?a <http://ailab.ifmo.ru/vocab/hseItModel#ObjectiveInfluence_factor> ?factor.        \
        }"        ;
        processAllQueriesAndGetResult([request], endpoint, callback);
    }

    sparql.getAllKPIsToObjectives = function (callback) {
        var request =
            "select distinct ?a ?strobj ?kpiName ?influence where { \
                ?a a <http://ailab.ifmo.ru/vocab/hseItModel#KPI>.    \
                ?a <http://ailab.ifmo.ru/vocab/hseItModel#KPI_stratobjectives> ?strobId.\
                ?a <http://ailab.ifmo.ru/vocab/hseItModel#KPI_name> ?kpiName.        \
                OPTIONAL{?a <http://ailab.ifmo.ru/vocab/hseItModel#KPI_infulencefactor> ?influence.} \
                ?strobj a <http://ailab.ifmo.ru/vocab/hseItModel#StratObjective>.       \
                ?strobj <http://ailab.ifmo.ru/vocab/hseItModel#StratObjective_id> ?strobId.          \
        }"    ;
        processAllQueriesAndGetResult([request], endpoint, callback);
    }

    sparql.getAllStrategies = function (callback) {
        var request =
            "select distinct ?stratId ?stratDesc  where { \
            ?stratId  a <http://ailab.ifmo.ru/vocab/hseItModel#Strategy>.\
            ?stratId  <http://ailab.ifmo.ru/vocab/hseItModel#Strategy_name> ?stratDesc.\
            }"              ;
        processAllQueriesAndGetResult([request], endpoint, callback);
    }

    return sparql;
}

//addRectWithFullText("", 200, 0, 0, "red", "shjdgh sjfhs s gjsjg hsg hsj hdsge sejr jshdfjs f e4j", "basicTextInGraph");

var perspectives = {}
var objectives = {}
var objectiveList = []
var linksBetweenObjectives = []
var usedlines = {}
var strategies = {}
var kpisToObjectives = {}
var spa = sparql();

spa.getAllStrategies(function (d) {
    strategies = sparqlJSONToObject(d[0], "stratId");
    1
    var combox = d3.select("#combo").append("select").attr({
        "id": "comboid"
    });

    combox.selectAll("option")
        .data(objToArrayKeys(strategies), function (d) {
            return d;
        })
        .enter()
        .append("option")
        .attr('value', function (d) {
            return strategies[d]['stratId'][0];
        })
        .text(function (d) {
            return strategies[d]['stratDesc'][0];
        });
})


function start() {
    var strategy = d3.select("#comboid").node().value;
    d3.select("#sm").text("");

    perspectives = {}
    objectives = {}
    objectiveList = []
    linksBetweenObjectives = []
    usedlines = {}
    kpisToObjectives = {}

    spa.getAllKPIsToObjectives(function (d, i) {
        kpisToObjectives = sparqlJSONToObject(d[0], 'a')
        spa.getAllPerspectives(function (d) {
            perspectives = sparqlJSONToObject(d[0], "instance")
            var prs = objToArrayKeys(perspectives);
            var prsIndex = 0;
            var nextPrs = function () {
                if (prsIndex <= prs.length - 1) return prs[prsIndex++];
                else return -1;
            }
            var next = nextPrs();
            var processPersp = function (d) {
                var obj = sparqlJSONToObject(d[0], "stratObj");
                var a = objToArrayKeys(obj);
                for (var index in a) {
                    obj[a[index]]['perspective'] = perspectives[next]['instance'][0];
                    if (!(a[index] in objectives)) {
                        obj[a[index]]['id'] = a[index];
                        objectives[a[index]] = obj[a[index]];
                    }
                }

                perspectives[next]['objectives'] = a;
                perspectives[next]['id'] = next;
                next = nextPrs();
                if (next != -1)
                    spa.getAllObjectivesForPerspective(strategy, next, processPersp)
                else {
                    spa.getAllLinksBetweenObjectives(function (d) {
                        objectiveList = objToArrayValues(objectives);
                        var a = d[0].results.bindings;
                        for (var index in a) {
                            var aa = a[index];
                            linksBetweenObjectives.push({source: objectives[aa.from.value], target: objectives[aa.to.value], factor: aa.factor.value})
                        }
                        draw();
                    })
                }
            }
            if (next != -1)
                spa.getAllObjectivesForPerspective(strategy, next, processPersp)
        })
    })
}

var tooltip = kiv.tooltip("tooltip")

function draw() {
    var widthForPerspective = 100;
    var heightForPerspective = 450;
    var widthForObjective = 280;
    var marginPerspective = 10;
    var marginObjective = 30;
    var nechetnijCoef = 0.4;
    var chetnijCoef = 0.2;
    var kpiCoef = 0.8;

    var maxNumOfObjectives = 0;
    var finalHeight = 0;
    var perspective_l = objToArrayValues(perspectives);
    perspective_l = perspective_l.sort(function (a, b) {
        return a['value'][0] > b['value'][0]
    })
    each(perspective_l, function (perspective, i) {
        each(kpisToObjectives, function (kpi, i) {
            if (goodIndexOf(perspective.objectives, kpi.strobj[0]) >= 0) {
                if (!('kpis' in perspective)) perspective.kpis = []
                perspective['kpis'].push(kpi.a[0]);
            }
        })
        var perspectiveName = perspective['label'][0];
        var ti = textInfo(perspectiveName, "perspname");
        perspective['textinfo'] = ti;
        finalHeight += heightForPerspective;//marginPerspective*2+ti['width'];
        if (perspective['objectives'].length > maxNumOfObjectives || perspective['kpis'].length > maxNumOfObjectives)
            maxNumOfObjectives = Math.max(perspective['objectives'].length, perspective['kpis'].length);
    })
    var finalWidth = widthForPerspective + maxNumOfObjectives * (marginObjective + widthForObjective) + marginObjective

    var svg = d3.select("#sm").append("svg:svg").attr({
        width: finalWidth + 1,
        height: finalHeight + 1
    });

    formD3ChainCalls(svg, "rect|width'" + finalWidth + "|height'" + finalHeight + "|fill'white")

    var objectiveLinks = svg.selectAll("g.link").data(linksBetweenObjectives).enter().append("g").classed("link", true);
    var kpiLinks = svg.selectAll("g.kpilink").data(objToArrayValues(kpisToObjectives)).enter().append("g").classed("kpilink", true);

    var perspgrp = svg.selectAll("g.node").data(perspective_l,function (d) {
        return d.instance[0]
    }).enter().append("g").classed("node", true);
    perspgrp.append("rect").attr({
        width: finalWidth,
        height: heightForPerspective,
        fill: "none",
        stroke: "black",
        'stroke-width': 3,
        x: 0, y: 0
    })
    perspgrp.append("line").attr({
        x1: widthForPerspective,
        x2: widthForPerspective,
        y1: 0,
        y2: heightForPerspective,
        stroke: "black", 'stroke-width': 3
    });
    perspgrp.append("text").text(function (d, i) {
        return d['label'][0]
    }).attr({
            x: 55, y: function (d, i) {
                return heightForPerspective - marginPerspective
            },
            transform: function (d, i) {
                return "rotate(-90,55," + (heightForPerspective - marginPerspective) + ")"
            }
        })
    perspgrp.attr({transform: function (d, i) {
        return "translate(0," + ((d.value[0] - 1) * heightForPerspective) + ")"
    }})

    var objectiveEls = perspgrp.selectAll("g.xclz").data(function (d, i) {
        return d['objectives']
    },function (d, i) {
        return d;
    }).enter().append("g").attr('class', "xclz");
    objectiveEls.each(
        function (d, i) {
            var rect = addRectWithFullText(
                objectives[d], widthForObjective, 5, 5, "gray", objectives[d].label[0] + " \\# ----- \\# Степень влияния на перспективу: " + objectives[d].influenceFactor[0], 'basicTextInGraph',
                d3.select(this), (widthForPerspective + widthForObjective / 2 + marginObjective + i * (marginObjective + widthForObjective)), (i % 2 == 0) ? heightForPerspective * nechetnijCoef : heightForPerspective * chetnijCoef
            );
            //rect.render();
        }
    )

    var kpiEls = perspgrp.selectAll("g.yclz").data(function (d, i) {
        return d['kpis']
    },function (d, i) {
        return d;
    }).enter().append("g").attr('class', "yclz");
    kpiEls.each(function (d, i) {
        var rect = addRectWithFullText(
            kpisToObjectives[d], widthForObjective, 5, 5, "orange", kpisToObjectives[d].kpiName[0], 'kpiTextInGraph',
            d3.select(this), (widthForPerspective + widthForObjective / 2 + marginObjective + i * (marginObjective + widthForObjective)), heightForPerspective * kpiCoef
        );
        //rect.render() ;
    })

    objectiveLinks.each(
        function (dd, i) {
            var g = d3.select(this);
            var first = (dd.source.id < dd.target.id ) ? dd.source.id : dd.target.id;
            var second = (dd.source.id >= dd.target.id ) ? dd.source.id : dd.target.id;
            var id = first + "_" + second;
            //dd.source.id + "_" + dd.target.id;
            var haveToBe2 = false;
            if (id in usedlines) {
                haveToBe2 = true
                g = usedlines[id];
            }
            else usedlines[id] = g;

            var indexFirst = perspectives[dd.source.perspective].objectives.indexOf(dd.source.id);
            var firstX = widthForPerspective + indexFirst * (marginObjective + widthForObjective) + marginObjective + widthForObjective / 2;
            var firstY = heightForPerspective * ((indexFirst % 2 == 0) ? nechetnijCoef : chetnijCoef) + heightForPerspective * goodIndexOf(perspective_l, dd.source.perspective, function (d, i) {
                return d.id == i;
            });
            var firstWidth = widthForObjective;
            var firstHeight = dd.source["_$_uirect_$_"][0].height();

            var indexSecond = perspectives[dd.target.perspective].objectives.indexOf(dd.target.id);
            var secondX = widthForPerspective + indexSecond * (marginObjective + widthForObjective) + marginObjective + widthForObjective / 2;
            var secondY = heightForPerspective * ((indexSecond % 2 == 0) ? nechetnijCoef : chetnijCoef) + heightForPerspective * goodIndexOf(perspective_l, dd.target.perspective, function (d, i) {
                return d.id == i;
            });
            var secondWidth = widthForObjective;
            var secondHeight = dd.target["_$_uirect_$_"][0].height();

            var firstIntersection = lineRectIntersection(
                firstX, firstY, firstWidth, firstHeight, secondX + secondWidth / 2, secondY + secondHeight / 2
            );
            var secondIntersection = lineRectIntersection(
                secondX, secondY, secondWidth, secondHeight, firstX + firstWidth / 2, firstY + firstHeight / 2
            );

            if (firstIntersection && secondIntersection) {
                textArrowLine(g, "_linkId_" + id, dd.factor, 'kpiTextInGraph', haveToBe2 ? 2 : 1,
                    firstIntersection.x, firstIntersection.y, secondIntersection.x, secondIntersection.y, 2, d3.rgb(200, 200, 200).toString());

                tooltip.AddToolTip(g, function (d, i) {
                    return "Степень влияния: " + d.factor;
                });
                g.on("mouseover.objlink", function (d) {
                    textArrowLine(g, "_linkId_" + id, dd.factor, 'biggerkpiTextInGraph', haveToBe2 ? 2 : 1,
                        firstIntersection.x, firstIntersection.y,
                        secondIntersection.x, secondIntersection.y, 2, "blue");
                })
                    .on("mouseout.objlink", function (d) {
                        textArrowLine(g, "_linkId_" + id, dd.factor, 'kpiTextInGraph', haveToBe2 ? 2 : 1,
                            firstIntersection.x, firstIntersection.y,
                            secondIntersection.x, secondIntersection.y, 2, d3.rgb(200, 200, 200).toString());
                    })
            }
            dd.source["_$_uirect_$_"][0].render()
            dd.target["_$_uirect_$_"][0].render()
        }
    )

    kpiLinks.each(
        function (d, i) {
            var g = d3.select(this);
            var dd = {source: d, target: objectives[d.strobj[0]]};
            var id = dd.source.o_name + "_" + dd.target.o_name;

            var indexFirst = perspectives[dd.target.perspective].kpis.indexOf(dd.source.a[0]);
            var firstX = widthForPerspective + indexFirst * (marginObjective + widthForObjective) + marginObjective + widthForObjective / 2;
            var firstY = heightForPerspective * (kpiCoef) + heightForPerspective * goodIndexOf(perspective_l, dd.target.perspective, function (d, i) {
                return d.id == i;
            });
            var firstWidth = widthForObjective;
            var firstHeight = dd.source["_$_uirect_$_"][0].height();

            var indexSercond = perspectives[dd.target.perspective].objectives.indexOf(dd.target.id);
            var secondX = widthForPerspective + indexSercond * (marginObjective + widthForObjective) + marginObjective + widthForObjective / 2;
            var secondY = heightForPerspective * ((indexSercond % 2 == 0) ? nechetnijCoef : chetnijCoef) + heightForPerspective * goodIndexOf(perspective_l, dd.target.perspective, function (d, i) {
                return d.id == i;
            });
            var secondWidth = widthForObjective;
            var secondHeight = dd.target["_$_uirect_$_"][0].height();

            var firstIntersection = lineRectIntersection(
                firstX, firstY, firstWidth, firstHeight, secondX + secondWidth / 2, secondY + secondHeight / 2
            );
            var secondIntersection = lineRectIntersection(
                secondX, secondY, secondWidth, secondHeight, firstX + firstWidth / 2, firstY + firstHeight / 2
            );

            if (firstIntersection && secondIntersection) {
                textArrowLine(g, "_kpilinkId_" + id, dd.source.influence.length > 0 ? dd.source.influence[0] : "Нет", 'kpiTextInGraph', 1,
                    firstIntersection.x, firstIntersection.y,
                    secondIntersection.x, secondIntersection.y, 1, "orange");
                tooltip.AddToolTip(g, function (d, i) {
                    return "Степень влияния: " + d.influence[0];
                });
                g.on("mouseover.kpilink", function (d) {
                    textArrowLine(g, "_kpilinkId_" + id, dd.source.influence.length > 0 ? dd.source.influence[0] : "Нет", 'biggerkpiTextInGraph', 1,
                        firstIntersection.x, firstIntersection.y,
                        secondIntersection.x, secondIntersection.y, 2, "blue");
                })
                    .on("mouseout", function (d) {
                        textArrowLine(g, "_kpilinkId_" + id, dd.source.influence.length > 0 ? dd.source.influence[0] : "Нет", 'kpiTextInGraph', 1,
                            firstIntersection.x, firstIntersection.y,
                            secondIntersection.x, secondIntersection.y, 1, "orange");
                    })
            }

            dd.source["_$_uirect_$_"][0].render()
            //dd.target["_$_uirect_$_"][0].render()
        }
    )
}