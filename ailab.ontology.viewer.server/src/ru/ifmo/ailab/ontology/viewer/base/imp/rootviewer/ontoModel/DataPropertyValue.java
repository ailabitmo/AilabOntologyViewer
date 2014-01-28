package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 19:54
 *
 * %%% Модель: информация о значении свойства данного
 */
public class DataPropertyValue {
    DataPropertyInfo dpInfo;
    String value;

    public DataPropertyValue(DataPropertyInfo dpInfo, String value) {
        this.dpInfo = dpInfo;
        this.value = value;
    }

    public DataPropertyInfo getDpInfo() {
        return dpInfo;
    }

    public void setDpInfo(DataPropertyInfo dpInfo) {
        this.dpInfo = dpInfo;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
