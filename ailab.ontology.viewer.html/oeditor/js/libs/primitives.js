/**
 * Created by Khodyrev Ivan
 * Licensed under Apache 2.0
 * Repository: https://github.com/kivan-mih/JSHelpers
 */
//-----------------------------------------------------------------------------------------
//-----------------------------------------D3 helper functions
//-----------------------------------------------------------------------------------------

function self(incoming){return incoming;};

/**
 * Сформировать цепочку вызовов через заданную строку.
 * @param target целевой компонент
 * @param attrString строка, характеризующая цепочку
 * @param selectAppendMode :
 *      0 - добавляем тупым аппендом,
 *      1 - добавляем аппендом с проверкой уникальности/либо делаем просто селект существующего
 * формат строки, характеризующей цепочку:
 * Разделитель вызовов - |
 * Добавить атрибут - "atrName'atrValue"
 * Сделать append - "appendValue"
 * Пример - rect|width'30px|height'30px -> target.append("rect").attr('width','30px').attr('height','30px')
 */
function formD3ChainCalls(target, attrString, logOrNot) {
    logOrNot = (arguments.length == 3) ? logOrNot : 0;
    var strings = attrString.split("|");
    var currentSelection = target;
    lox("For string: " + attrString);
    lox("target");
    for (var i = 0; i < strings.length; i++) {
        currentSelection = processOneInstruction(currentSelection, strings[i]);
    }
    return currentSelection;
    function processOneInstruction(trg, instruction) {
        if (instruction == "") return trg;
        var ind = instruction.indexOf("'");
        if (ind > 0) {
            //Атрибут
            var aName = instruction.substring(0, ind);
            var aVal = instruction.substring(ind + 1);
            lox("   .attr('" + aName + "','" + aVal + "')");
            return trg.attr(aName, aVal);
        } else {
            //Create
            if (trg.selectAll) {
                var tempInstr = instruction;
                if (instruction.indexOf(":") > 0) tempInstr = instruction.substring(instruction.indexOf(":") + 1);
                lox("   .selectAll('" + tempInstr + "').data([0]).enter()");
                var selected = trg.selectAll(tempInstr).data([0]).enter();
                if (!selected.empty()) {
                    lox("   .append('" + instruction + "')");
                    var index = 0;
                    for (var i = 0; i < instruction.length; i++, index = i) if (instruction[i] == '.' || instruction[i] == '#' || instruction[i] == ' ') break;
                    var instrAppend = instruction.substring(0, index);
                    return selected.append(instrAppend);
                }
                else {
                    lox("   .selectAll('" + tempInstr + "')");
                    return trg.selectAll(tempInstr);
                }
            }
            else {
                lox("   .append(" + instruction + ")");
                return trg.append(instruction);
            }

        }
        //return trg;
    }

    function lox(toLox) {
        if (logOrNot) {
            console.log(toLox);
        }
    }
}
/**
 * Добавить прямоугольник
 * @param target элемент в который добавить прямоугольник
 * @returns добавленный прямоугольник
 */
function addRect(target, x, y, width, height) {
    return target.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height);
}
/**
 * Добавить прямоугольник
 * @param target элемент в который добавить прямоугольник
 * @returns добавленный прямоугольник
 */
function addRect(target, x, y, width, height, rx, ry) {
    return target.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("rx", rx)
        .attr("ry", ry)
        .attr("width", width)
        .attr("height", height);
}
function addBorderedRect(target, x, y, width, height, borderWidth, fill, rx, ry, fillStroke){
    return addRect(target, x, y, width, height, rx, ry)
        .attr("fill", fill)
        .attr("stroke", fillStroke)
        .attr("stroke-width", borderWidth);
}
/**
 * Добавить круг
 * @param target элемент в который добавить круг
 * @returns добавленный круг
 */
function addCircle(target, x, y, radius) {
    return target.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", radius);
}
/**
 * Добавить текст
 * @param target элемент в который добавить текст
 * @returns добавленный текст
 */
function addText(target, x, y, size, text) {
    return target.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text).attr('font-size', size + 'px');
}
/**
 * Рисует границу фрейма, заданного размерами
 * @param target   элемент в который добавить границу
 * @returns прямоугольник границы
 */
function addBorderRect(target, picWidth, picHeight, borderWidth, fill) {
    return addRect(target, 0 + borderWidth / 2, 0 + borderWidth / 2, picWidth - borderWidth, picHeight - borderWidth)
        .attr("fill", "white")
        .attr("stroke", fill)
        .attr("stroke-width", borderWidth);
}
function addBorderRect(target, picWidth, picHeight, borderWidth, fill, rx, ry) {
    return addRect(target, 0 + borderWidth / 2, 0 + borderWidth / 2, picWidth - borderWidth, picHeight - borderWidth, rx, ry)
        .attr("fill", "white")
        .attr("stroke", fill)
        .attr("stroke-width", borderWidth);
}

