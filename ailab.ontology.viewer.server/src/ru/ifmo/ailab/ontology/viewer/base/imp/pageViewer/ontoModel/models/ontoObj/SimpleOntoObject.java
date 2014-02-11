package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj;

import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeq;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeqInf;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo.SimpleClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.utils.JSON;

import java.util.HashSet;
import java.util.Set;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:00
 */
public class SimpleOntoObject extends PartialOntoItem {
    boolean error = false;
    Set<SimpleClassInfo> objClasses = new HashSet<SimpleClassInfo>();

    public SimpleOntoObject(String id) {
        super(id);
    }

    @Override
    protected PartSeq getInfoAboutPartialSequence() {
        return new PartSeq(
                new PartSeqInf("SimpleOntoObject", SimpleOntoObject.class),
                new PartSeqInf("DPOntoObject", DPOntoObject.class)
        );
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        JsonObject toRet = new JsonObject();
        toRet.put("id", JSON.safeString(getId()));
        toRet.put("label", JSON.safeString(getLabel()));
        toRet.put("error", (error)?1:0);
        JsonArray classes = JSON.safeArray("class", toRet);
        for (SimpleClassInfo objClass : objClasses) {
            cache.add(objClass);
            classes.add(JSON.safeString(objClass != null ? objClass.getId() : ""));
        }
        return toRet;
    }

    public Set<SimpleClassInfo> getObjClasses() {
        return objClasses;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public void setObjClasses(Set<SimpleClassInfo> objClasses) {
        this.objClasses = objClasses;
    }
}
