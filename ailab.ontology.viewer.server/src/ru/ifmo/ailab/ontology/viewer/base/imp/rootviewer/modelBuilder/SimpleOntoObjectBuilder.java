package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.ClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.DataPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.DataPropertyValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

import java.util.HashSet;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 20:03
 *
 * %%% Построитель модели простого экземпляра (без объектных связей) по запросу к хранилищу.
 */
public class SimpleOntoObjectBuilder extends AModelBuilder<SimpleOntoObject> {
    public SimpleOntoObjectBuilder(ViewerRequestAndContextModel request) {
        super(request);    //To change body of overridden methods use File | Settings | File Templates.
    }

    @Override
    protected SimpleOntoObject createOntoItem(String id) {
        QueryEngineHTTP engine = null;
        String query = null;
        try {
            SimpleOntoObject toRet = new SimpleOntoObject(id);
            //1. Сначала берем основные параметры - лейбл и класс

            query = DEFAULT_PREFIX + "select distinct (<" + id + "> as ?id) ?label ?class " +
                    "where { " +
                    "   OPTIONAL {" +
                    "       <" + id + "> rdfs:label ?label." +
                    "        FILTER (" +
                    "           (langMatches(lang(?label), \"" + requestInfo.getPreferedLanguage() + "\") || LANG(?label) = \"\")" +
                    "       ) " +
                    "   } " +
                    "   OPTIONAL{<" + id + "> rdf:type ?class.}" +
                    "}";
            engine = requestInfo.getQueryEngine(query);
            ResultSet rs = engine.execSelect();
            toRet.setObjClass(new HashSet<ClassInfo>());
            while (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String label = qs.getStringValue("label");
                String cls = qs.getStringValue("class");

                if (label != null) toRet.setLabel(label);
                toRet.getObjClass().add((ClassInfo) AModelBuilder.buildModel(ClassInfo.class, requestInfo, cls));
            }
            engine.close();

            //2. Берем все датапроперти для объекта
            query = DEFAULT_PREFIX + "select distinct ?dataProperty ?dpropertyValue " +
                    "where { " +
                    "   <" + id + "> ?dataProperty ?dpropertyValue. " +
                    "   ?dataProperty a owl:DatatypeProperty" +
                    "}";
            engine = requestInfo.getQueryEngine(query);
            rs = engine.execSelect();
            toRet.setDataProps(new HashSet<DataPropertyValue>());
            while (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String value = qs.getStringValue("dpropertyValue");
                String dpUri = qs.getStringValue("dataProperty");

                toRet.getDataProps().add(new DataPropertyValue((DataPropertyInfo)
                        AModelBuilder.buildModel(DataPropertyInfo.class, requestInfo, dpUri), value));
            }
            return toRet;
        } catch (Exception e) {
            logger.error("Exception executing" + query, e);
        } finally {
            if (engine != null) engine.close();
        }
        return null;
    }

    @Override
    protected void addToUtilStructures(UtilStructures us, SimpleOntoObject item) {
        us.addObject(item);
    }
    private Logger logger = LoggerFactory.getLogger(this.getClass());
}
