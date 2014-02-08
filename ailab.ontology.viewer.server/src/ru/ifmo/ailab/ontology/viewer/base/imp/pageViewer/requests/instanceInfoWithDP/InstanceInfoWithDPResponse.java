package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instanceInfoWithDP;

import org.apache.jena.atlas.json.JsonString;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.DPOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.AResponse;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 9:46
 */
public class InstanceInfoWithDPResponse extends AResponse {
    DPOntoObject obj;

    public InstanceInfoWithDPResponse(DPOntoObject obj) {
        this.obj = obj;
    }

    @Override
    public JsonValue getResponseAsJson(IResponseCache cache) {
        if(obj!=null) return obj.serializeInJSON(cache);
        else return new JsonString("");
    }
}
