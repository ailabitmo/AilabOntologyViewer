package ru.ifmo.ailab.ontology.viewer.base.utils;

import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonString;

/**
 * IDEA
 * : Kivan
 * : 05.02.14
 * : 18:36
 */
public class JSON {
    public static JsonString safeString(String val){
        if (val == null) return new JsonString("");
        else return new JsonString(val);
    }

    public static JsonArray safeArray(String arrName, JsonObject jsonObj){
        JsonArray arr = (JsonArray) jsonObj.get(arrName);
        if(arr==null){
            arr = new JsonArray();
            jsonObj.put(arrName,arr);
        }
        return arr;
    }
}
