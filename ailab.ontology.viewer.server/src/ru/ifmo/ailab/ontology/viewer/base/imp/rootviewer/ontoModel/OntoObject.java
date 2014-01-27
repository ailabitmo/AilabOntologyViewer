package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel;

import java.util.Set;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:36
 *
 * %%% Модель: онтологический объект
 */
public class OntoObject extends SimpleOntoObject {
    Set<ObjectPropertyValue> inObjectProperties = null;
    Set<ObjectPropertyValue> outObjectProperties = null;

    public OntoObject(String id) {
        super(id);
    }

    public Set<ObjectPropertyValue> getInObjectProperties() {
        return inObjectProperties;
    }

    public void setInObjectProperties(Set<ObjectPropertyValue> inObjectProperties) {
        this.inObjectProperties = inObjectProperties;
    }

    public Set<ObjectPropertyValue> getOutObjectProperties() {
        return outObjectProperties;
    }

    public void setOutObjectProperties(Set<ObjectPropertyValue> outObjectProperties) {
        this.outObjectProperties = outObjectProperties;
    }
}
