package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo;


import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeq;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeqInf;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;
import ru.ifmo.ailab.ontology.viewer.base.utils.JSON;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:45
 */
public class SimpleClassInfo extends PartialOntoItem {
    public SimpleClassInfo(String id) {
        super(id);
    }

    @Override
    protected PartSeq getInfoAboutPartialSequence() {
        return new PartSeq(
                new PartSeqInf("SimpleClassInfo", SimpleClassInfo.class),
                new PartSeqInf("ClassInfo", ClassInfo.class)
        );
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        cache.add(this);
        JsonObject obj = new JsonObject();
        obj.put("id", JSON.safeString(getId()));
        obj.put("label", JSON.safeString(getLabel()));
        return obj;
    }
}
