package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.objPropsPage;

import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.ObjPropsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.AResponse;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 9:54
 */
public class ObjPropsPageResponse extends AResponse {
    ObjPropsPageView obj;

    public ObjPropsPageResponse(ObjPropsPageView obj) {
        this.obj = obj;
    }

    @Override
    public JsonValue getResponseAsJson(IResponseCache cache) {
        return obj.serializeInJSON(cache);
    }
}
