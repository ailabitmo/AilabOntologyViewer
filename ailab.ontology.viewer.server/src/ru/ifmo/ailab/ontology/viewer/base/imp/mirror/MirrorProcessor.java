package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.spb.kpit.kivan.Networking.NetworkingUtils;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IProcessor;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:29
 */
public class MirrorProcessor implements IProcessor<MirrorRequestAndContextModel, MirrorResponseModel> {

    @Override
    public MirrorResponseModel processRequest(MirrorRequestAndContextModel input) {
        StringBuilder requestString = new StringBuilder();

        requestString.append(input.getEndpoint()).append(input.getSparqlRequest());
        logger.debug(requestString.toString());

        String result = NetworkingUtils.sendContentToUrl(input.getEndpoint(), input.getSparqlRequest(), "utf-8", 10000, 3, null);

        return new MirrorResponseModel().init("result");
    }

    /*QueryEngineHTTP queryEngineHTTP = new QueryEngineHTTP(input.getEndpoint(), input.getSparqlRequest());
        if (input.getLogin() != null)
            queryEngineHTTP.setBasicAuthentication(input.getLogin(), input.getPassword() != null ? input.getPassword().toCharArray() : "".toCharArray());

        Model ml = queryEngineHTTP.execConstruct();*/
    private Logger logger = LoggerFactory.getLogger(this.getClass());
}
