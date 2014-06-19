package ru.ifmo.ailab.ontology.viewer.servlets;

import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.*;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.JSONSerializable;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.AResponse;

public class PageViewerServlet extends BaseServlet<PagedViewerRequestAndContextModel, PagedViewerResponseModel> {
    @Override
    protected PagedViewerRequestAndContextModel getRequestModel(IRequestParams params) {
        return new PagedViewerRequestAndContextModel(params);
    }

    @Override
    protected PagedViewerResponseModel processRequest(PagedViewerRequestAndContextModel requestModel) {
        ResponseContext vrm = new ResponseContext();
        ARequest request = ARequest.getRequest(requestModel.getRequestParams());
        AResponse response = request.executeRequest(requestModel, vrm);
        final JsonValue result = response.getResponseAsJson(vrm);
        vrm.init(new JSONSerializable() {
            @Override
            public JsonValue serializeInJSON(IResponseCache cache) {
                return result;
            }
        });
        return new PagedViewerResponseModel(vrm.getResponseString());
    }
}