/**
 *
 * @param x
 * @param y
 * @param width
 * @param fill
 * @param text Варианты: "123" | ["123","345"] | {"123":"345", "678":"910"}
 */
var idCounter = 0;
function addRectWithText(dataElement, width, vertMargin, horMargin, fill, fillOuter, name, nameClass, text,
                         textClass, tooltiper) {
    var id = idCounter++;
    var suf = ":";
    var dots = "...";
    var empty = {'width': 0, 'height': 0, 'baseLineHeight': 0};
    var allElements = [];

    var nameParam = name != null ? textInfo(name, nameClass) : "";
    var textParam;
    var textParams = [];
    var suffixParam = textInfo(suf, textClass);

    var maxNameWidth = width - 2 * horMargin;
    var maxTextWidth = (width - 3 * horMargin) / 2;

    if (typeof text == "string") {

    } else if (jQuery.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            var obj = text[i];
            textParams.push({"key": textInfo(obj, textClass), "keyText": obj});
        }
    } else if (typeof text == "object") {
        for (var key in text) {
            textParams.push({"key": textInfo(key, textClass), "keyText": key, "val": textInfo(text[key], textClass), "valText": text[key]});
        }
    }
    if (textParams.length > 0) {
        textParam = textParams[0]["key"];
    } else {
        textParam = empty;
    }

    function addRectWithText() {
    }

    /**
     * Посчитать высоту прямоугольника по содержимому
     */
    addRectWithText.height = function () {
        var sum = 0;
        sum += vertMargin + nameParam.height + vertMargin - nameParam.baseLineHeight;
        sum += textParams.length * (textParam.height + vertMargin - 1 * textParam.baseLineHeight);
        return sum;
    };

    /**
     * Нарисовать
     * @param parent - контейнер, который должен все это содержать
     */
    addRectWithText.render = function (parent, x, y) {
        parent = formD3ChainCalls(parent, "g#id" + id + "|id'id" + id);
        parent.html('');
        var realHeight = addRectWithText.height();
        var trueX = x - width / 2;
        var trueY = y - realHeight / 2;
        //formD3ChainCalls(parent, "rect#pzx|id'pzx|fill'"+fillOuter+"|x'"+(trueX-horMargin)+"|y'"+(trueY-vertMargin)+"|width'"
        //+(width+2*horMargin)+"|height'"+(realHeight+2*vertMargin), true); //BG
        allElements.push(formD3ChainCalls(parent, "rect#p1|id'p1|fill'" + fill + "|x'" + trueX + "|y'" + trueY + "|width'" + width + "|height'" + realHeight)); //BG
        trueX += horMargin;
        trueY += vertMargin + nameParam.height - 2 * nameParam.baseLineHeight;
        var nameV = formD3ChainCalls(parent, "text#p2|id'p2|x'" + trueX + "|y'" + trueY); //Name
        allElements.push(nameV);
        razeText(nameV, name, "", maxNameWidth, nameParam, empty,tooltiper).classed(nameClass, true);
        trueY += nameParam.height - nameParam.baseLineHeight + vertMargin;
        for (var i = 0; i < textParams.length; i++) {
            var keyValParams = textParams[i];
            //{"key":textInfo(key,textClass), "keyText":key, "val":textInfo(text[key],textClass),"valText":text[key]}
            var hasVal = ('val' in keyValParams);
            var textwidth = (hasVal) ? maxTextWidth : maxNameWidth;
            var keyElement = formD3ChainCalls(parent, "text#px" + i + "|id'px" + i + "|x'" + trueX + "|y'" + trueY);
            allElements.push(keyElement);
            razeText(keyElement, keyValParams["keyText"], (hasVal) ? suf : "", textwidth, keyValParams['key'], hasVal ? suffixParam : empty,tooltiper).classed(textClass, true);

            if (hasVal) {
                var valueElement = formD3ChainCalls(parent, "text#py" + i + "|id'py" + i + "|x'" + (trueX + maxTextWidth + horMargin) + "|y'" + trueY);
                allElements.push(valueElement);
                razeText(valueElement, keyValParams["valText"], "", maxTextWidth, keyValParams['val'], empty, tooltiper).classed(textClass, true);
            }
            trueY += textParam.height + vertMargin - 1 * textParam.baseLineHeight;
        }

        return addRectWithText;
    };

    addRectWithText.setAction = function (targetAction, functor) {
        each(allElements, function (d) {
            d.on(targetAction, functor);
        });
    } ;

    if (!('_$_uirect_$_' in dataElement)) dataElement['_$_uirect_$_'] = [];
    dataElement['_$_uirect_$_'].push(addRectWithText);
    return addRectWithText;
}
//function razeText(element, text, maxWidth, textProps, tooltiper)
function razeText(element, text, suffix, maxWidth, textProps, sufProps, tooltiper) {
    if(sufProps==null) sufProps = {'width': 0, 'height': 0, 'baseLineHeight': 0};
    if (textProps.width + sufProps.width > maxWidth) {
        var maxLength = Math.floor(text.length * (maxWidth / textProps.width)) - 1 - suffix.length - "...".length; //3 на точки
        element.text(text.substring(0, maxLength) + "..." + suffix);
        if(tooltiper) tooltiper.AddToolTip(element, function (d, i) {
            return text;
        });
    } else {
        element.text(text + suffix);
    }
    return element;
}
function addRectWithFullText(dataElement, width, vertMargin, horMargin, fill, text, textClass, parent, x, y, rx, ry,
                             tooltiper) {
    //1 Поделить текст на список строк:
    //1.1 Для каждого слова в тексте считаем размер, потом накапливаем и переносим
    var ti = textInfo(text, textClass);
    var listOFStrings = SmartText(width - horMargin * 2, text, textClass);
    var rect = null;
    var texts = [];

    function a() {
    }

    a.height = function () {
        return vertMargin + (listOFStrings.length * (ti.height - 2 * ti.baseLineHeight + vertMargin));
    };

    a.svgrect = function () {
        return rect;
    };

    a.setAction = function (targetAction, functor) {
        rect.on(targetAction, functor);
        each(texts, function (d) {
            d.on(targetAction, functor);
        });
    } ;

    a.render = function () {
        parent = formD3ChainCalls(parent, "g#id" + (idCounter++) + "|id'id" + idCounter);
        var realHeight = a.height();
        var trueX = x - width / 2;
        var trueY = y - realHeight / 2;

        var sufProps = textInfo("...",textClass);

        rect = formD3ChainCalls(parent, "rect#p1|id'p1|fill'" + fill + "|x'" + trueX + "|y'" + trueY + "|width'" + width + "|height'" + realHeight + "|rx'" + rx + "|ry'" + ry);
        trueX += horMargin;
        trueY += vertMargin + ti.height - 2 * ti.baseLineHeight;
        for (var index in listOFStrings) {
            var curStr = listOFStrings[index];
            var textProps = textInfo(curStr,textClass);
            var text = razeText(parent,curStr,"...",width,textProps, sufProps,tooltiper);//formD3ChainCalls(parent, "text#px" + index + "|id'px" + index + "|x'" + trueX + "|y'" + trueY + "|class'" + textClass);
            texts.push(text);
            text.text(curStr);
            trueY += ti.height - 2 * ti.baseLineHeight + vertMargin;
        }
        return parent;
    };

    if (!('_$_uirect_$_' in dataElement)) dataElement['_$_uirect_$_'] = [];
    dataElement['_$_uirect_$_'].push(a);

    return a;
}
function SmartText(width, text, textClass) {
    //Возвращает список строк, каждая из которых состоит из определенного количества слов
    //Делим текст на слова. Перевод на новую строку: \\# - должно отделяться от слов пробелами!!!
    var txt = text.split(" ");
    var spaceWidth = textInfo("a a", textClass).width - textInfo("aa", textClass).width;
    var listOfStrings = [];
    var currentString = "";
    var currentWidth = 0;
    for (var index in txt) {
        var ti = textInfo(txt[index], textClass);
        var newLine = txt[index].lastIndexOf("\\#", 0) >= 0;
        if (currentWidth + ti.width + spaceWidth > width && currentString!="" || newLine) {
            listOfStrings.push(currentString);
            currentString = (!newLine) ? txt[index] + " " : "";
            currentWidth = (!newLine) ? ti.width + spaceWidth : 0;
        } else {
            currentString += txt[index] + " ";
            currentWidth += ti.width + spaceWidth;
        }
    }
    listOfStrings.push(currentString);
    return listOfStrings;
}
function splitIntoLines(width, text, textClass) {
    function maxWidth(lineIndex) {
        return typeof width == "function" ? width(lineIndex) : width;
    }
    var resultLines = [];
    var i = 0;
    var line = "";
    while (i < text.length) {
        var j = text.indexOf(" ", i);
        if (j < 0) {
            j = text.length;
        }
        var longerLine = line + (line.length > 0 ? " " : "") + text.substring(i, j);
        var ti = textInfo(longerLine, textClass);
        if (ti.width < maxWidth(resultLines.length)) {
            line = longerLine;
            i = j + 1;
        } else {
            if (line.length > 0) {
                resultLines.push(line);
                line = "";
            } else {
                // binary search to find wrap index
                var l = i,
                    r = text.length;
                while (r - l > 1) {
                    j = Math.floor((l + r) / 2);
                    longerLine = line + text.substring(i, j);
                    ti = textInfo(longerLine, textClass);
                    if (ti.width > maxWidth(resultLines.length)) {
                        r = j;
                    } else {
                        l = j;
                    }
                }
                if (longerLine.length > 0) {
                    resultLines.push(longerLine);
                    line = "";
                    i = j;
                }
            }
        }
    }
    if (line.length > 0) {
        resultLines.push(line);
    }
    return resultLines;
}
/**
 * @param target родительский элемент,контейнер для элементов (g)
 * @param id идентификатор группы этой линии
 * @param text - текст посередине стрелки
 * @param textClass - класс текста чтобы его рисовать
 * @param linetype тип линии: 0,1,2
 * @param fX - от Х
 * @param fY - от У
 * @param tX - до Х
 * @param tY - до У
 * @param width - ширина линии
 * @param fill - цвет
 */
