package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.instsPage;

import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.InstsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.AResponse;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 10:40
 */
public class InstsPageResponse extends AResponse {
    InstsPageView obj;

    public InstsPageResponse(InstsPageView obj) {
        this.obj = obj;
    }

    @Override
    public JsonValue getResponseAsJson(IResponseCache cache) {
        return obj.serializeInJSON(cache);
    }
}
