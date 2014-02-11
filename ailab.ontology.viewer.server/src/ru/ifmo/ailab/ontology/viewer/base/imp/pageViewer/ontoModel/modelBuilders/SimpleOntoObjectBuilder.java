package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequestHelper;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.TripletPart;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.classInfo.SimpleClassInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

import java.util.HashSet;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 16:31
 */
public class SimpleOntoObjectBuilder extends AStartSequenceModelBuilder<SimpleOntoObject> {

    private LoggerWrapper logger = LoggerWrapper.getLogger(this.getClass());

    /*
    Пример:
        select distinct ( <http://dbpedia.org/resource/Russia> as ?id) ?labelPrefered ?class ?classLabelPrefered where {
           optional {
               <http://dbpedia.org/resource/Russia> rdfs:label ?labelRu.
               filter( langMatches(lang(?labelRu),"ru") )
           }
           optional {
               <http://dbpedia.org/resource/Russia> rdfs:label ?labelEn.
               filter( langMatches(lang(?labelEn),"en") )
           }
           optional {
               <http://dbpedia.org/resource/Russia> rdfs:label ?labelNOLABEL.
               filter( langMatches(lang(?labelNOLABEL),"") )
           }
           bind( coalesce( ?labelRu, ?labelEn, ?labelNOLABEL) as ?labelPrefered)

           optional {
               <http://dbpedia.org/resource/Russia> rdf:type ?class.
               optional {
                   ?class rdfs:label ?classLabelRu.
                   filter( langMatches(lang(?classLabelRu),"ru") )
               }

               optional {
                   ?class rdfs:label ?classLabelEn.
                   filter( langMatches(lang(?classLabelEn),"en") )
               }

               optional {
                   ?class rdfs:label ?classLabelNoLabel.
                   filter( langMatches(lang(?classLabelNoLabel),"") )
               }
               bind( coalesce( ?classLabelRu, ?classLabelEn, ?classLabelNoLabel) as ?classLabelPrefered)
           }
        }
    }*/

    @Override
    protected SimpleOntoObject createOntoItemFromSPARQL(Object id, PagedViewerRequestAndContextModel context) {
        QueryEngineHTTP engine = null;
        String query = null;
        SimpleOntoObject toRet = null;
        try {
            context.waitMessage("Querying SPARQL...");
            toRet = new SimpleOntoObject(id.toString());
            //1. Label and class (with class label) are selected
            LanguageRequestHelper labelHelper = new LanguageRequestHelper(
                    new LanguageRequest("<"+id+">","rdfs:label","?labelPrefered", TripletPart.OBJECT,context.getPreferedLanguages())
            );

            LanguageRequestHelper classLabelHelper = new LanguageRequestHelper(
                    new LanguageRequest("?class","rdfs:label","?classLabelPrefered", TripletPart.OBJECT,context.getPreferedLanguages())
            );

            query = DEFAULT_PREFIX +
                    "select distinct (<" + id + "> as ?id) ?labelPrefered ?class ?classLabelPrefered where {" +
                    labelHelper.getLanguageSelectorRequestPart()+
                    "   OPTIONAL {" +
                    "       <" + id + "> rdf:type ?class." +
                    classLabelHelper.getLanguageSelectorRequestPart()+
                    "   } " +
                    "}";
            engine = context.getQueryEngine(query);
            ResultSet rs = engine.execSelect();
            toRet.setObjClasses(new HashSet<SimpleClassInfo>());
            while (rs.hasNext()) {
                MyQuerySolution qs = new MyQuerySolution(rs.next());
                String label = qs.getStringValue("labelPrefered");
                if (label != null) toRet.setLabel(label);

                String cls = qs.getStringValue("class");
                if (cls != null) {
                    SimpleClassInfo cli = new SimpleClassInfo(cls);
                    String clsLbl = qs.getStringValue("classLabelPrefered");
                    if (clsLbl != null) cli.setLabel(clsLbl);
                    toRet.getObjClasses().add((SimpleClassInfo) AModelBuilder.setModelIfNeeded(SimpleClassInfo.class, cli));
                }
            }
            context.waitMessage("Preparing data...");
            return toRet;

        }catch (Exception e){
            logger.error("Exception",e);
            if(id!=null && id.toString()!=null){//In this case id is bad for sparql, we will show it
                toRet = new SimpleOntoObject(id.toString());
                toRet.setError(true);
            }
        }
        finally {
            engine.close();
        }
        return toRet;
    }

    @Override
    protected Class getClassOfBuildingModel() {
        return SimpleOntoObject.class;
    }
}
