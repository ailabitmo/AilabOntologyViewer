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
public class MirrorResponseModel implements IResponseModel {

    private String resultFromSparql;

    public MirrorResponseModel(String a) {
        this.resultFromSparql = a;
    }

    @Override
    public String getResponseString() {
        return resultFromSparql;
    }

    @Override
    public String getResponseStringDescription() {
        return "Строка, сформированная спарклом без изменений";
    }
}
