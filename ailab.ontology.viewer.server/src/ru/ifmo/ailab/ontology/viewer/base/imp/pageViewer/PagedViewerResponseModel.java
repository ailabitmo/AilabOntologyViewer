package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 7:50
 */
public class PagedViewerResponseModel implements IResponseModel {
    private String returnValue;

    public PagedViewerResponseModel(String returnValue) {
        this.returnValue = returnValue;
    }

    @Override
    public String getResponseString() {
        return returnValue;
    }

    @Override
    public String getResponseStringDescription() {
        return "Response is an object which contains 4 objects: class, dataProps, object props infos and particular request result";
    }
}
