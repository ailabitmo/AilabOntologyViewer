package ru.ifmo.ailab.ontology.viewer.base.interfaces;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 19:09
 *
 * %%% Пустая модель запроса
 */
public class EmptyRequestAndContextModel implements IRequestAndContextModel {
    @Override
    public String getRequestStringDescription() {
        return "Нет";
    }
}
