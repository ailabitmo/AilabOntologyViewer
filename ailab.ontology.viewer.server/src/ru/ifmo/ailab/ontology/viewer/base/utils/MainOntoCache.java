package ru.ifmo.ailab.ontology.viewer.base.utils;

import ru.spb.kpit.kivan.General.DataStructures.AutoPurgingCache;
import ru.spb.kpit.kivan.General.Time.Ms;
import ru.spb.kpit.kivan.General.Time.TimeProvider;

import java.util.Date;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:00
 *
 * %%% Основной кэш, в котором хранится информация
 */
public class MainOntoCache {
    static AutoPurgingCache apc = new AutoPurgingCache(new TimeProvider() {
        public Date getCurrentDate() {
            return new Date();
        }
    }, 100000,200000, Ms.FromMin(10));

    public static Object get(String id) {
        return apc.get(id);
    }

    public static void add(String id, Object obj) {
        apc.add(id, obj);
    }

    public static void remove(String element) {
        apc.remove(element);
    }
}
