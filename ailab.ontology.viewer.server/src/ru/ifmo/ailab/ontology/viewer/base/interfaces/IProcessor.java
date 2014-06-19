package ru.ifmo.ailab.ontology.viewer.base.interfaces;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:02
 *
 * %%% Интерфейс обработчика
 */
public interface IProcessor<REQ extends IRequestAndContextModel, RESP extends IResponseModel> {
    /**
     * Обязательно наличие конструктора по умолчанию. Всю необходимую для обработки информацию
     * процессор должен получать из инпута
     * @param input
     * @return
     */
    RESP processRequest(REQ input);
}
