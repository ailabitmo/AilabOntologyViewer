package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops;

import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.JSONSerializable;
import ru.ifmo.ailab.ontology.viewer.base.utils.JSON;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 19:54
 *
 * %%% Модель: информация о значении свойства данного
 */
public class DataPropertyValue implements JSONSerializable{
    SimpleDataPropertyInfo dpInfo;
    String value;

    public DataPropertyValue(SimpleDataPropertyInfo dpInfo, String value) {
        this.dpInfo = dpInfo;
        this.value = value;
    }

    public SimpleDataPropertyInfo getDpInfo() {
        return dpInfo;
    }

    public void setDpInfo(SimpleDataPropertyInfo dpInfo) {
        this.dpInfo = dpInfo;
    }

    public String getValue() {
        if(value==null) return "";
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        cache.add(dpInfo);

        JsonObject opp = new JsonObject();
        opp.put("id", dpInfo != null ? dpInfo.getId() : "");
        opp.put("val", JSON.safeString(value));
        return opp;
    }
}
