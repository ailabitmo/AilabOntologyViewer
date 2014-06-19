package ru.ifmo.ailab.ontology.viewer.servlets;

public interface IRequestParams {

    Iterable<String> names();

    boolean contains(String paramName);

    String getString(String paramName);

    String[] getStrings(String paramName);

    int getInteger(String paramName);

    boolean getBoolean(String paramName);
}