function textArrowLine(target, id, text, textClass, linetype, fX, fY, tX, tY, width, fill) {
    text = text.replace('|', "/");
    var g = target;

    var textPercent = 0.5;
    var percentToMarkerStart = 0.2;
    var percentToMarkerEnd = 0.8;
    var x1, y1, x2, y2, x3, y3;
    x1 = fX + (tX - fX) * percentToMarkerStart;
    y1 = fY + (tY - fY) * percentToMarkerStart; //First arrow
    x2 = fX + (tX - fX) * textPercent;
    y2 = fY + (tY - fY) * textPercent; //Text
    x3 = fX + (tX - fX) * percentToMarkerEnd;
    y3 = fY + (tY - fY) * percentToMarkerEnd; //Last arrow

    if (linetype != -1)
        ensureMarkerExist(target, "middle_circle", fill,
            "marker|id'middle_circle_" + reFill(fill) + "|viewBox'-5 -5 10 10|refX'0|refy'0|markerWidth'4|markerHeight'4|orient'auto|" +
                "svg:circle|cx'0|cy'0|r'5|fill'" + fill);

    if (linetype > 0) {
        ensureMarkerExist(target, "end_arrow", fill,
            "marker|id'end_arrow_" + reFill(fill) + "|viewBox'0 -5 10 10|refX'6|markerWidth'12|markerHeight'12|orient'auto|" +
                "svg:path|d'M0,-5L10,0L0,5|fill'" + fill);
        ensureMarkerExist(target, "start_arrow", fill,
            "marker|id'start_arrow_" + reFill(fill) + "|viewBox'0 -5 10 10|refX'4|markerWidth'12|markerHeight'12|orient'auto|" +
                "svg:path|d'M10,-5L0,0L10,5|fill'" + fill);

        if (linetype == 1)
            formD3ChainCalls(g,
                "path#p1|id'p1|stroke'" + fill + "|fill'none|stroke-width'" + width + "|d'M" + fX + "," + fY + "L" + x1 + "," + y1 + "|" +
                    "style'marker-end:url(#end_arrow_" + reFill(fill) + ")");
        // First arrow

        else
            formD3ChainCalls(g,
                "path#p1|id'p1|stroke'" + fill + "|fill'none|stroke-width'" + width + "|d'M" + fX + "," + fY + "L" + x1 + "," + y1 + "|" +
                    "style'marker-end:url(#start_arrow_" + reFill(fill) + ")");     // First arrow

        formD3ChainCalls(g,
            "path#p3|id'p3|stroke'" + fill + "|fill'none|stroke-width'" + width + "|d'M" + x3 + "," + y3 + "L" + tX + "," + tY + "|" +
                "style'marker-start:url(#end_arrow_" + reFill(fill) + ")");  // Second arrow
    } else {
        formD3ChainCalls(g,
            "path#p4|id'p4|stroke'" + fill + "|fill'none|stroke-width'" + width + "|d'M" + fX + "," + fY + "L" + tX + "," + tY);
    }

    formD3ChainCalls(g,
        "path#p2|id'p2|stroke'" + fill + "|fill'none|stroke-width'" + width + "|d'M" + x1 + "," + y1 + "L" + x2 + "," + y2 + "L" + x3 + "," + y3 + "|"
            + "style'marker-mid:url(#middle_circle_" + reFill(fill) + ")"); //Text goes here in middle

    x2 = x2 + 4;
    formD3ChainCalls(g, "text|x'" + x2 + "|y'" + y2 + "").attr('class', textClass).text(text);

    return target;
    function reFill(fill) {
        return fill.replace("#", "");
    }

    function ensureMarkerExist(target, markerPrefix, fill, chainCallString) {
        if (!target.node()) {
            var a = 0;
        }
        var svg = d3.select(target.node().viewportElement); //выбрано svg, парент - htmlroot
        var xx = svg.selectAll("#" + markerPrefix + "_" + reFill(fill)).data([0]).enter().insert("defs", "g") // выбран defs, parent: svg
            .selectAll("marker").data([0]).enter(); // выбран marker, parent: defs
        return formD3ChainCalls(xx, chainCallString);
    }
}
//-----------------------------------------------------------------------------------------
//-----------------------------------------/D3 helper functions
//-----------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------
//-----------------------------------------LOG
//-----------------------------------------------------------------------------------------
//Хранилище текущих значений лога
var __log = {};
var log_i = {};
/**
 * Добавить запись в лог. Чтобы запись можно было добавить, в документе должен быть элемент
 * с идентификатором log.
 * @param nameOfParameter название параметра
 * @param infoText добавляемый текст. Формат вывода будет такой:
 */
