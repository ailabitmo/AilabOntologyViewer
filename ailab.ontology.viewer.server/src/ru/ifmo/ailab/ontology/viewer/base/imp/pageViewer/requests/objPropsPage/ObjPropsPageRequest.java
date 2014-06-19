package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.objPropsPage;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.ObjPropsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.PagRequestToObjPropsOfInst;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.PageInfoByPage;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;
import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;
import ru.spb.kpit.kivan.General.Strings.StringUtils;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 9:54
 */
public class ObjPropsPageRequest extends ARequest<ObjPropsPageResponse> {
    private PagRequestToObjPropsOfInst requestModel;

    @Override
    protected ObjPropsPageResponse makeRequest() {
        context.waitMessage("Initing...");
        try {
            ObjPropsPageView sci = (ObjPropsPageView) AModelBuilder.buildModel(ObjPropsPageView.class, context, requestModel);
            return new ObjPropsPageResponse(sci);
        } catch (Exception e) {
            context.errorOccured(e);
        }
        return new ObjPropsPageResponse(null);
    }

    @Override
    protected void init(IRequestParams params) {
        requestModel = new PagRequestToObjPropsOfInst(
            params.getString("idOfInstance"),
            new PageInfoByPage(
                params.getInteger("pageNum"),
                params.getInteger("currentLimit")),
            Direction.valueOf(params.getString("direction")));
    }

    @Override
    protected String getRequestStringDescription() {
        return "format: idOfInst$direction(OUT|IN|BOTH)$pageNum$currentLimit";
    }

    @Override
    public String getId() {
        return getRequestStringDescription()+" "+requestModel.toString();
    }
}
