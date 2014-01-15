package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel;

import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.OntoItem;

import java.util.Set;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 19:57
 *
 * Это объект с неполной информацией - отсутствуют обжект проперти
 */
public class SimpleOntoObject extends OntoItem {
    Set<ClassInfo> objClasses;
    Set<DataPropertyValue> dataProps = null;

    public SimpleOntoObject(String id) {
        super(id);
    }

    public Set<ClassInfo> getObjClass() {
        return objClasses;
    }

    public void setObjClass(Set<ClassInfo> objClass) {
        this.objClasses = objClass;
    }

    public Set<DataPropertyValue> getDataProps() {
        return dataProps;
    }

    public void setDataProps(Set<DataPropertyValue> dataProps) {
        this.dataProps = dataProps;
    }

}