function addLogEntry(nameOfParameter, infoText) {
    __log[nameOfParameter] = {nameOfParameter: nameOfParameter, infoText: infoText + ""};

    var tempArr = objToArrayValues(__log);

    var selection = d3.select("#log").selectAll("p").data(tempArr, function (d) {
        return d.nameOfParameter;
    });
    selection.enter().append("p").attr("id",function (d) {
        return d.nameOfParameter;
    }).attr('class', "logentry");
    selection.text(function (d) {
        return d.nameOfParameter + ":" + d.infoText;
    });
    selection.exit().remove();
}
function addLogEntryHtml(nameOfParameter, htmlText) {
    __log[nameOfParameter] = {nameOfParameter: nameOfParameter, infoText: htmlText + ""};

    var tempArr = objToArrayValues(__log);

    var selection = d3.select("#log").selectAll("p").data(tempArr, function (d) {
        return d.nameOfParameter;
    });
    selection.enter().append("p").attr("id",function (d) {
        return d.nameOfParameter;
    }).attr('class', "logentry");
    selection.html(function (d) {
        return d.nameOfParameter + ":" + d.infoText;
    });
    selection.exit().remove();
}
function addLogCountEntry(nameOfParameter) {
    if (!log_i['' + nameOfParameter]) {
        log_i['' + nameOfParameter] = 0;
    }
    addLogEntry(nameOfParameter, ++log_i['' + nameOfParameter]);
}
/**
 * Удаление параметра из лога если больше не нужно отображать
 * @param nameOfParameter название параметра
 */
