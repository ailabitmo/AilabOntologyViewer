package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests;


import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ResponseContext;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.ifmo.ailab.ontology.viewer.base.utils.MainOntoCache;
import ru.ifmo.ailab.ontology.viewer.exceptions.ProcessingException;
import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;
import ru.spb.kpit.kivan.Networking.Crawler.Model.ItemWithId;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

/**
 * IDEA
 * : Kivan
 * : 05.02.14
 * : 13:50
 */
public abstract class ARequest<A extends AResponse> extends ItemWithId {

    protected PagedViewerRequestAndContextModel context;
    protected ResponseContext response;

    public A executeRequest(PagedViewerRequestAndContextModel input, ResponseContext vrm) {
        this.response = vrm;
        this.context = input;
        //1. We have to check if it exists in the cache
        String requestId = getId();
        AResponse cachedResponse = (AResponse) MainOntoCache.get(requestId);
        if(cachedResponse!=null) return (A) cachedResponse;

        //2. If it doesn't exist, we have to make the request
        A result = makeRequest();
        MainOntoCache.add(requestId,result);
        return result;
    }

    protected abstract A makeRequest();

    protected abstract void init(IRequestParams params);

    protected abstract String getRequestStringDescription();
//-----------------STATIC-------------
    final static String packagePrefix = ARequest.class.getPackage().getName() + ".";

    public static ARequest getRequest(IRequestParams params) {
        String requestCls = packagePrefix + params.getString("requestType");
        try {
            Class cls = Class.forName(requestCls);
            Constructor c = cls.getConstructor();
            ARequest request = (ARequest) c.newInstance();
            request.init(params);
            return request;
        } catch (Exception e) {
            throw new ProcessingException(e);
        }
    }

    protected static LoggerWrapper logger = LoggerWrapper.getLogger(ARequest.class);
}
