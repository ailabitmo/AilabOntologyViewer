package ru.ifmo.ailab.ontology.viewer.base.utils.smartrequest;

/**
 * IDEA
 * : Kivan
 * : 05.02.14
 * : 18:06
 */
public interface InfoMessagingProvider {
    public void errorOccured(Exception e);

    public void errorOccured(String errorString);

    public void waitMessage(String waitMessage);

    public void finishedMessage(String finishedMessage);
}