function delLogEntry(nameOfParameter) {
    delete __log["" + nameOfParameter];
    var tempArr = objToArrayValues(__log);
    d3.select("#log").selectAll("p.logentry").data(tempArr,function (d) {
        return d.nameOfParameter;
    }).exit().remove();
}
/**
 * Полная очистка лога
 */
function clearLog() {
    __log = {};
    var a = objToArrayValues(__log);
    d3.select("#log").selectAll("p").data(a).exit().remove();
}
//-----------------------------------------------------------------------------------------
//-----------------------------------------/LOG
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
//-----------------------------------------Useful util functions
//-----------------------------------------------------------------------------------------

/**
 * Guid в соответствии с rfc4122
 * @returns {string}
 */
function guid(){
    return uuid.v4();
}
/**
 * Формирует удобный для работы объект из результата спаркловского запроса.
 * В запросе одно поле должно присутствовать в каждой строке - это идентификатор
 * @param spJSObj - полученный из спаркла json объект
 * @param nameOfIdField - название поля, содержащего идентификатор
 */
function sparqlJSONToObject(spJSObj, nameOfIdField) {
    var finalObjects = {};
    var createNewObj = function (id) {
        var newObj = {};
        for (var i in spJSObj.head.vars) {
            newObj[spJSObj.head.vars[i]] = [];
        }
        newObj['o_name'] = id.substring(id.lastIndexOf('/') + 1);
        finalObjects[id] = newObj;
        return newObj;
    };

    for (var i in spJSObj.results.bindings) {
        var obj = spJSObj.results.bindings[i];
        var curObj = (obj[nameOfIdField].value in finalObjects) ? finalObjects[obj[nameOfIdField].value] : createNewObj(obj[nameOfIdField].value);
        for (var propertyName in obj) {
            //if(curObj[propertyName].indexOf(obj[propertyName].value)==-1)
            curObj[propertyName].push(obj[propertyName].value);
        }
    }
    return finalObjects;
}
function objToArrayValues(obj) {
    var tempArr = [];
    for (var o in obj)  tempArr.push(obj[o]);
    return tempArr;
}
function objToArrayKeys(obj) {
    var tempArr = [];
    for (var o in obj)  tempArr.push(o);
    return tempArr;
}
/**
 *
 * @param arrayOrObject
 * @param functor получает 2 значения - первое - элемент в массиве или объекте, второе - индекс для массива или название
 * поля для объекта
 */
function each(arrayOrObject, functor) {
    for (var index in arrayOrObject) {
        functor(arrayOrObject[index], index);
    }
}
function containsInObj(object, property){
    if(property == null) return false;
    if(object == null) return false;
    return (property in object);
}
function goodIndexOf(array, value, trueFinder) {
    if (arguments.length < 3) trueFinder = function (d, i) {
        return d === i;
    };
    for (var index in array) {
        if (trueFinder(array[index], value)) return index;
    }
    return -1;
}
function sumarray(array, start, end) {
    if (arguments.length == 1) return d3.sum(array);
    else {
        var sum = 0;
        for (var i = start; i < end; i++) sum += array[i];
        return sum;
    }
}
/**
 * Добавляет все свойства от второго объекта к первому. Если в первом встречается такое-же свойство
 * то не переносит значение. Удобно при задании параметров. Если юзер передает объект параметров
 * в котором есть не все свойства, то его можно смержить с дефолтными свойствами.
 * @param toObject - заполняемый объект
 * @param fromObject - из этого объекта берутся недостающие свойства
 */
