package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer;

import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.ifmo.ailab.ontology.viewer.servlets.IRequestParams;
import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.ARequestAndContextWithEndpoint;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:51
 *
 * %%% Модель запроса и контекста для просмотровщика
 */
public class ViewerRequestAndContextModel extends ARequestAndContextWithEndpoint<ViewerRequestAndContextModel> {

    String idOfRootInstance;

    String preferedLanguage = "ru";

    UtilStructures utilsAndCache;

    public ViewerRequestAndContextModel(IRequestParams params) {
        this.utilsAndCache = new UtilStructures();
        setEndpoint(params.getString("endpoint"));
        setIdOfRootInstance(params.getString("idOfRootInstance"));
        if (params.contains("login"))
            setLogin(params.getString("login"));
        if (params.contains("password"))
            setPassword(params.getString("password"));
    }

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
        logger.debug("Requesting QE for: " + query);
        QueryEngineHTTP queryEngineHTTP = new QueryEngineHTTP(getEndpoint(), query);
        if (getLogin() != null)
            queryEngineHTTP.setBasicAuthentication(getLogin(), getPassword() != null ? getPassword().toCharArray() : "".toCharArray());
        return queryEngineHTTP;
    }

    @Override
    public String getRequestStringDescription() {
        return "format: endpoint$idOfRootInstance[$login$password] login|password - необязательные, idOfRootInstance - идентификатор корневой сущности, для которой вызывается просмотровщик";
    }

    public String getPreferedLanguage() {
        return preferedLanguage;
    }

    private Logger logger = LoggerFactory.getLogger(this.getClass());
}