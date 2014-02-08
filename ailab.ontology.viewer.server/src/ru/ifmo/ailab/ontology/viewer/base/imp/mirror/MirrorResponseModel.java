package ru.ifmo.ailab.ontology.viewer.base.imp.mirror;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:21
 *
 * %%% Модель выхода для зеркального обработчика
 */
public class MirrorResponseModel implements IResponseModel<MirrorResponseModel,String> {

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
    public MirrorResponseModel init(String a) {
        this.resultFromSparql = (String) a;
        return this;
    }
}
