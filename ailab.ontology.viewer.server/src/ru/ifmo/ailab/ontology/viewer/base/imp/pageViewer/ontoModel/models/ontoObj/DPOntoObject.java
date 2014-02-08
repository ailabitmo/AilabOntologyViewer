package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj;

import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops.DataPropertyValue;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:01
 */
public class DPOntoObject extends SimpleOntoObject {
    List<DataPropertyValue> dataProps = null;
    public DPOntoObject(String id) {
        super(id);
    }

    public List<DataPropertyValue> getDataProps() {
        return dataProps;
    }

    public void setDataProps(List<DataPropertyValue> dataProps) {
        this.dataProps = dataProps;
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        JsonObject obj = (JsonObject) super.serializeInJSON(cache);
        JsonArray dataPropz = new JsonArray();
        obj.put("dataProps", dataPropz);
        for (DataPropertyValue dpv :dataProps) {
            dataPropz.add(dpv.serializeInJSON(cache));
        }
        return obj;
    }
}
