package ru.ifmo.ailab.ontology.viewer.servlets;

import ru.ifmo.ailab.ontology.viewer.exceptions.RequestParameterException;

import java.util.Map;

/**
* Created by amorozov on 09.06.2014.
*/
class MapRequestParams implements IRequestParams {
    private Map<String, String[]> params;

    public MapRequestParams(Map<String, String[]> params) {
        this.params = params;
    }

    @Override
    public Iterable<String> names() {
        return params.keySet();
    }

    @Override
    public boolean contains(String paramName) {
        return params.containsKey(paramName);
    }

    @Override
    public String[] getStrings(String paramName) {
        String[] values = params.get(paramName);
        if (values == null)
            throw new RequestParameterException(paramName, "Parameter doesn't exists.");
        return values;
    }

    @Override
    public String getString(String paramName) {
        String[] values = getStrings(paramName);
        if (values.length > 1)
            throw new RequestParameterException(paramName, "Expected single value.");
        return values[0];
    }

    @Override
    public int getInteger(String paramName) {
        String value = getString(paramName);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new RequestParameterException(paramName, "Expected integer value.", e);
        }
    }

    @Override
    public boolean getBoolean(String paramName) {
        String value = getString(paramName);
        if (value.equalsIgnoreCase("true"))
            return true;
        else if (value.equalsIgnoreCase("false"))
            return false;
        else
            throw new RequestParameterException(paramName, "Expected boolean value.");
    }
}
