package ru.ifmo.ailab.ontology.viewer.base.utils.smartrequest;

/**
 * IDEA
 * : Kivan
 * : 29.01.14
 * : 19:13
 */
public enum SmartRequestState {
    WAIT("!w#"),
    FINISHED("!f#"),
    ERROR("!e#");

    public String stateCode;

    private SmartRequestState(String stateCode) {
        this.stateCode = stateCode;
    }
}
