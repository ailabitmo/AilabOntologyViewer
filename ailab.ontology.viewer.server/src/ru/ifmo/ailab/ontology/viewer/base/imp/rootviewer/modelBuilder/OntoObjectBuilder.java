package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.*;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

import java.util.HashSet;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 18:18
 *
 * %%% Построитель модели экземпляра по запросу к хранилищу.
 */
public class OntoObjectBuilder extends AModelBuilder<OntoObject> {
    protected OntoObjectBuilder(ViewerRequestAndContextModel inputParams) {
        super(inputParams);
    }

    @Override
    protected OntoObject createOntoItem(String id) {
        SimpleOntoObject soo = (SimpleOntoObject) AModelBuilder.buildModel(SimpleOntoObject.class, requestInfo, id);
        if(soo==null) return null;
        //Сетим базовые свойства из простого объекта
        OntoObject toRet = new OntoObject(id);
        toRet.setLabel(soo.getLabel());
        toRet.setObjClass(soo.getObjClass());
        toRet.setDataProps(soo.getDataProps());

        try {
            //1. Берем входящие обжект проперти
            String query = "select distinct ?objPropertyVal ?objProperty where { ?objPropertyVal ?objProperty <" + id + ">. ?objProperty a owl:ObjectProperty} LIMIT 30";
            toRet.setInObjectProperties(processObjProperies(query));

            //2. Берем исходящие обжект проперти
            query = "select distinct ?objPropertyVal ?objProperty where {<" + id + ">  ?objProperty ?objPropertyVal . ?objProperty a owl:ObjectProperty} LIMIT 30";
            toRet.setOutObjectProperties(processObjProperies(query));

            return toRet;
        } catch (Exception e) {
            logger.error(e.toString());
        }
        return null;
    }

    @Override
    protected void addToUtilStructures(UtilStructures us, OntoObject item) {
        us.addObject(item);
    }

    private HashSet<ObjectPropertyValue> processObjProperies(String query){
        QueryEngineHTTP engine = requestInfo.getQueryEngine(query);
        ResultSet rs = engine.execSelect();
        HashSet<ObjectPropertyValue> toRet = new HashSet<ObjectPropertyValue>();
        while (rs.hasNext()) {
            MyQuerySolution qs = new MyQuerySolution(rs.next());
            String objPropUri = qs.getStringValue("objProperty");
            String objPropertyValUri = qs.getStringValue("objPropertyVal");
            toRet.add(new ObjectPropertyValue(
                    (ObjectPropertyInfo) AModelBuilder.buildModel(ObjectPropertyInfo.class, requestInfo, objPropUri),
                    (SimpleOntoObject) AModelBuilder.buildModel(SimpleOntoObject.class, requestInfo, objPropertyValUri)
            ));
        }
        engine.close();
        return toRet;
    }

    private Logger logger = LoggerFactory.getLogger(this.getClass());
}
