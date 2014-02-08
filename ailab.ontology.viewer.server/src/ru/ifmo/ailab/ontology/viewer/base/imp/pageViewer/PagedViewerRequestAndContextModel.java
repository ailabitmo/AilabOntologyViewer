package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.ifmo.ailab.ontology.viewer.base.utils.smartrequest.InfoMessagingProvider;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.ARequestAndContextWithEndpoint;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:51
 *
 * %%% Модель запроса и контекста для просмотровщика
 */
public class PagedViewerRequestAndContextModel extends ARequestAndContextWithEndpoint<PagedViewerRequestAndContextModel> implements InfoMessagingProvider{

    String[] preferedLanguages = new String[]{"ru","en",""};

    String request;

    InfoMessagingProvider messenger;

    public InfoMessagingProvider getMessenger() {
        return messenger;
    }

    public void setMessenger(InfoMessagingProvider messenger) {
        this.messenger = messenger;
    }

    public String getRequest() {
        return request;
    }

    public void setRequest(String request) {
        this.request = request;
    }

    @Override
    public PagedViewerRequestAndContextModel init(String stringParams) {
        setEndpoint(stringParams.substring(0,stringParams.indexOf("$")));
        this.request = stringParams.substring(stringParams.indexOf("$")+1);
        return this;
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
        messenger.errorOccured(e);
    }

    @Override
    public void errorOccured(String errorString) {
        messenger.errorOccured(errorString);
    }

    @Override
    public void waitMessage(String waitMessage) {
        messenger.waitMessage(waitMessage);
    }

    @Override
    public void finishedMessage(String finishedMessage) {
        messenger.finishedMessage(finishedMessage);
    }

    /*String idOfRootInstance;

    String preferedLanguage = "ru";

    UtilStructures utilsAndCache ;

    public String getIdOfRootInstance() {
        return idOfRootInstance;
    }

    public void setIdOfRootInstance(String idOfRootInstance) {
        this.idOfRootInstance = idOfRootInstance;
    }

    public UtilStructures getUtilsAndCache() {
        return utilsAndCache;
    }



    @Override
    public PagedViewerRequestAndContextModel init(String stringParams) {
        utilsAndCache = new UtilStructures();
        List<String> params = StringUtils.split(stringParams, "$");
        setEndpoint(params.get(0));
        setIdOfRootInstance(params.get(1));
        if (params.size() > 2) setLogin(params.get(2));
        if (params.size() > 3) setPassword(params.get(3));
        return this;
    }

    @Override
    public String getRequestStringDescription() {
        return "format: endpoint$idOfRootInstance[$login$password] login|password - необязательные, idOfRootInstance - идентификатор корневой сущности, для которой вызывается просмотровщик";
    }

    public String getPreferedLanguage() {
        return preferedLanguage;
    }
    */
}
