package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IProcessor;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;
import ru.spb.kpit.kivan.Networking.NetworkingUtils;

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
        Logger.debug(requestString.toString());

        String result="";

        Logger.debug(requestString.toString());

        if ("post".equalsIgnoreCase(input.getTypeOfRequest()))
            result = NetworkingUtils.sendContentToUrl(input.getEndpoint(), input.getSparqlRequest(), "utf-8", 10000, 3, null);
        else
            result = NetworkingUtils.getContentByUrl(requestString.toString(), "utf-8", 10000, 3, null);

        return new MirrorResponseModel().init(result);
    }
}
