package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 7:50
 */
public class PagedViewerResponseModel implements IResponseModel<PagedViewerResponseModel,String> {
    String toRet = "";
    @Override
    public String getResponseString() {
        return toRet;
    }

    @Override
    public String getResponseStringDescription() {
        return "Response is an object which contains 4 objects: class, dataProps, object props infos and particular request result";
    }

    @Override
    public PagedViewerResponseModel init(String a) {
        toRet = a;
        return this;
    }
}
