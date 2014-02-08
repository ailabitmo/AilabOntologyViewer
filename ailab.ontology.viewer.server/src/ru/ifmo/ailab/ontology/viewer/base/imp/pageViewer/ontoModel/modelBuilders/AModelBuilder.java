package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.DPOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.InstsPageView;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView.ObjPropsPageView;
import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.ifmo.ailab.ontology.viewer.base.utils.MainOntoCache;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:52
 * <p/>
 * %%% Абстрактный класс, отвечающий за формирование модели по онтологии.
 */
public abstract class AModelBuilder<OI extends PartialOntoItem> {

    protected AModelBuilder() {
    }

    public OI buildOntoItem(Object id, PagedViewerRequestAndContextModel requestInfo) {
        PartialOntoItem item = (PartialOntoItem) MainOntoCache.get(id.toString());
        try {
            if (item != null) {
                try {
                    Class classWhichCurrentBuilderShouldBuild = getClassOfBuildingModel();
                    boolean dataIsEnough = item.isDataEnoughForClass(classWhichCurrentBuilderShouldBuild);
                    //We try to check if onto item has equal or more information that we need,
                    if (dataIsEnough) return (OI) item;
                    else {
                        //If it have less info, then we have to build it anyway
                        List<Class> classes = item.pathToFillGap(classWhichCurrentBuilderShouldBuild);
                        classes.remove(0);//first is already built
                        PartialOntoItem poi = item;//Now trying to build path which is needed
                        for (Class aClass : classes) {
                            AModelBuilder amb = getModelBuilder(aClass);
                            poi = amb.createOntoItemFromSPARQLUsingPrevios(poi, requestInfo);
                        }

                        if (classWhichCurrentBuilderShouldBuild.equals(poi.getClass())) return (OI) poi;
                        else throw new Exception("WHAAAT!!!");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            OI ontoItem = null;
            ontoItem = createOntoItemFromSPARQL(id, requestInfo);
            MainOntoCache.add(id.toString(), ontoItem);
            return ontoItem;
        } catch (Exception e) {
            logger.error("Exception", e);
        }
        return null;
    }

    protected abstract OI createOntoItemFromSPARQL(Object id, PagedViewerRequestAndContextModel requestInfo);

    /**
     * Create item from sparql, using previous item with less info (only direct predecessor is possible!!!)
     */
    protected abstract OI createOntoItemFromSPARQLUsingPrevios(PartialOntoItem predecessor, PagedViewerRequestAndContextModel requestInfo);

    protected abstract Class getClassOfBuildingModel();

    protected LoggerWrapper logger = LoggerWrapper.getLogger(this.getClass());

    //STATIC-------------------
    private static HashMap<Class, Class> mapObjectsToBuilders = new HashMap<Class, Class>();
    private static ReadWriteLock rwl = new ReentrantReadWriteLock();

    private static void addObjectToBuilder(Class object, Class builder) {
        try {
            rwl.writeLock().lock();
            if (!mapObjectsToBuilders.containsKey(object))
                mapObjectsToBuilders.put(object, builder);
        } finally {
            rwl.writeLock().unlock();
        }
    }

    private static Class getBuilderForObject(Class object) {
        try {
            rwl.readLock().lock();
            Class toRet = mapObjectsToBuilders.get(object);
            return toRet;
        } finally {
            rwl.readLock().unlock();
        }
    }

    private static AModelBuilder getModelBuilder(Class cl) {
        Class obj = getBuilderForObject(cl);
        if (obj != null) {
            try {
                Constructor constr = obj.getConstructor();
                AModelBuilder modelBuilder = (AModelBuilder) constr.newInstance();
                return modelBuilder;
            } catch (Exception e) {
                e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            }
        }
        return null;
    }

    static {
        addObjectToBuilder(SimpleOntoObject.class, SimpleOntoObjectBuilder.class);
        addObjectToBuilder(DPOntoObject.class, DPOntoObjectBuilder.class);

        /*addObjectToBuilder(SimpleClassInfo.class, SimpleClassInfoBuilder.class);
        addObjectToBuilder(ClassInfo.class, ClassInfoBuilder.class);

        addObjectToBuilder(SimpleDataPropertyInfo.class, SimpleDataPropertyInfoBuilder.class);

        addObjectToBuilder(SimpleObjectPropertyInfo.class, SimpleObjectPropertyInfoBuilder.class);*/

        addObjectToBuilder(ObjPropsPageView.class, ObjPropsPageViewBuilder.class);

        addObjectToBuilder(InstsPageView.class, InstsPageViewBuilder.class);
    }

    public static PartialOntoItem setModelIfNeeded(Class classInfoClass, PartialOntoItem cli) {
        PartialOntoItem item = (PartialOntoItem) MainOntoCache.get(cli.getId());
        if (item == null || !item.isDataEnoughForClass(classInfoClass)) {
            MainOntoCache.add(cli.getId(), cli);
            return cli;
        } else return item;
    }

    public static Object buildPredecessor(PartialOntoItem item, PagedViewerRequestAndContextModel request, Object id) {
        List<Class> predecessors = item.getPredecessors();
        if (predecessors != null)
            return buildModel(predecessors.get(predecessors.size() - 1), request, id);
        else return null;
    }

    public static Object buildModel(Class cl, PagedViewerRequestAndContextModel request, Object id) {
        if (id != null) {
            AModelBuilder bld = getModelBuilder(cl);
            if (bld != null) return bld.buildOntoItem(id, request);
        }
        return null;
    }

    public static final String DEFAULT_PREFIX =
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                    "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n ";
}


