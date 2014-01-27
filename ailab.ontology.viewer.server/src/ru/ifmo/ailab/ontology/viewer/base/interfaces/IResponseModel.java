package ru.ifmo.ailab.ontology.viewer.base.interfaces;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 12:37
 *
 * %%% Интерфейс модели
 */
public interface IResponseModel<RESP extends IResponseModel> {
    /**
     * @return
     */
    String getResponseString();

    String getResponseStringDescription();

    /**
     * Должен обязательно быть конструктор по умолчанию.
     * Основная инициализация должна происходить в этом методе - из
     * параметра a должна быть сформирована модель.
     * @param a
     * @return
     */
    RESP init(Object a);
}
