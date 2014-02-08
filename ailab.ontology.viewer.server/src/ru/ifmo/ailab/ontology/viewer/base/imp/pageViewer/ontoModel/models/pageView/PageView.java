package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.JSONSerializable;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:06
 */
public abstract class PageView extends PartialOntoItem implements JSONSerializable{
    public PageView(String id) {
        super(id);
    }
}