function mergeProperties(toObject, fromObject) {
    if (typeof toObject === "undefined") toObject = {};
    for (var index in fromObject) {
        if (!(index in toObject)) toObject[index] = fromObject[index];
    }
    return toObject;
}
/**
 *
 * @param xy1_1 {x: number, y: number} линия 1 точка 1
 * @param xy1_2  {x: number, y: number} линия 1 точка 2
 * @param xy1_1  {x: number, y: number}  линия 2 точка 1
 * @param xy1_2   {x: number, y: number} линия 2 точка 2
 * @returns {{x: number, y: number}}
 */
function lineSegIntersection(x1, y1, /* First line segment */
                             x2, y2, x3, y3, /* Second line segment */
                             x4, y4) {
    var a1, a2, b1, b2, c1, c2;
    /* Coefficients of line eqns. */
    var r1, r2, r3, r4;
    /* 'Sign' values */
    var denom, offset, num;
    /* Intermediate values */

    /* Compute a1, b1, c1, where line joining points 1 and 2
     * is "a1 x  +  b1 y  +  c1  =  0".
     */
    a1 = y2 - y1;
    b1 = x1 - x2;
    c1 = x2 * y1 - x1 * y2;
    /* Compute r3 and r4.
     */

    r3 = a1 * x3 + b1 * y3 + c1;
    r4 = a1 * x4 + b1 * y4 + c1;

    /* Check signs of r3 and r4.  If both point 3 and point 4 lie on
     * same side of line 1, the line segments do not intersect.
     */
    var quality = 10e-7;
    if (
        !floatEquals(r3, 0, quality) && !floatEquals(r4, 0, quality) &&
            sign(r3) == sign(r4))
        return (null);

    /* Compute a2, b2, c2 */

    a2 = y4 - y3;
    b2 = x3 - x4;
    c2 = x4 * y3 - x3 * y4;

    /* Compute r1 and r2 */

    r1 = a2 * x1 + b2 * y1 + c2;
    r2 = a2 * x2 + b2 * y2 + c2;

    /* Check signs of r1 and r2.  If both point 1 and point 2 lie
     * on same side of second line segment, the line segments do
     * not intersect.
     */

    if (!floatEquals(r1, 0, quality) && !floatEquals(r2, 0, quality) &&
        sign(r1) == sign(r2))
        return ( null );

    /* Line segments intersect: compute intersection point.
     */

    denom = a1 * b2 - a2 * b1;
    if (floatEquals(denom, 0, quality))
        return ( null );
    offset = denom < 0 ? -denom / 2 : denom / 2;

    /* The denom/2 is to get rounding instead of truncating.  It
     * is added or subtracted to the numerator, depending upon the
     * sign of the numerator.
     */

    num = b1 * c2 - b2 * c1;
    var x = ( num < 0 ? num - offset : num + offset ) / denom;

    num = a2 * c1 - a1 * c2;
    var y = ( num < 0 ? num - offset : num + offset ) / denom;

    return {'x': x, 'y': y};
}
/* lines_intersect */
function floatEquals(f1, f2, e) {
    if (Math.abs(f1 - f2) > e) return false;
    return true;
}
/**
 *
 * @param x1
 * @param y1
 * @param width
 * @param height
 * @param x2
 * @param y2
 * @returns {{x: number, y: number}}
 */
function lineRectIntersection(x1, y1, width, height, x2, y2) {
    var X1 = x1;
    var Y1 = y1;
    var X2 = x1 + width;
    var Y2 = y1;
    var X3 = x1 + width;
    var Y3 = y1 + height;
    var X4 = x1;
    var Y4 = y1 + height;
    // up, right, left, down lines
    var lines = [
        {x1: X1, y1: Y1, x2: X2, y2: Y2},
        {x1: X2, y1: Y2, x2: X3, y2: Y3},
        {x1: X4, y1: Y4, x2: X1, y2: Y1},
        {x1: X3, y1: Y3, x2: X4, y2: Y4}
    ];
    var otherLine = {x1: x1 + (width >> 1), y1: y1 + (height >> 1), x2: x2, y2: y2};
    for (var lineIndex in lines) {
        var line = lines[lineIndex];
        var intersection = lineSegIntersection(line.x1, line.y1, line.x2, line.y2, otherLine.x1, otherLine.y1, otherLine.x2, otherLine.y2);
        if (intersection) {
            return {x: intersection.x - width / 2, y: intersection.y - height / 2};
        }
    }
    return null;
}
/**
 * Разврапить массив пар {имя,значение} в один объект
 * @param objArray
 */
