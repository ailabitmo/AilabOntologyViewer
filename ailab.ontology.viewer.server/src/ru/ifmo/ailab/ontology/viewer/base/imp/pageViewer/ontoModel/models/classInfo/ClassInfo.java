package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo;

import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.utils.JSON;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:37
 *
 * %%% Модель: информация о классе
 */
public class ClassInfo extends SimpleClassInfo {
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

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        cache.add(this);
        cache.add(parentClass);

        JsonObject obj = (JsonObject) super.serializeInJSON(cache);
        if(parentClass!=null) obj.put("parentClass", JSON.safeString(parentClass.getId()));
        return obj;
    }
}
