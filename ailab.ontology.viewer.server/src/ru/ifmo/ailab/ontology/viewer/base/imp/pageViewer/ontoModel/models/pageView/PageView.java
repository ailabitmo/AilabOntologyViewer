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

    int numOfPages=-1;

    public int getNumOfPages() {
        return numOfPages;
    }

    public void setNumOfPages(int numOfPages) {
        this.numOfPages = numOfPages;
    }

    public PageView(String id) {
        super(id);
    }
}
