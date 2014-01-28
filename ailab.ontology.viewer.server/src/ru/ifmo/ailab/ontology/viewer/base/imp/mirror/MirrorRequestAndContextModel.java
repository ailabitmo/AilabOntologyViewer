package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

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
    String typeOfRequest;
    String sparqlRequest;

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
    public MirrorRequestAndContextModel init(String stringParams) {
        List<String> params = StringUtils.split(stringParams, "$");
        setEndpoint(params.get(0));
        setSparqlRequest(params.get(1));
        setTypeOfRequest(params.get(2));
        if(params.size()>3) setLogin(params.get(3));
        if(params.size()>4) setPassword(params.get(4));

        return this;
    }

    @Override
    public String getRequestStringDescription() {
        return "format: endpoint$sparqlrequest$type[$login$password] type - get/post login|password - необязательные";
    }
}
