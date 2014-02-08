package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 19:50
 *
 * %%% Модель: информация о значении свойства объекта
 */
public class ObjectPropertyValue{
    SimpleObjectPropertyInfo property;
    SimpleOntoObject otherObject;

    public ObjectPropertyValue(SimpleObjectPropertyInfo parentProperty, SimpleOntoObject value) {
        this.property = parentProperty;
        this.otherObject = value;
    }

    public SimpleObjectPropertyInfo getProperty() {
        return property;
    }

    public void setProperty(SimpleObjectPropertyInfo property) {
        this.property = property;
    }

    public SimpleOntoObject getOtherObject() {
        return otherObject;
    }

    public void setOtherObject(SimpleOntoObject otherObject) {
        this.otherObject = otherObject;
    }
}
