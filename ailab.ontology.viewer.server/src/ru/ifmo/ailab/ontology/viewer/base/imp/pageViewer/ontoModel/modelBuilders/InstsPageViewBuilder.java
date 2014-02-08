package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequestHelper;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.TripletPart;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.InstsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.PagRequestToInstsOfObjProp;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

import java.util.ArrayList;
import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 10:44
 */
public class InstsPageViewBuilder extends AStartSequenceModelBuilder<InstsPageView> {
    @Override
    protected InstsPageView createOntoItemFromSPARQL(Object id, PagedViewerRequestAndContextModel context) {
        PagRequestToInstsOfObjProp req = (PagRequestToInstsOfObjProp) id;

        QueryEngineHTTP engine = null;
        String query = null;
        try {

            context.waitMessage("Selecting instance list...");

            InstsPageView toRet = new InstsPageView(req);
            List<SimpleOntoObject> objProps = new ArrayList<SimpleOntoObject>();
            toRet.setSimpleOO(objProps);

            LanguageRequestHelper labelHelper = new LanguageRequestHelper(
                    new LanguageRequest("?item", "rdfs:label", "?labelPrefered", TripletPart.OBJECT, context.getPreferedLanguages())
            );

            if (req.getDirection() == Direction.IN || req.getDirection() ==Direction.BOTH)
                query = "select ?item ?labelPrefered where {" +
                        "?item <" + req.getObjPropId() + "> <" + req.getIdOfInstance() + ">" +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "} order by ?labelPrefered limit "+req.getPageProps().getCurrentLimit()+" offset "+req.getPageProps().getCurrentOffset();

            else if (req.getDirection() == Direction.OUT)
                query = "select ?item ?labelPrefered where {" +
                        "<" + req.getIdOfInstance() + "> <" + req.getObjPropId() + "> ?item." +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "} order by ?labelPrefered limit "+req.getPageProps().getCurrentLimit()+" offset "+req.getPageProps().getCurrentOffset();

            engine = context.getQueryEngine(query);
            ResultSet rs = engine.execSelect();

            int i = 1;
            while (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String idInst = qs.getStringValue("item");
                context.waitMessage("Selecting instance " + i++ + "...");
                objProps.add((SimpleOntoObject) AModelBuilder.buildModel(SimpleOntoObject.class, context, idInst));
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
        return InstsPageView.class;
    }
}