function unWrapNameValArray(objArray) {
    if (!objArray || objArray.length == 0) return [];
    var toRet = ('value' in objArray[0]) ? {} : [];
    for (var o in objArray) {
        if (typeof objArray[o] == "object") {
            if ('value' in objArray[o]) toRet[objArray[o]['name']] = objArray[o]['value'];
            else toRet.push(objArray[o]['name']);
        }
    }
    return toRet;
}
/**
 * Узнать характеристики текста: длину и ширину
 Размер текста и фонт задаются в классе по желанию
 * @param stringOfText
 * @return [width, height, baselineHeight] of text
 */
var textDifMap = d3.map();
/*map.set(["a","b"],"x");
map.set("b","b");
map.set("c","c");
map.set("a","c");*/
var textDifId = "__textDifIdHelper";
function textInfo(stringOfText, textElementClass) {
    var res = checkMap();
    if(res!=null) return res;
    //width & height
    var xx = formD3ChainCalls(d3.select("body"),
        "span#" + textDifId + "|id'" + textDifId + "|style'position:absolute;visibility:collapse;white-space:nowrap;height:auto;width:auto;");
    if (arguments.length == 2) xx.attr('class', textElementClass);
    xx.text(stringOfText);
    //baseline
    var xx2 = formD3ChainCalls(d3.select("body"),
        "span#" + textDifId + "_2|id'" + textDifId + "_2|style'visibility:visible;position:absolute;vertical-align:baseline;");
    if (arguments.length == 2) xx2.attr('class', textElementClass);
    var span1 = formD3ChainCalls(xx2, "span#kkk2k|id'kkk2k|style'font-size:0;|").text("A");
    var span2 = formD3ChainCalls(xx2, "span#kkk1k|id'kkk1k|style'font-size:999px;|").text("A");
    var baseline = 1 - span1.node().offsetTop / xx2.node().clientHeight; // span2.node().offsetHeight

    var res = {'width': xx.node().clientWidth + 1, 'height': xx.node().clientHeight + 1, 'baseLineHeight': Math.round(baseline * (xx.node().clientHeight + 1))};
    res.offsetY = res.height - res.baseLineHeight;
    putToMap(res);

    span1.text("");
    span2.text("");
    xx.text("");

    return res;

    function checkMap(){
        if(textDifMap.has([stringOfText, textElementClass])){
            return textDifMap.get([stringOfText, textElementClass]);
        } else return null;
    }

    function putToMap(res){
        textDifMap.set([stringOfText, textElementClass],res);
    }
}
function sign(x) {
    return x ? x < 0 ? -1 : 1 : 0;
}
/**
 * Отправить запрос в спаркл эндпоинт из JS.
 * @param queryStr - запрос
 * @param endpoint - спаркл эндпоинт
 * @param callback функция, которая вызывается по результату
 * @param format - необязательное, формат выдачи
 */
function sparqlQueryJson(queryStr, endpoint, callback, errorHandler) {
    errorHandler = (arguments.length == 4) ? errorHandler : function (d) {
    };
    var format = "SPARQL/JSON";
    var querypart = "query=" + encodeURI(queryStr + "&format=" + format).replace(/&&/g, '+%26%26+');

    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Code for older versions of IE, like IE6 and before.
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        alert('Perhaps your browser does not support XMLHttpRequests?');
    }

    // Set up a POST with JSON result format.
    xmlhttp.open('POST', endpoint, true/*, 'kivan', 'dfhsrfhkjds1985'*/); // GET can have caching probs, so POST
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.setRequestHeader("Accept", "application/sparql-results+json");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                // Do something with the results
                callback(xmlhttp.responseText);
            } else {
                errorHandler(xmlhttp.responseText);
            }
        }
    };
    xmlhttp.send(querypart);
};
/**
 * Отправить запрос в спаркл эндпоинт через промежуточный сервис.
 * @param queryStr - запрос
 * @param endpoint - спаркл эндпоинт
 * @param serviceUrl - сервис, через который идет запрос
 * @param callback функция, которая вызывается по результату
 * @param errorHandler - подхватыватель ошибки
 * @param defaultGraph - дефолтный граф
 */
function sparqlQueryJsonThroughService(queryStr, endpoint, defaultGraph, serviceUrl, callback, errorHandler) {
    errorHandler = (arguments.length == 4) ? errorHandler : function (d) {
    };
    //var format = "SPARQL/JSON";
    var format = "sparql";
    var querypart = endpoint+ ((defaultGraph)?"$?default-graph-uri=" + encodeURIComponent("http://dbpedia.org")+"&":"$?")+"query="+encodeURIComponent(queryStr) + "&output=" + encodeURIComponent(format);
    querypart = querypart.replace(/&&/g, '+%26%26+');
    querypart+="$get";
    //http://localhost/oed/mirror/?http://localhost:8888/sparql$?query=select%20*%20where%20%7B?a%20?b%20rdfs:label%0A%7D&format=SPARQL/JSON;


    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Code for older versions of IE, like IE6 and before.
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        alert('Perhaps your browser does not support XMLHttpRequests?');
    }

    // Set up a POST with JSON result format.

    xmlhttp.open('POST', serviceUrl, true/*, 'kivan', 'dfhsrfhkjds1985'*/); // GET can have caching probs, so POST
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.setRequestHeader("Accept", "text/html");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                // Do something with the results
                callback(xmlhttp.responseText);
            } else {
                errorHandler(xmlhttp.responseText);
            }
        }
    };
    xmlhttp.send(querypart);
}
/**
 * Отправить запрос в спаркл эндпоинт через промежуточный сервис.
 * @param queryStr - запрос
 * @param endpoint - спаркл эндпоинт
 * @param serviceUrl - сервис, через который идет запрос
 * @param callback функция, которая вызывается по результату
 * @param errorHandler - подхватыватель ошибки
 */
