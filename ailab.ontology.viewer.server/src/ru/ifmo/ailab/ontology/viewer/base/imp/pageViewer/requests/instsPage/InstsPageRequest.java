package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instsPage;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.*;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.objPropsPage.ObjPropsPageResponse;
import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;
import ru.spb.kpit.kivan.General.Strings.StringUtils;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 10:40
 */
public class InstsPageRequest extends ARequest<InstsPageResponse> {
    PagRequestToInstsOfObjProp req;
    @Override
    protected InstsPageResponse makeRequest() {
        context.waitMessage("Initing...");
        try {
            InstsPageView sci = (InstsPageView) AModelBuilder.buildModel(InstsPageView.class, context, req);
            return new InstsPageResponse(sci);
        } catch (Exception e) {
            context.errorOccured(e);
        }
        return new InstsPageResponse(null);
    }

    @Override
    protected void init(IRequestParams params) {
        req = new PagRequestToInstsOfObjProp(
            params.getString("idOfInstance"),
            params.getString("objPropId"),
            Direction.valueOf(params.getString("direction")),
            new PageInfoByPage(
                params.getInteger("pageNum"),
                params.getInteger("currentLimit")));
    }

    @Override
    protected String getRequestStringDescription() {
        return "format: idOfInst$direction(OUT|IN)$objPropId$pageNum$currentLimit";
    }

    @Override
    public String getId() {
        return getRequestStringDescription()+ " "+req.toString();
    }
}
