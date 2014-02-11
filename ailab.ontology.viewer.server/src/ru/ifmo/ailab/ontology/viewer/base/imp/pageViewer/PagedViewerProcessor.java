package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.JSONSerializable;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.ARequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests.AResponse;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IProcessor;
import ru.spb.kpit.kivan.Networking.smartrequest.SmartRequest;
import ru.spb.kpit.kivan.Networking.smartrequest.SmartRequestPool;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:59
 *
 * %%% Обработчик запроса для просмотровщика
 */
public class PagedViewerProcessor implements IProcessor<PagedViewerRequestAndContextModel, PagedViewerResponseModel> {
    public PagedViewerResponseModel processRequest(final PagedViewerRequestAndContextModel input) {
        String currentResponse = requestPool.processRequest(new SmartRequest(input.getRequest()) {
            protected void processRequest() {
                try {
                    waitMessage("Initialization");
                    input.setMessenger(this);
                    ResponseContext vrm = new ResponseContext();
                    ARequest request = ARequest.getRequest(paramString);
                    AResponse response = request.executeRequest(input,vrm);
                    final JsonValue result = response.getResponseAsJson(vrm);
                    vrm.init(new JSONSerializable() {
                        @Override
                        public JsonValue serializeInJSON(IResponseCache cache) {
                            return result;
                        }
                    });
                    finishedMessage(vrm.getResponseString());

                } catch (Exception e) {
                    errorOccured(e);
                }
            }
        });

        return new PagedViewerResponseModel().init(currentResponse);
    }

//----------------Static------------------
    private static SmartRequestPool requestPool = new SmartRequestPool();

}
