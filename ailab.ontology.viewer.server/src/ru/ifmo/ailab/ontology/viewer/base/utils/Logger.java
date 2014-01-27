package ru.ifmo.ailab.ontology.viewer.base.utils;


import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.spb.kpit.kivan.Logger_2_0.Logger_2_0;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 20:36
 *
 * %%% Логгер
 */
public class Logger {
    protected static Logger_2_0 l2o = new Logger_2_0(Logger_2_0.Level.debug,"D:\\TEMP\\logs");

    public static void debug(String message){
        Logger.l2o.debug(message);
    }
    public static void info(String message){
        Logger.l2o.info(message);
    }
    public static void error(String message){
        Logger.l2o.error(message);
    }
    public static void exception(Throwable exception){
        Logger.l2o.error(exception.getMessage()+"\r\n"+ StringUtils.gStrFrArrEls(exception.getStackTrace(), "\r\n"));
    }

}
