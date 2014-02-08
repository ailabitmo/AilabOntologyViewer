package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.spb.kpit.kivan.Networking.NetworkingUtils;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IProcessor;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:29
 * <p/>
 * %%% Обработчик запросов типа "зеркало". Зеркалит на выход то, что приходит ему на входе.
 */
public class MirrorProcessor implements IProcessor<MirrorRequestAndContextModel, MirrorResponseModel> {

    @Override
    public MirrorResponseModel processRequest(MirrorRequestAndContextModel input) {
        StringBuilder requestString = new StringBuilder();

        requestString.append(input.getEndpoint()).append(input.getSparqlRequest());
        logger.debug(requestString.toString());

        String result="";

        logger.debug(requestString.toString());
        if ("post".equalsIgnoreCase(input.getTypeOfRequest()))
            result = NetworkingUtils.sendContentToUrl(input.getEndpoint(), input.getSparqlRequest(), "utf-8", 10000, 3, null);
        else
            result = NetworkingUtils.getContentByUrl(requestString.toString(), "utf-8", 10000, 3, null);

        return new MirrorResponseModel().init(result);
    }

    /*QueryEngineHTTP queryEngineHTTP = new QueryEngineHTTP(context.getEndpoint(), context.getSparqlRequest());
        if (context.getLogin() != null)
            queryEngineHTTP.setBasicAuthentication(context.getLogin(), context.getPassword() != null ? context.getPassword().toCharArray() : "".toCharArray());

        Model ml = queryEngineHTTP.execConstruct();*/
    private LoggerWrapper logger = LoggerWrapper.getLogger(this.getClass());
}
