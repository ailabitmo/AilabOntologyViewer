package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.ARequestAndContextWithEndpoint;
import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;
import ru.spb.kpit.kivan.Networking.smartrequest.InfoMessagingProvider;

import java.util.Map;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:51
 *
 * %%% Модель запроса и контекста для просмотровщика
 */
public class PagedViewerRequestAndContextModel extends ARequestAndContextWithEndpoint<PagedViewerRequestAndContextModel> implements InfoMessagingProvider{

    private static final String[] preferedLanguages = { "ru", "en", "" };

    IRequestParams requestParams;

    InfoMessagingProvider messenger;

    public InfoMessagingProvider getMessenger() {
        return messenger;
    }

    public void setMessenger(InfoMessagingProvider messenger) {
        this.messenger = messenger;
    }

    public IRequestParams getRequestParams() {
        return requestParams;
    }

    public PagedViewerRequestAndContextModel(IRequestParams params) {
        setEndpoint(params.getString("endpoint"));
        this.requestParams = params;
    }

    @Override
    public String getRequestStringDescription() {
        //example: http://localhost:8888/sparql$instanceGeneralInfo.InstanceGeneralInfoRequest$http://www.semanticweb.org/k0shk/ontologies/2013/5/learning#AnalyticGeometryAndLinearAlgebra
        return "Format for context: endpoint$className(if packagePrefix is not ARequest.class.getPackage(), then relative to ARequest package.className should be specified)$parameters . Parameters contain specific info for a particular request";
    }

    public String[] getPreferedLanguages() {
        return preferedLanguages;
    }

    public QueryEngineHTTP getQueryEngine(String query) {
        logger.debug("Requesting QE for: " + query);
        QueryEngineHTTP queryEngineHTTP = new QueryEngineHTTP(getEndpoint(), query);
        if (getLogin() != null)
            queryEngineHTTP.setBasicAuthentication(getLogin(), getPassword() != null ? getPassword().toCharArray() : "".toCharArray());
        return queryEngineHTTP;
    }

    private LoggerWrapper logger = LoggerWrapper.getLogger(this.getClass());

    @Override
    public void errorOccured(Exception e) {
        //messenger.errorOccured(e);
    }

    @Override
    public void errorOccured(String errorString) {
        //messenger.errorOccured(errorString);
    }

    @Override
    public void waitMessage(String waitMessage) {
        //messenger.waitMessage(waitMessage);
    }

    @Override
    public void finishedMessage(String finishedMessage) {
        //messenger.finishedMessage(finishedMessage);
    }
}
