package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.ObjectPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 20:07
 */
public class ObjectPropertyInfoBuilder extends AModelBuilder<ObjectPropertyInfo> {
    public ObjectPropertyInfoBuilder(ViewerRequestAndContextModel inputParams) {
        super(inputParams);
    }

    protected ObjectPropertyInfo createOntoItem(String id) {
        String query = "select distinct (<" + id + "> as ?id) ?label where {OPTIONAL{<" + id + "> rdfs:label ?label.}}";
        QueryEngineHTTP engine = requestInfo.getQueryEngine(query);
        try {
            ResultSet rs = engine.execSelect();
            if(rs.hasNext()){
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String label = qs.getStringValue("label");
                ObjectPropertyInfo toRet = new ObjectPropertyInfo(id);
                toRet.setLabel(label);
                return toRet;
            }
        } catch (Exception e) {
            Logger.exception(e);
        }
        return null;
    }

    @Override
    protected void addToUtilStructures(UtilStructures us, ObjectPropertyInfo item) {
        us.addObjPropertyInfo(item);
    }
}
