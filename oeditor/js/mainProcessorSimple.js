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
    var tooltiper = kiv.tooltip("tooltip");
    var ontologyViewerTree = kiv.graphStuff.ontologyViewerTreeNew({width:$(window).width()-20,height:$(window).height()-20,containerid:divId});
    ontologyViewerTree.render({idOfInstance: pathTo, requestString: getRequestToInstance(pathTo),
        sparqlEndpoint:spaendpoint, service:service});
}

function getSomeObjectColor(objId, listWhereItExists) {
    var index = listWhereItExists.indexOf(objId);
    if (index == -1) return 'black';
    var size = listWhereItExists.length;
    var sdvig = 0.5;
    var hslVal = index / size;
    var v = function (d, min, max, numoftimes) {// numoftimes - должно быть простое число!!! Иначе получится меньше цветов.
        var mult = (max - min) / (numoftimes);
        return min + mult * (d % numoftimes);
    };
    return d3.hsl(Math.round((hslVal+sdvig) * 360), v((index*index)*31, 0.5, 0.8, 5), v(index*31, 0.4, 0.7, 5)).toString();
}






