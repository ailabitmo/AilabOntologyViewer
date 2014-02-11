package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView;

import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeq;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeqInf;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;

import java.util.ArrayList;
import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:06
 */
public class InstsPageView extends PageView {

    List<SimpleOntoObject> simpleOO = new ArrayList<SimpleOntoObject>();

    public List<SimpleOntoObject> getSimpleOO() {
        return simpleOO;
    }

    public void setSimpleOO(List<SimpleOntoObject> simpleOO) {
        this.simpleOO = simpleOO;
    }

    public InstsPageView(PagRequestToInstsOfObjProp req) {
        super(req.toString());
    }

    @Override
    protected PartSeq getInfoAboutPartialSequence() {
        return new PartSeq(new PartSeqInf("InstsPageView", getClass()));
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        JsonObject obj = new JsonObject();
        JsonArray toRet = new JsonArray();
        obj.put("pageNum", numOfPages);
        obj.put("values",toRet);
        for (SimpleOntoObject soo : simpleOO) toRet.add(soo.serializeInJSON(cache));
        return obj;
    }
}
