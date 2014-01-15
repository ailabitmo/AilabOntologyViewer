/**
 * Created with IntelliJ IDEA.
 * User: Kivan
 * Date: 04.07.13
 * Time: 13:27
 * To change this template use File | Settings | File Templates.
 */

var Oclasses = {};
var arrayOfClassVals = null;
var arrayOfClassKeys = null;
var objectProperties = {};
var arrayOfObjectPropVals = null;
var arrayOfObjectPropKeys = null;
var dataTypeProperties = {};
var arrayOfDataPropsVals = null;

var tooltiper = kiv.tooltip("tooltip");

var ontologyViewer = kiv.graphStuff.ontologyViewerTree({});

/**
 * Отрабатывает при нажатии на кнопку "запросить".
 * 1. Получает основные структуры от спаркла (классы, обжект и дата проперти)
 * 2. Формирует три полных списка этих самых структур (на будущее, сейчас только классы)
 * 3. Выводит их на экран
 */
function startRequest(){
    d3.select("#generalFilterList").html(
        "<div class='header'><span id='classesNum'/></div> \
        <ul id ='classContainer' class='treeview-red'></ul> \
        <div class='header'><span id='instancesNum'/></div> \
        <ul id ='instsContainer' class='treeview-red'></ul>"
    );
    var allClassesQuery = getRequestToAllClasses();
    var allObjectPropsQuery = getRequestToAllObjProps();
    var allDataPropsQuery = getRequestToAllDataProps();
    var queries = [allClassesQuery, allObjectPropsQuery,allDataPropsQuery];
    processAllQueriesAndGetResult(queries, endpoint, processRequest);
    function processRequest(listOfObjects){
        Oclasses = sparqlJSONToObject(listOfObjects[0], "class");
        arrayOfClassVals = objToArrayValues(Oclasses);
        arrayOfClassKeys = objToArrayKeys(Oclasses);
        objectProperties = sparqlJSONToObject(listOfObjects[1], "objectProperty");
        arrayOfObjectPropVals = objToArrayValues(objectProperties);
        arrayOfObjectPropKeys = objToArrayKeys(objectProperties);
        dataTypeProperties = sparqlJSONToObject(listOfObjects[2], "dataProperty");
        arrayOfDataPropsVals = objToArrayValues(dataTypeProperties);

        renderClassTree();
    }
    function renderClassTree() {
        //Prepare class tree
        var firstLevel = [];
        var processedElements = {};
        var processElement = function(elementName, childName){
            childName = arguments.length==2?childName:"";
            var element = Oclasses[elementName];
            if(!(elementName in processedElements)){
                var children = [];
                processedElements[elementName] = children;
                if(element && element['subclass'] && element['subclass'].length>0) processElement(element['subclass'][0], elementName);
                else firstLevel.push(elementName);
            }
            if(childName!="" && processedElements[elementName].indexOf(childName)==-1)processedElements[elementName].push(childName);
        };

        for (var index in arrayOfClassVals) {
            processElement(arrayOfClassVals[index]['class'][0]);
        }

        var a = 0;

        //Rendering itself
        var listCreator = function(d){
            var xxx = d3.select(this).append("o").text(getName(d,Oclasses)+((d in Oclasses)?" ("+ Oclasses[d].count[0]+")":""))
                .on('mousedown.choosr',function(a){renderInstsList(a);})
                .on('mouseover.choosr',function(d){d3.select(this).attr('class','hover')})
                .on('mouseout.choosr',function(d){d3.select(this).attr('class','')})
            ;
            tooltiper.AddToolTip(xxx, function(d){return d;}, {x:30, y:-10, sdelay:300, eduration:0});

            var arrayOfChildren = processedElements[d];
            var newUl = (arrayOfChildren.length>0)? d3.select(this).append('ul'):"";
            for (var index in arrayOfChildren) {
                newUl.selectAll('li').data(arrayOfChildren, function(d){return d;}).enter().append('li').each(listCreator);
            }
        };
        d3.select("#classesNum").text("CLASSES: "+objToArrayKeys(processedElements).length+" found");
        var classContainer = d3.select("#classContainer").html("").selectAll("li").data(firstLevel,function(d){return d;});
        classContainer.enter().append('li').each(listCreator);
        $("#classContainer").treeview();
    }

    function renderInstsList(classId){
        var allInstsQuery = getRequestToAllInstsIdsByClass(classId);
        processAllQueriesAndGetResult([allInstsQuery], endpoint, function(d){
            var instances = sparqlJSONToObject(d[0], "instance");
            var vals = objToArrayKeys(instances);
            var realNames = d3.range(0,vals.length).map(function(d){ return {name:getName(vals[d], instances), val:vals[d]}});

            realNames = realNames.sort(function(a,b){
                return a.name > b.name
            });
            d3.select("#instancesNum").text("INSTANCES: "+vals.length+" found");

            var spans = d3.select("#instsContainer").html("").selectAll("li")
                .data(realNames,function(d,i){return d.val;})
                .enter().append("li").append("span").text(function(d){return d.name;})
                .on('mouseover.choosr',function(d){if(!anonym(d.val))d3.select(this).attr('class','hover')})
                .on('mouseout.choosr',function(d){if(!anonym(d.val))d3.select(this).attr('class','')})
                .on('mousedown.choosr',function(a){if(!anonym(a.val))renderEditor(a.val);});

            tooltiper.AddToolTip(spans, function(d){return d.val;}, {x:30, y:-10, sdelay:300, eduration:0});

            $("#instsContainer").treeview();
        });
    }

    function renderEditor(objectId){
        ontologyViewer.render({idOfInstance:objectId, requestString:getRequestToInstance(objectId)});
    }
}

function getSomeObjectColor(objId, listWhereItExists){
    var index = listWhereItExists.indexOf(objId);
    if(index==-1) {
        return 'black';
    }
    var size  = listWhereItExists.length;
    var hslVal = index/size;
    var v = function(d,min,max,numoftimes){
        var mult = (max-min)/(numoftimes);
        return min+mult*(d%numoftimes);
    };

    return d3.hsl(Math.round(hslVal*360),v(index*index,0.2, 0.8, 7),v(index,0.3, 0.6, 3)).toString();
}
