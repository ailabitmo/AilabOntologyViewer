package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer;

import org.apache.jena.atlas.json.JsonObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 14:57
 *
 * %%% Модель ответа для просмотровщика
 */
public class ViewerResponseModel implements IResponseModel<ViewerResponseModel,UtilStructures> {

    UtilStructures toRet;

    public String getResponseString() {
        if(toRet==null) return "";
        else {
            JsonObject jso = new JsonObject();
            jso.put("classes", toRet.getFilledClasses());
            jso.put("dataProps", toRet.getFilledDataProps());
            jso.put("objProps", toRet.getFilledObjectProps());
            jso.put("objects", toRet.getFilledObjects());
            return jso.toString();
        }
    }

    public String getResponseStringDescription() {
        return "Модель в JSON, которая требуется редактору для построения картинки";
    }

    public ViewerResponseModel init(UtilStructures a) {
        this.toRet = (UtilStructures) a;
        return this;
    }
}