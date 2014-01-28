package ru.ifmo.ailab.ontology.viewer.base.interfaces;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 19:10
 *
 * %%% Пустая модель ответа
 */
public class EmptyResponseModel implements IResponseModel<EmptyResponseModel> {
    @Override
    public String getResponseString() {
        return "";
    }

    @Override
    public String getResponseStringDescription() {
        return "Нет";
    }

    @Override
    public EmptyResponseModel init(Object a) {
        return this;
    }
}
