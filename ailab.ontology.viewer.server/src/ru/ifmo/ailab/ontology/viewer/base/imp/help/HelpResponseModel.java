package ru.ifmo.ailab.ontology.viewer.base.imp.help;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 19:11
 *
 * %%% Модель ответа для вспомогательного процессора
 */
public class HelpResponseModel implements IResponseModel<HelpResponseModel> {

    String helpString;

    @Override
    public String getResponseString() {
        return helpString;
    }

    @Override
    public String getResponseStringDescription() {
        return "Вспомогательная информация";
    }

    @Override
    public HelpResponseModel init(Object a) {
        this.helpString = (String) a;
        return this;
    }
}
