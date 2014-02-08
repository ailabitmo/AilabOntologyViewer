/**
 * Created with IntelliJ IDEA.
 * User: Kivan
 * Date: 16.09.13
 * Time: 17:40
 * To change this template use File | Settings | File Templates.
 */

var pathTo;

var Oclasses = {};
var arrayOfClassVals = null;
var arrayOfClassKeys = null;
var objectProperties = {};
var arrayOfObjectPropVals = null;
var arrayOfObjectPropKeys = null;
var dataTypeProperties = {};
var arrayOfDataPropsVals = null;

function startIt(divId, service, spaendpoint, pathToX) {
    pathTo = pathToX;
    var ontologyViewerTree = kiv.graphStuff.ontologyViewerTreeNew({width:$(window).width()-20,height:$(window).height()-20,containerid:divId});
    ontologyViewerTree.render({idOfInstance: pathTo,
        sparqlEndpoint:spaendpoint, service:service});
}

var colorMap = d3.map();
var lastIndex = 0;
var param_maxValue = 360;// значение генерится от 0 до param_maxValue

function getSomeObjectColor(objId) {

    if(colorMap.has(objId)) return colorMap.get(objId);//Если есть цвет в словаре - возвращаем

    //если цвета нет, начинаем его формировать
    lastIndex++;//Для начала понимаем, какой у нас элемент по счету.
    var realHue = 0;
    if(lastIndex==1) realHue = param_maxValue/2;
    else {
        var inBinary = (lastIndex).toString(2);//Переводим в бинарный вид
        var delitelj = Math.pow(2,inBinary.length)/2;//Считаем делитель, число ящиков в уровне
        var binaryIndex = inBinary.substring(1)//Считаем в бинарном виде индекс, в соответствующем уровне бинарного дерева (просто отрезаем старший бит)
        var boxIndexInLevel = parseInt(binaryIndex,2);//Теперь индекс уже в десятичном виде
        var razmer = param_maxValue/delitelj;//Размер ящика в уровне
        realHue = boxIndexInLevel*razmer + razmer/2;//Применяем индекс и прибавляем еще половину размера ящика (центрируем)
    }

    var v = function (d, min, max, numoftimes) {// numoftimes - должно быть простое число!!! Иначе получится меньше цветов.
        var mult = (max - min) / (numoftimes);
        return min + mult * (d % numoftimes);
    };
    var realColor = d3.hsl(Math.round(realHue), v((kiv.krand().rInt(0,100000)), 0.4, 0.8, 5), v((kiv.krand().rInt(0,100000)), 0.3, 0.6, 5)).toString();
    colorMap.set(objId, realColor);
    return realColor;
}






