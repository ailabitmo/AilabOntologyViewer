package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;
import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.ARequestAndContextWithEndpoint;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:05
 *
 * %%% Модель запроса для зеркального обработчика.
 */
public class MirrorRequestAndContextModel extends ARequestAndContextWithEndpoint<MirrorRequestAndContextModel> {

    /**
     * post/get
     */
    private String typeOfRequest;
    private String sparqlRequest;

    public MirrorRequestAndContextModel(IRequestParams params) {
        setEndpoint(params.getString("endpoint"));
        setSparqlRequest(params.getString("sparqlRequest"));
        setTypeOfRequest(params.getString("requestType"));
        if (params.contains("login"))
            setLogin(params.getString("login"));
        if (params.contains("password"))
            setPassword(params.getString("password"));
    }

    public String getSparqlRequest() {
        return sparqlRequest;
    }

    public void setSparqlRequest(String sparqlRequest) {
        this.sparqlRequest = sparqlRequest;
    }

    public String getTypeOfRequest() {
        return typeOfRequest;
    }

    public void setTypeOfRequest(String typeOfRequest) {
        this.typeOfRequest = typeOfRequest;
    }

    @Override
    public String getRequestStringDescription() {
        return "format: endpoint$sparqlrequest$type[$login$password] type - get/post login|password - необязательные";
    }
}
