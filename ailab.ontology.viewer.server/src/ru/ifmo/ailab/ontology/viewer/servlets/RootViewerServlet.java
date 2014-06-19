package ru.ifmo.ailab.ontology.viewer.servlets;

import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.OntoObject;

public class RootViewerServlet extends BaseServlet<ViewerRequestAndContextModel, ViewerResponseModel> {
    @Override
    protected ViewerRequestAndContextModel getRequestModel(IRequestParams params) {
        return new ViewerRequestAndContextModel(params);
    }

    @Override
    protected ViewerResponseModel processRequest(ViewerRequestAndContextModel requestModel) {
        AModelBuilder.buildModel(OntoObject.class, requestModel, requestModel.getIdOfRootInstance());
        return new ViewerResponseModel(requestModel.getUtilsAndCache());
    }
}
