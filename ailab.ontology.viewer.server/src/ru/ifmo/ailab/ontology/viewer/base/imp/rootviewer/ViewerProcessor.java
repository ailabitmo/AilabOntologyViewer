package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer;

import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder.AModelBuilder;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.OntoObject;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IProcessor;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:59
 *
 * %%% Обработчик запроса для просмотровщика
 */
public class ViewerProcessor implements IProcessor<ViewerRequestAndContextModel, ViewerResponseModel> {
    public ViewerResponseModel processRequest(ViewerRequestAndContextModel input) {
        AModelBuilder.buildModel(OntoObject.class, input, input.idOfRootInstance);
        return new ViewerResponseModel().init(input.getUtilsAndCache());
    }
}
