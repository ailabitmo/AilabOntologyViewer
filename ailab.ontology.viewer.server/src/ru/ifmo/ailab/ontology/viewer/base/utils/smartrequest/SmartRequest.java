package ru.ifmo.ailab.ontology.viewer.base.utils.smartrequest;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * IDEA
 * : Kivan
 * : 29.01.14
 * : 18:53
 */
public abstract class SmartRequest implements InfoMessagingProvider {
    final static String guidPrefix = "$@#$";
    final static String cancelPrefix = "$!c#";
    final static ExecutorService pool = Executors.newCachedThreadPool();

    public final static void stopAllThreads() {
        pool.shutdownNow();
    }

    protected String guidId;
    protected int messageId = -1;
    protected String paramString;
    Future f = null;

    //Null here is a sign, that request was not started yet
    private SmartRequestState state = null;
    private String messageForState = "";
    private ReadWriteLock rwl = new ReentrantReadWriteLock();

    public SmartRequest(String requestString) {
        try {
            this.guidId = requestString.substring(requestString.indexOf(guidPrefix) + guidPrefix.length(), requestString.lastIndexOf(guidPrefix));
            this.messageId = Integer.parseInt(requestString.substring(requestString.lastIndexOf(guidPrefix) + guidPrefix.length()));
            this.paramString = requestString.substring(0, requestString.indexOf(guidPrefix));
        } catch (Exception e) {
            errorOccured(e.getMessage() + ":" + e.getStackTrace()[0].toString());
        }
    }

    protected abstract void processRequest();

    public void errorOccured(String errorString) {
        try {
            rwl.writeLock().lock();
            if (state != SmartRequestState.ERROR && state != SmartRequestState.FINISHED) {
                state = SmartRequestState.ERROR;
                messageForState = errorString;
            }
        } finally {
            rwl.writeLock().unlock();
        }
    }

    public void errorOccured(Exception e) {
        errorOccured(e.getMessage()+" "+e.getStackTrace()[0]);
    }

    public void waitMessage(String waitMessage) {
        try {
            rwl.writeLock().lock();
            if (state != SmartRequestState.ERROR && state != SmartRequestState.FINISHED) {
                state = SmartRequestState.WAIT;
                messageForState = waitMessage;
            }
        } finally {
            rwl.writeLock().unlock();
        }
    }

    public void finishedMessage(String finishedMessage) {
        try {
            rwl.writeLock().lock();
            if (state != SmartRequestState.ERROR && state != SmartRequestState.FINISHED) {
                state = SmartRequestState.FINISHED;
                messageForState = finishedMessage;
            }
        } finally {
            rwl.writeLock().unlock();
        }
    }

    public SmartRequestState getCurrentState() {
        try {
            rwl.readLock().lock();
            return state;
        } finally {
            rwl.readLock().unlock();
        }
    }

    public String getCurrentInfo(int messageId) {
        try {
            rwl.readLock().lock();
            if (messageId >= this.messageId) {
                this.messageId = messageId;
                return state.stateCode + messageForState;
            }
        } finally {
            rwl.readLock().unlock();
        }
        return "";
    }

    public void startRequest() {
        if (state == null) {
            if (cancelPrefix.equals(paramString)) errorOccured("Cancelled");
            else {
                waitMessage("Server received request");
                f = pool.submit(new Runnable() {
                    public void run() {
                        processRequest();
                    }
                });
            }
        }
    }

    public void cancel() {
        errorOccured("Cancelled");
        f.cancel(true);
    }

    /**
     * Is it possible to continue while waiting
     *
     * @return
     */
    public boolean canContinue() {
        try {
            rwl.readLock().lock();
            if (state == SmartRequestState.WAIT) return true;
        } finally {
            rwl.readLock().unlock();
        }
        return false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SmartRequest that = (SmartRequest) o;

        if (guidId != null ? !guidId.equals(that.guidId) : that.guidId != null) return false;

        return true;
    }

    int guidHashCache = Integer.MIN_VALUE;

    public int hashCode() {
        if (guidHashCache == Integer.MIN_VALUE)
            guidHashCache = guidId != null ? guidId.hashCode() : 0;
        return guidHashCache;
    }
}
