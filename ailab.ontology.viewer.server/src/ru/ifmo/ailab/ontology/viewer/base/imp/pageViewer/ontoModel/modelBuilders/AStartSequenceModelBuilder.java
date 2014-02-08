package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;

/**
 * IDEA
 * : Kivan
 * : 03.02.14
 * : 18:00
 *
 * If inheritance sequence start from the class, it should be inherited from ANotStartSequenceModelBuilder
 */
public abstract class AStartSequenceModelBuilder<OI extends PartialOntoItem> extends AModelBuilder<OI> {
    @Override
    protected OI createOntoItemFromSPARQLUsingPrevios(PartialOntoItem predecessor, PagedViewerRequestAndContextModel requestInfo) {
        //It is root class, so it doesn't have predecessor
        return null;
    }
}
