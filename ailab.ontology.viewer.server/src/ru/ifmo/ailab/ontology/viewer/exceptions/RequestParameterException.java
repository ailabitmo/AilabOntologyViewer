package ru.ifmo.ailab.ontology.viewer.exceptions;

public class RequestParameterException extends ProcessingException {
    private String paramName;

    public RequestParameterException(String paramName, String message) {
        this(paramName, message, null);
    }

    public RequestParameterException(String paramName, String message, Throwable t) {
        super(String.format("Invalid request parameter \"%s\": %s", paramName, message), t);
        this.paramName = paramName;
    }

    public String getParamName() {
        return paramName;
    }
}
