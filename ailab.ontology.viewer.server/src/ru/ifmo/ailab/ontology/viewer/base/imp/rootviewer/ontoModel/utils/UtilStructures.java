package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils;

import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonString;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.*;

import java.util.Set;


/**
 * IDEA
 * : Kivan
 * : 08.01.14
 * : 12:28
 * %%% Вспомогательные структуры для генерации JSON ответа клиенту.
 */
public class UtilStructures {

    JsonObject filledClasses;
    JsonObject filledDataProps;
    JsonObject filledObjectProps;
    JsonObject filledObjects;

    public UtilStructures() {
        filledClasses = new JsonObject();
        filledDataProps = new JsonObject();
        filledObjectProps = new JsonObject();
        filledObjects = new JsonObject();
    }

    public void addClassesInfo(Set<ClassInfo> cic) {
        if (cic != null)
            for (ClassInfo ci : cic) {
                addClassInfo(ci);
            }
    }

    public void addClassInfo(ClassInfo ci) {
        if (ci != null && !filledClasses.hasKey(ci.getId())) {
            JsonObject obj = new JsonObject();
            obj.put("id", getJsonString(ci.getId()));
            obj.put("label", getJsonString(ci.getLabel()));
            obj.put("parent", getJsonString((ci.getParentClass() != null) ? ci.getParentClass().getId() : ""));
            addClassInfo(ci.getParentClass());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца

            filledClasses.put(ci.getId(), obj);
        }
    }

    public void addDataPropertyInfo(DataPropertyInfo dpi) {
        if (dpi != null && !filledDataProps.hasKey(dpi.getId())) {
            JsonObject obj = new JsonObject();
            obj.put("id", getJsonString(dpi.getId()));
            obj.put("label", getJsonString(dpi.getLabel()));
            filledDataProps.put(dpi.getId(), obj);
        }
    }

    public void addObjPropertyInfo(ObjectPropertyInfo opi) {
        if (opi != null && !filledObjectProps.hasKey(opi.getId())) {
            JsonObject obj = new JsonObject();
            obj.put("id", getJsonString(opi.getId()));
            obj.put("label", getJsonString(opi.getLabel()));
            filledObjectProps.put(opi.getId(), obj);
        }
    }

    public void addObject(SimpleOntoObject soo) {
        if (soo != null /*&& !filledObjects.hasKey(soo.getId()) &&*/) {//todo !!!!!!!!!!!!!!!!!!!!! ПЕРЕДЕЛАТЬ! Необходимо, чтобы объекты формировались по результату, а не в процессе получения Иначе тут бага
            JsonObject obj = new JsonObject();
            obj.put("id", getJsonString(soo.getId()));
            obj.put("label", getJsonString(soo.getLabel()));
            for (ClassInfo classInfo : soo.getObjClass()) {
                JsonArray arr = (JsonArray) obj.get("class");
                if(arr==null){
                    arr = new JsonArray();
                    obj.put("class",arr);
                }
                arr.add(getJsonString(classInfo != null ? classInfo.getId() : ""));
            }
            addClassesInfo(soo.getObjClass());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца

            JsonObject dataProps = new JsonObject();
            obj.put("dataProps", dataProps);
            for (DataPropertyValue dpv : soo.getDataProps()) {
                JsonObject opp = new JsonObject();
                dataProps.put(dpv.getDpInfo() != null ? dpv.getDpInfo().getId() : "", opp);
                opp.put("id", dpv.getDpInfo() != null ? dpv.getDpInfo().getId() : "");
                addDataPropertyInfo(dpv.getDpInfo());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца
                opp.put("val", dpv.getValue());
            }

            if (soo.getClass().equals(OntoObject.class)) {
                OntoObject sooo = (OntoObject) soo;
                JsonObject inObjProps = new JsonObject();
                obj.put("inObjProps", inObjProps);
                for (ObjectPropertyValue opv : sooo.getInObjectProperties()) {
                    JsonArray arrayOfVlas = (JsonArray) inObjProps.get(opv.getProperty().getId());
                    addObjPropertyInfo(opv.getProperty());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца
                    if (arrayOfVlas == null) {
                        arrayOfVlas = new JsonArray();
                        inObjProps.put(opv.getProperty().getId(), arrayOfVlas);
                    }
                    arrayOfVlas.add(opv.getOtherObject() != null ? opv.getOtherObject().getId() : "");
                    addObject(opv.getOtherObject());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца
                }

                JsonObject outObjProps = new JsonObject();
                obj.put("outObjProps", outObjProps);
                for (ObjectPropertyValue opv : sooo.getOutObjectProperties()) {

                    JsonArray arrayOfVlas = (JsonArray) outObjProps.get(opv.getProperty().getId());
                    addObjPropertyInfo(opv.getProperty());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца
                    if (arrayOfVlas == null) {
                        arrayOfVlas = new JsonArray();
                        outObjProps.put(opv.getProperty().getId(), arrayOfVlas);
                    }
                    arrayOfVlas.add(opv.getOtherObject() != null ? opv.getOtherObject().getId() : "");
                    addObject(opv.getOtherObject());// todo Это обязательно надо делать для связанных объектов иначе будет кэшироваться не до конца
                }
            }

            filledObjects.put(soo.getId(), obj);
        }
    }

    public JsonString getJsonString(String val) {
        if (val == null) return new JsonString("");
        else return new JsonString(val);
    }

    public JsonObject getFilledClasses() {
        return filledClasses;
    }

    public JsonObject getFilledDataProps() {
        return filledDataProps;
    }

    public JsonObject getFilledObjectProps() {
        return filledObjectProps;
    }

    public JsonObject getFilledObjects() {
        return filledObjects;
    }
}
