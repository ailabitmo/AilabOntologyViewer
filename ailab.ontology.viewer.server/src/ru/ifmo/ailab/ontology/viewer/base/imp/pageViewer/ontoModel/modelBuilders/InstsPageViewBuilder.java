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
import ru.ifmo.ailab.ontology.viewer.base.utils.MainOntoCache;
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

        int pageNumber = getPageNumber(req, context);

        QueryEngineHTTP engine = null;
        String query = DEFAULT_PREFIX;
        try {

            context.waitMessage("Selecting instance list...");

            InstsPageView toRet = new InstsPageView(req);
            toRet.setNumOfPages(pageNumber);
            List<SimpleOntoObject> insts = new ArrayList<SimpleOntoObject>();
            toRet.setSimpleOO(insts);

            LanguageRequestHelper labelHelper = new LanguageRequestHelper(
                    new LanguageRequest("?item", "rdfs:label", "?labelPrefered", TripletPart.OBJECT, context.getPreferedLanguages())
            );

            if (req.getDirection() == Direction.IN || req.getDirection() == Direction.BOTH)//Both is bad here, should be on of IN and OUT
                query += "select distinct ?item ?labelPrefered where {" +
                        "?item <" + req.getObjPropId() + "> <" + req.getIdOfInstance() + ">" +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "} order by ?labelPrefered limit " + req.getPageProps().getCurrentLimit() + " offset " + req.getPageProps().getCurrentOffset();

            else if (req.getDirection() == Direction.OUT)
                query += "select distinct ?item ?labelPrefered where {" +
                        "<" + req.getIdOfInstance() + "> <" + req.getObjPropId() + "> ?item." +
                        labelHelper.getLanguageSelectorRequestPart() +
                        "} order by ?labelPrefered limit " + req.getPageProps().getCurrentLimit() + " offset " + req.getPageProps().getCurrentOffset();

            engine = context.getQueryEngine(query);
            ResultSet rs = engine.execSelect();

            int i = 1;
            while (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String idInst = qs.getStringValue("item");
                context.waitMessage("Selecting instance " + i++ + "...");
                insts.add((SimpleOntoObject) AModelBuilder.buildModel(SimpleOntoObject.class, context, idInst));
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

    private int getPageNumber(PagRequestToInstsOfObjProp req, PagedViewerRequestAndContextModel context) {
        //Check cache
        String idForPage = req.getIdOfInstance() + "_$%_instsNum_" + req.getObjPropId() + "_limit_" + req.getPageProps().getCurrentLimit();
        Integer val = (Integer) MainOntoCache.get(idForPage);
        if (val != null) return val;

        //Try to select
        QueryEngineHTTP engine = null;
        String query = DEFAULT_PREFIX;
        try {
            if (req.getDirection() == Direction.IN || req.getDirection() == Direction.BOTH)
                query += "select (COUNT(distinct ?item) AS ?count ) where {\n" +
                        "?item <"+req.getObjPropId()+"> <" + req.getIdOfInstance() + ">.\n" +
                        "}";
            else if (req.getDirection() == Direction.OUT)
                query += "select (COUNT(distinct ?item) AS ?count ) where {\n" +
                        " <" + req.getIdOfInstance() + "> <"+req.getObjPropId()+"> ?item.\n" +
                        "}";


            engine = context.getQueryEngine(query);
            ResultSet rs = engine.execSelect();
            if (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                float count = Integer.parseInt(qs.getStringValue("count"));
                float pages = count / req.getPageProps().getCurrentLimit();
                int toRet = (int) Math.ceil(pages);
                MainOntoCache.add(idForPage, toRet);
                return toRet;
            }

        } catch (Exception e) {
            logger.error("Exception", e);
            context.errorOccured(e);
        } finally {
            engine.close();
        }
        return -1;
    }

    @Override
    protected Class getClassOfBuildingModel() {
        return InstsPageView.class;
    }
}
