package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView;

import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeq;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartSeqInf;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops.ParticularObjectProperty;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:06
 */
public class ObjPropsPageView extends PageView {

    List<ParticularObjectProperty> objProps;

    public List<ParticularObjectProperty> getObjProps() {
        return objProps;
    }

    public void setObjProps(List<ParticularObjectProperty> objProps) {
        this.objProps = objProps;
    }

    public ObjPropsPageView(PagRequestToObjPropsOfInst req) {
        super(req.toString());
    }

    @Override
    protected PartSeq getInfoAboutPartialSequence() {
        return new PartSeq(new PartSeqInf("ObjPropsPageView",getClass()));
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        JsonArray toRet = new JsonArray();
        for (ParticularObjectProperty objProp : objProps) {
            toRet.add(objProp.serializeInJSON(cache));
        }
        return toRet;
    }
}
