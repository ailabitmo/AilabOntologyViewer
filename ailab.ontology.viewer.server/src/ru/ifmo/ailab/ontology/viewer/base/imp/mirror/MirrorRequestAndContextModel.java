package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.ARequestAndContextWithEndpoint;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:05
 */
public class MirrorRequestAndContextModel extends ARequestAndContextWithEndpoint<MirrorRequestAndContextModel> {

    String sparqlRequest;

    public String getSparqlRequest() {
        return sparqlRequest;
    }

    public void setSparqlRequest(String sparqlRequest) {
        this.sparqlRequest = sparqlRequest;
    }

    @Override
    public MirrorRequestAndContextModel init(String stringParams) {
        List<String> params = StringUtils.split(stringParams, "$");
        setEndpoint(params.get(0));
        setSparqlRequest(params.get(1));
        if(params.size()>2) setLogin(params.get(2));
        if(params.size()>3) setPassword(params.get(3));

        return this;
    }

    @Override
    public String getRequestStringDescription() {
        return "format: endpoint$sparqlrequest[$login$password] login|password - необязательные";
    }
}
