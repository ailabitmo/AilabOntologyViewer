package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequestHelper;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.TripletPart;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops.ParticularObjectProperty;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops.SimpleObjectPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.ObjPropsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.PagRequestToObjPropsOfInst;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

import java.util.ArrayList;
import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 10:16
 */
public class ObjPropsPageViewBuilder extends AStartSequenceModelBuilder<ObjPropsPageView> {
    @Override
    protected ObjPropsPageView createOntoItemFromSPARQL(Object id, PagedViewerRequestAndContextModel context) {
        PagRequestToObjPropsOfInst reqId = (PagRequestToObjPropsOfInst) id;

        QueryEngineHTTP engine = null;
        String query = null;
        try {
            context.waitMessage("Querying SPARQL...");
            ObjPropsPageView toRet = new ObjPropsPageView(reqId);
            List<ParticularObjectProperty> objProps = new ArrayList<ParticularObjectProperty>();
            toRet.setObjProps(objProps);

            LanguageRequestHelper labelHelper = new LanguageRequestHelper(
                    new LanguageRequest("?objProperty ", "rdfs:label", "?labelPrefered", TripletPart.OBJECT, context.getPreferedLanguages())
            );

            if (reqId.getDirection() == Direction.IN)
                query = "select distinct ?objProperty ?labelPrefered ?direction where {" +
                        "_:a ?objProperty   <" + reqId.getIdOfInstance() + ">." +
                        "?objProperty a owl:ObjectProperty." +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "bind (\"IN\" as ?direction)} order by ?labelPrefered limit " + reqId.getPageProps().getCurrentLimit() + " offset " + reqId.getPageProps().getCurrentOffset();
            else if (reqId.getDirection() == Direction.OUT)
                query = "select distinct ?objProperty ?labelPrefered ?direction where {" +
                        "<" + reqId.getIdOfInstance() + ">  ?objProperty _:a." +
                        "?objProperty a owl:ObjectProperty." +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "bind (\"OUT\" as ?direction)} order by ?labelPrefered limit " + reqId.getPageProps().getCurrentLimit() + " offset " + reqId.getPageProps().getCurrentOffset();

            else if (reqId.getDirection() == Direction.BOTH)
                query = "select distinct ?objProperty ?labelPrefered ?direction where {" +
                        "{<" + reqId.getIdOfInstance() + ">  ?objProperty _:a." +
                        "?objProperty a owl:ObjectProperty." +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "bind (\"OUT\" as ?direction)} UNION {"+
                        "_:b ?objProperty   <" + reqId.getIdOfInstance() + ">." +
                        "?objProperty a owl:ObjectProperty." +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "bind (\"IN\" as ?direction)}} order by ?labelPrefered limit " + reqId.getPageProps().getCurrentLimit() + " offset " + reqId.getPageProps().getCurrentOffset();


            engine = context.getQueryEngine(query);
            ResultSet rs = engine.execSelect();

            while (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String idObjProp = qs.getStringValue("objProperty");
                String label = qs.getStringValue("labelPrefered");
                String dir = qs.getStringValue("direction");

                SimpleObjectPropertyInfo sopi = new SimpleObjectPropertyInfo(idObjProp);
                sopi.setLabel(label);
                sopi = (SimpleObjectPropertyInfo) AModelBuilder.setModelIfNeeded(SimpleObjectPropertyInfo.class,sopi);

                objProps.add(new ParticularObjectProperty(sopi, Direction.valueOf(dir)));
            }
            context.waitMessage("Preparing data...");
            return toRet;

        } catch (Exception e) {
            logger.error("Exception", e);
        } finally {
            engine.close();
        }
        return null;
    }

    @Override
    protected Class getClassOfBuildingModel() {
        return ObjPropsPageView.class;
    }
}
