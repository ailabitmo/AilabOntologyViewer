package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;

import java.lang.reflect.Constructor;

/**
 * IDEA
 * : Kivan
 * : 03.02.14
 * : 18:06
 *
 * If inheritance sequence doesn't start from the class, it should be inherited from ANotStartSequenceModelBuilder
 */
public abstract class ANotStartSequenceModelBuilder<OI extends PartialOntoItem> extends AModelBuilder<OI> {
    @Override
    protected OI createOntoItemFromSPARQL(Object id, PagedViewerRequestAndContextModel requestInfo) {
        Class build = getClassOfBuildingModel();
        try {
            Constructor c = build.getConstructor(id.getClass());
            PartialOntoItem dpo = (PartialOntoItem) c.newInstance(id);
            return createOntoItemFromSPARQLUsingPrevios(
                    (PartialOntoItem) AModelBuilder.buildPredecessor(dpo, requestInfo, id),requestInfo
            );
        } catch (Exception e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    protected OI createOntoItemFromSPARQLUsingPrevios(PartialOntoItem predecessor, PagedViewerRequestAndContextModel requestInfo) {
        OI cloned = clonePredecessorProperties(predecessor);
        fillOntoItemFromSparql(cloned, requestInfo);
        return cloned;
    }

    protected abstract void fillOntoItemFromSparql(OI itemToFill, PagedViewerRequestAndContextModel requestInfo);

    protected abstract OI clonePredecessorProperties(PartialOntoItem predecessor);
}
