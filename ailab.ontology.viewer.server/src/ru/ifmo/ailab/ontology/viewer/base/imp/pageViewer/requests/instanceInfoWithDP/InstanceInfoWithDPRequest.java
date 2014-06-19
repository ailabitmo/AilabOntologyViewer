package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instanceInfoWithDP;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.DPOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instanceGeneralInfo.InstanceGeneralInfoResponse;
import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 9:46
 */
public class InstanceInfoWithDPRequest extends ARequest<InstanceInfoWithDPResponse> {
    private String id;

    @Override
    protected InstanceInfoWithDPResponse makeRequest() {
        context.waitMessage("Initing...");
        try {
            DPOntoObject sci = (DPOntoObject) AModelBuilder.buildModel(DPOntoObject.class, context, id);
            return new InstanceInfoWithDPResponse(sci);
        } catch (Exception e) {
            context.errorOccured(e);
        }
        return new InstanceInfoWithDPResponse(null);
    }

    @Override
    protected void init(IRequestParams params) {
        id = params.getString("idOfInstance");
    }

    @Override
    protected String getRequestStringDescription() {
        return "requests format for DP:idOfInstance";
    }

    @Override
    public String getId() {
        return getRequestStringDescription() + " " + id;
    }
}
