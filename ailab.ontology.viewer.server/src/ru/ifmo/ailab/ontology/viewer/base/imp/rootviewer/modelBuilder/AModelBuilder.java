package ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.modelBuilder;

import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.*;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.MainOntoCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.OntoItem;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ontoModel.utils.UtilStructures;
import ru.ifmo.ailab.ontology.viewer.base.utils.Logger;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:52
 *
 * %%% Абстрактный класс, отвечающий за формирование модели по онтологии.
 */
public abstract class AModelBuilder<OI extends OntoItem> {

    protected ViewerRequestAndContextModel requestInfo;

    protected AModelBuilder(ViewerRequestAndContextModel inputParams) {
        this.requestInfo = inputParams;
    }

    public OI buildOntoItem(String id) {
        Object item = MainOntoCache.get(id);
        try {
            if (item != null) {
                try {
                    OI oi = (OI) item;
                    addToUtilStructures(requestInfo.getUtilsAndCache(), oi);
                    return oi;
                } catch (Exception e) {
                }
            }
            OI ontoItem = null;
            ontoItem = createOntoItem(id);
            addToUtilStructures(requestInfo.getUtilsAndCache(), ontoItem);
            MainOntoCache.add(id, ontoItem);
            return ontoItem;
        } catch (Exception e) {
            Logger.exception(e);
        }
        return null;
    }

    protected abstract OI createOntoItem(String id);

    protected abstract void addToUtilStructures(UtilStructures us, OI item);

    public static Object buildModel(Class cl, ViewerRequestAndContextModel request, String id) {
        if (!StringUtils.emptyString(id)) {
            AModelBuilder bld = getModelBuilder(cl, request);
            return bld.buildOntoItem(id);
        }
        return null;
    }

    public static AModelBuilder getModelBuilder(Class cl, ViewerRequestAndContextModel request) {
        if (cl.equals(OntoObject.class)) return new OntoObjectBuilder(request);
        else if (cl.equals(SimpleOntoObject.class)) return new SimpleOntoObjectBuilder(request);
        else if (cl.equals(ClassInfo.class)) return new ClassInfoBuilder(request);
        else if (cl.equals(DataPropertyInfo.class)) return new DataPropertyInfoBuilder(request);
        else if (cl.equals(ObjectPropertyInfo.class)) return new ObjectPropertyInfoBuilder(request);
        return null;
    }
}


