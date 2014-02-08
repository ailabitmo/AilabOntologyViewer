package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops;

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
 * : 07.01.14
 * : 17:40
 *
 * %%% Модель: информация о свойсте данных
 */
public class SimpleDataPropertyInfo extends PartialOntoItem {
    public SimpleDataPropertyInfo(String id) {
        super(id);
    }

    @Override
    protected PartSeq getInfoAboutPartialSequence() {
        return new PartSeq(new PartSeqInf("SimpleDataPropertyInfo",getClass()));
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        cache.add(this);

        JsonObject toRet = new JsonObject();
        toRet.put("id", JSON.safeString(getId()));
        toRet.put("label", JSON.safeString(getLabel()));
        return toRet;
    }
}
