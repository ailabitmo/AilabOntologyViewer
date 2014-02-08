package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instanceGeneralInfo;

import org.apache.jena.atlas.json.JsonString;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.AResponse;

/**
 * IDEA
 * : Kivan
 * : 05.02.14
 * : 18:10
 */
public class InstanceGeneralInfoResponse extends AResponse {

    SimpleOntoObject object;

    public InstanceGeneralInfoResponse(SimpleOntoObject object) {
        this.object = object;
    }

    @Override
    public JsonValue getResponseAsJson(IResponseCache cache) {
        if (object != null)
            return object.serializeInJSON(cache);
        else return new JsonString("");
    }
}
