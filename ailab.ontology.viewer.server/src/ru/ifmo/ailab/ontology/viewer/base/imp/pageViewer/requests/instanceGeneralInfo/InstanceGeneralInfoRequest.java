package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instanceGeneralInfo;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo.SimpleClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;

/**
 * IDEA
 * : Kivan
 * : 05.02.14
 * : 14:41
 * <p/>
 * Request for info about info of only one element.
 */
public class InstanceGeneralInfoRequest extends ARequest<InstanceGeneralInfoResponse> {

    String id;

    @Override
    protected InstanceGeneralInfoResponse makeRequest() {
        context.waitMessage("Initing...");
        try {
            SimpleOntoObject sci = (SimpleOntoObject) AModelBuilder.buildModel(SimpleOntoObject.class, context, id);
            return new InstanceGeneralInfoResponse(sci);
        } catch (Exception e) {
            context.errorOccured(e);
        }
        return new InstanceGeneralInfoResponse(null);
    }

    @Override
    public void init(String stringParams) {
        //
        this.id = stringParams;
    }

    @Override
    public String getRequestStringDescription() {
        return "requests format:idOfInstance";
    }

    @Override
    public String getId() {
        return getRequestStringDescription() + " " + id;
    }
}
