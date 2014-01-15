package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:21
 */
public class MirrorResponseModel implements IResponseModel<MirrorResponseModel> {

    String resultFromSparql;

    @Override
    public String getResponseString() {
        return resultFromSparql;
    }

    @Override
    public String getResponseStringDescription() {
        return "Строка, сформированная спарклом без изменений";
    }

    @Override
    public MirrorResponseModel init(Object a) {
        this.resultFromSparql = (String) a;
        return this;
    }
}
