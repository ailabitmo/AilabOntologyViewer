package ru.ifmo.ailab.ontology.viewer.base.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * IDEA
 * : Kivan
 * : 30.01.14
 * : 8:39
 *
 * If you want more methods to be implemented - simply implement them :P
 */
public class LoggerWrapper {
    Logger logger;

    public LoggerWrapper(Logger logger) {
        this.logger = logger;
    }

    public static LoggerWrapper getLogger(Class forWhom) {
        return new LoggerWrapper(LoggerFactory.getLogger(forWhom));
    }

    public void error(String message, Exception e) {
        logger.error(message, e);
    }

    public void error(Exception e) {
        logger.error("", e);
    }

    public void error(String message) {
        logger.error(message);
    }

    public void debug(String message) {
        logger.debug(message);
    }

    public void info(String message) {
        logger.info(message);
    }

    public void trace(String s) {
        logger.trace(s);
    }

    public void warn(String s) {
        logger.warn(s);
    }
}
