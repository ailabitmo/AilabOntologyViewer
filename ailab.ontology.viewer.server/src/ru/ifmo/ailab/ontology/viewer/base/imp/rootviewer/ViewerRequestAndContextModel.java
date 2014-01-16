package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer;

import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.ARequestAndContextWithEndpoint;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:51
 */
public class ViewerRequestAndContextModel extends ARequestAndContextWithEndpoint<ViewerRequestAndContextModel> {

    String idOfRootInstance;

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

    public QueryEngineHTTP getQueryEngine(String query) {
        Logger.debug("Requesting QE for: " + query);
        QueryEngineHTTP queryEngineHTTP = new QueryEngineHTTP(getEndpoint(), query);
        if (getLogin() != null)
            queryEngineHTTP.setBasicAuthentication(getLogin(), getPassword() != null ? getPassword().toCharArray() : "".toCharArray());
        return queryEngineHTTP;
    }

    @Override
    public ViewerRequestAndContextModel init(String stringParams) {
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
}
