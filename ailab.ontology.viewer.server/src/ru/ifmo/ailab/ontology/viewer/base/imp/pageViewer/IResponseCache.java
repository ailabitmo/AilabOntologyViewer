package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo.SimpleClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops.SimpleDataPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops.SimpleObjectPropertyInfo;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 8:42
 */
public interface IResponseCache {
    void add(SimpleClassInfo simpleClassInfo);

    void add(SimpleDataPropertyInfo simpleDataPropertyInfo);

    void add(SimpleObjectPropertyInfo simpleObjectPropertyInfo);
}