function queryService(queryStr, serviceUrl, callback, errorHandler) {
    errorHandler = (arguments.length == 4) ? errorHandler : function (d) {
    };
    var querypart = queryStr;
    //http://localhost/oed/mirror/?http://localhost:8888/sparql$?query=select%20*%20where%20%7B?a%20?b%20rdfs:label%0A%7D&format=SPARQL/JSON;
    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Code for older versions of IE, like IE6 and before.
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        alert('Perhaps your browser does not support XMLHttpRequests?');
    }

    // Set up a POST with JSON result format.

    xmlhttp.open('POST', serviceUrl, true/*, 'kivan', 'dfhsrfhkjds1985'*/); // GET can have caching probs, so POST
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.setRequestHeader("Accept", "text/html");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                // Do something with the results
                callback(xmlhttp.responseText);
            } else {
                errorHandler(xmlhttp.responseText);
            }
        }
    };
    xmlhttp.send(querypart);
}
/**
 * Обработать все запросы
 * @param querryList - список запросов (ВСЕ ВОЗВРАЩАЮТ JSON!!)
 * @param callBackOnSuccess - колбэк функция, которая принимает на вход список результатов. Результат - это JS объект
 */
function processAllQueriesAndGetResult(querryList, endpoint, callBackOnSuccess) {
    var sparqlResults = [];
    var i = 0;
    clearLog();
    var pushToResults = function (d) {
        try {
            if (d != null) sparqlResults.push(eval('(' + d + ')'));
        } catch (e) {
            var a = 0;
        }

        if (i < querryList.length) {
            addLogEntry('query' + i, querryList[i]);
            sparqlQueryJsonThroughService(querryList[i++], endpoint,"http://localhost/oed/mirror/", pushToResults);
            //sparqlQueryJson(querryList[i++], endpoint, pushToResults);
        }
        else {
            callBackOnSuccess(sparqlResults);
        }
    };
    pushToResults(null);
}
//Возвращает имя для ури, который соответствует некоторому объекту в списке.
function getName(uri, objWithIt) {
    if (uri in objWithIt) return (objWithIt[uri].label.length > 0) ? objWithIt[uri].label[0] : objWithIt[uri].o_name;
    else return name(uri);
}
function getLabel(uri, collection) {
    if (uri in collection) return (containsInObj(collection[uri], 'label') && collection[uri].label.length > 0) ? collection[uri].label : name(uri);
    else return name(uri);
}
//Возвращает текст после последнего слеша или весь, если слешей нет
function name(uri) {
    if (!anonym(uri)) return uri.substring(uri.lastIndexOf('/') + 1);
    return uri;
}
//Проверяет - является ли ури анонимом (анонимы не содержат слешей)
function anonym(uri) {
    if (uri) return uri.indexOf("/") == -1;
    else return false;
}
//-----------------------------------------------------------------------------------------
//-----------------------------------------/Useful util functions
//-----------------------------------------------------------------------------------------

function mergeInto(targetObject, sourceObject) {
    if (typeof targetObject == "undefined" || targetObject == null)
        targetObject = {};
    if (typeof sourceObject == "undefined" || sourceObject == null)
        sourceObject = {};
    for (var property in sourceObject) {
        targetObject[property] = sourceObject[property];
    }
    return targetObject;
}
function mergeFrom(sourceObject, targetObject) {
    return mergeInto(targetObject, sourceObject);
}

function vector(x, y) {
    if (typeof y === "undefined") { y = x; }
    return {x: x, y: y};
}

function _razeText(element, text, suffix, maxWidth, textProps, sufProps, tooltiper) {
    if(sufProps==null) sufProps = {'width': 0, 'height': 0, 'baseLineHeight': 0};
    if (textProps.width + sufProps.width > maxWidth) {
        var maxLength = Math.floor(text.length * (maxWidth / textProps.width)) - 1 - suffix.length - "...".length; //3 на точки
        element.text(text.substring(0, maxLength) + "..." + suffix);
        if (tooltiper) tooltiper.bindTo(element, function (d, i) {
            return text;
        });
    } else {
        element.text(text + suffix);
    }
    return element;
}
