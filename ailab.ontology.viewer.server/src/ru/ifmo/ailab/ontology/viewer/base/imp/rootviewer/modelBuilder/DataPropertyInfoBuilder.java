package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.DataPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 20:07
 *
 * %%% Построитель модели информации о свойстве данных по запросу к хранилищу.
 */
public class DataPropertyInfoBuilder extends AModelBuilder<DataPropertyInfo> {
    public DataPropertyInfoBuilder(ViewerRequestAndContextModel inputParams) {
        super(inputParams);
    }

    @Override
    protected DataPropertyInfo createOntoItem(String id) {
        String query = "select distinct (<" + id + "> as ?id) ?label " +
                "where {" +
                "   OPTIONAL {" +
                "       <" + id + "> rdfs:label ?label." +
                "        FILTER (" +
                "           (langMatches(lang(?label), \"" + requestInfo.getPreferedLanguage() + "\") || LANG(?label) = \"\")" +
                "       ) " +
                "   } " +
                "}";
        QueryEngineHTTP engine = requestInfo.getQueryEngine(query);
        try {
            ResultSet rs = engine.execSelect();
            if(rs.hasNext()){
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String label = qs.getStringValue("label");
                DataPropertyInfo toRet = new DataPropertyInfo(id);
                toRet.setLabel(label);
                return toRet;
            }
        } catch (Exception e) {
            Logger.exception(e);
        }
        return null;
    }

    @Override
    protected void addToUtilStructures(UtilStructures us, DataPropertyInfo item) {
        us.addDataPropertyInfo(item);
    }
}
