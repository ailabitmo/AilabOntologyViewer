package ru.ifmo.ailab.ontology.viewer.servlets;

import ru.ifmo.ailab.ontology.viewer.base.imp.mirror.MirrorRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.mirror.MirrorResponseModel;
import ru.spb.kpit.kivan.Networking.NetworkingUtils;

import java.util.logging.Level;
import java.util.logging.Logger;

public class MirrorServlet extends BaseServlet<MirrorRequestAndContextModel, MirrorResponseModel> {
    @Override
    protected MirrorRequestAndContextModel getRequestModel(IRequestParams params) {
        return new MirrorRequestAndContextModel(params);
    }

    @Override
    protected MirrorResponseModel processRequest(MirrorRequestAndContextModel requestModel) {
        StringBuilder requestString = new StringBuilder()
                .append(requestModel.getEndpoint()).append(requestModel.getSparqlRequest());
        Logger.getLogger(getClass().getName()).log(Level.INFO, requestString.toString());

        String result;
        if ("post".equalsIgnoreCase(requestModel.getTypeOfRequest()))
            result = NetworkingUtils.sendContentToUrl(requestModel.getEndpoint(), requestModel.getSparqlRequest(), "utf-8", 10000, 3, null);
        else
            result = NetworkingUtils.getContentByUrl(requestString.toString(), "utf-8", 10000, 3, null);

        return new MirrorResponseModel(result);
    }
}
