package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel;

import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.OntoItem;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:37
 *
 * %%% Модель: информация о классе
 */
public class ClassInfo extends OntoItem {
    ClassInfo parentClass;

    public ClassInfo(String id) {
        super(id);
    }

    public ClassInfo getParentClass() {
        return parentClass;
    }

    public void setParentClass(ClassInfo parentClass) {
        this.parentClass = parentClass;
    }
}
