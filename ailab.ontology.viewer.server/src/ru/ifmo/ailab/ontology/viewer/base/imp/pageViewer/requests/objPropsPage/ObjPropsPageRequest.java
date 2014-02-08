package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.objPropsPage;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.ObjPropsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.PagRequestToObjPropsOfInst;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.PageInfoByPage;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;
import ru.spb.kpit.kivan.General.Strings.StringUtils;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 9:54
 */
public class ObjPropsPageRequest extends ARequest<ObjPropsPageResponse> {
    PagRequestToObjPropsOfInst requestModel;

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
    protected void init(String stringParams) {
        List<String> params = StringUtils.split(stringParams, "$");
        requestModel = new PagRequestToObjPropsOfInst(
                params.get(0),
                new PageInfoByPage(Integer.parseInt(params.get(2)), Integer.parseInt(params.get(3))),
                Direction.valueOf(params.get(1))
        );
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
