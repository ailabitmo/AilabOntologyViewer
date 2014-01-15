package ru.ifmo.ailab.ontology.viewer.base.interfaces;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 12:31
 */
public interface IRequestAndContextModel<REQ extends IRequestAndContextModel> {

    /**
     * Должен обязательно быть конструктор по умолчанию.
     * Основная инициализация должна происходить в этом методе - из
     * параметров запроса формируется модель запроса, которая потом поступает
     * в процессор
     * @param stringParams
     * @return
     */
    REQ init(String stringParams);

    String getRequestStringDescription();
}
