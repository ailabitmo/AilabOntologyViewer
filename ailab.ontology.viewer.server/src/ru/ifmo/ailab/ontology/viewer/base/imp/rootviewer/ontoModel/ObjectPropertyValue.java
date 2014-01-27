package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 19:50
 *
 * %%% Модель: информация о значении свойства объекта
 */
public class ObjectPropertyValue{
    ObjectPropertyInfo property;
    SimpleOntoObject otherObject;

    public ObjectPropertyValue(ObjectPropertyInfo parentProperty, SimpleOntoObject value) {
        this.property = parentProperty;
        this.otherObject = value;
    }

    public ObjectPropertyInfo getProperty() {
        return property;
    }

    public void setProperty(ObjectPropertyInfo property) {
        this.property = property;
    }

    public SimpleOntoObject getOtherObject() {
        return otherObject;
    }

    public void setOtherObject(SimpleOntoObject otherObject) {
        this.otherObject = otherObject;
    }
}
