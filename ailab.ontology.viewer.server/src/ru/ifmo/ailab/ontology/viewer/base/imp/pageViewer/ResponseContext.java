package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import org.apache.jena.atlas.json.JsonObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.JSONSerializable;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo.SimpleClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops.SimpleDataPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops.SimpleObjectPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

import java.util.HashMap;
import java.util.Map;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:57
 * <p/>
 * %%% Модель ответа для просмотровщика
 */
public class ResponseContext implements IResponseModel<ResponseContext, JSONSerializable>, IResponseCache {
    //----------------Classes, data properties and object properties which
    //----------------were used during request.
    Map<String, SimpleClassInfo> classesUsed = new HashMap<String, SimpleClassInfo>();
    Map<String, SimpleDataPropertyInfo> dataPropsUsed = new HashMap<String, SimpleDataPropertyInfo>();
    Map<String, SimpleObjectPropertyInfo> objectPropsUsed = new HashMap<String, SimpleObjectPropertyInfo>();
    //--------------------------------------------------------------------

    JSONSerializable finalObject;

    public void add(SimpleClassInfo simpleClassInfo) {
        SimpleClassInfo item = classesUsed.get(simpleClassInfo.getId());
        if (item == null || !simpleClassInfo.hasMoreInfoThan(item))
            classesUsed.put(simpleClassInfo.getId(), simpleClassInfo);
    }

    public void add(SimpleDataPropertyInfo simpleDataPropertyInfo) {
        SimpleDataPropertyInfo item = dataPropsUsed.get(simpleDataPropertyInfo.getId());
        if (item == null || !simpleDataPropertyInfo.hasMoreInfoThan(item))
            dataPropsUsed.put(simpleDataPropertyInfo.getId(), simpleDataPropertyInfo);
    }

    public void add(SimpleObjectPropertyInfo simpleObjectPropertyInfo) {
        SimpleObjectPropertyInfo item = objectPropsUsed.get(simpleObjectPropertyInfo.getId());
        if (item == null || !simpleObjectPropertyInfo.hasMoreInfoThan(item))
            objectPropsUsed.put(simpleObjectPropertyInfo.getId(), simpleObjectPropertyInfo);
    }

    @Override
    public String getResponseString() {
        JsonObject toRet = new JsonObject();

        JsonObject jclassesUsed = new JsonObject();
        for (SimpleClassInfo sci : classesUsed.values()) jclassesUsed.put(sci.getId(), sci.serializeInJSON(this));
        toRet.put("classes", jclassesUsed);

        JsonObject jDataPropsUsed = new JsonObject();
        for (SimpleDataPropertyInfo sdp : dataPropsUsed.values()) jDataPropsUsed.put(sdp.getId(), sdp.serializeInJSON(this));
        toRet.put("dataProps", jDataPropsUsed);

        JsonObject jObjPropsUsed = new JsonObject();
        for (SimpleObjectPropertyInfo opi : objectPropsUsed.values()) jObjPropsUsed.put(opi.getId(), opi.serializeInJSON(this));
        toRet.put("objProps", jObjPropsUsed);

        toRet.put("request", finalObject != null ? finalObject.serializeInJSON(this) : new JsonObject());
        return toRet.toString();
    }

    @Override
    public String getResponseStringDescription() {
        return "Response is an object which contains 4 objects: class, dataProps, object props infos and particular request result";
    }

    @Override
    public ResponseContext init(JSONSerializable a) {
        finalObject = a;
        return this;
    }
}
