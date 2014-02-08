package ru.ifmo.ailab.ontology.viewer.base.utils.smartrequest;

import ru.spb.kpit.kivan.General.DataStructures.AutoPurgingCache;
import ru.spb.kpit.kivan.General.Time.TimeProvider;

import java.util.Date;
import java.util.concurrent.locks.ReentrantLock;

/**
 * IDEA
 * : Kivan
 * : 29.01.14
 * : 19:36
 */
public class SmartRequestPool {

    ReentrantLock lock = new ReentrantLock();
    AutoPurgingCache requests = new AutoPurgingCache(new TimeProvider() {
        public Date getCurrentDate() {
            return new Date();
        }
    }, 2500, 10000, 60 * 1000);

    public String processRequest(SmartRequest request) {
        if (request != null && request.guidId != null) {
            try {
                lock.lock();
                SmartRequest fromPool = (SmartRequest) requests.get(request.guidId);
                if (fromPool == null) {
                    request.startRequest();
                    requests.add(request.guidId, request);
                    fromPool = request;
                }
                if (SmartRequest.cancelPrefix.equals(request.paramString)) fromPool.cancel();

                return fromPool.getCurrentInfo(request.messageId);
            } catch (Exception e) {
                return SmartRequestState.ERROR.stateCode + e.getMessage() + ":" + e.getStackTrace()[0].toString();
            } finally {
                lock.unlock();
            }
        }
        return SmartRequestState.ERROR.stateCode + "Bad request";
    }

}
