package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.ClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;


/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 20:06
 *
 * %%% Построитель модели информации о классе по запросу к хранилищу.
 */
public class ClassInfoBuilder extends AModelBuilder<ClassInfo> {

    public ClassInfoBuilder(ViewerRequestAndContextModel request) {
        super(request);
    }

    protected ClassInfo createOntoItem(String id) {
        String query = "select distinct (<" + id + "> as ?id) ?label ?parentClass " +
                "where { " +
                "   OPTIONAL {" +
                "       <" + id + "> rdfs:label ?label." +
                "        FILTER (" +
                "           (langMatches(lang(?label), \""+ requestInfo.getPreferedLanguage() + "\") || LANG(?label) = \"\")" +
                "       ) " +
                "   } " +
                "   OPTIONAL{<" + id + "> rdfs:subClassOf ?parentClass.}" +
                "}";
        QueryEngineHTTP engine = requestInfo.getQueryEngine(query);
        /*QueryExecution qe = QueryExecutionFactory.sparqlService("", );*/
        try {
            ResultSet rs = engine.execSelect();
            if(rs.hasNext()){
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String parentUri = qs.getStringValue("parentClass");
                String label = qs.getStringValue("label");

                ClassInfo toRet = new ClassInfo(id);
                toRet.setParentClass((ClassInfo) AModelBuilder.buildModel(ClassInfo.class, requestInfo, parentUri));
                toRet.setLabel(label);
                return toRet;
            }
        } catch (Exception e) {
            Logger.exception(e);
        }
        return null;
    }

    @Override
    protected void addToUtilStructures(UtilStructures us, ClassInfo item) {
        us.addClassInfo(item);
    }
}
