package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders;

import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.engine.http.QueryEngineHTTP;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequest;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.LanguageRequestHelper;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.TripletPart;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.PartialOntoItem;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops.DataPropertyValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.dataprops.SimpleDataPropertyInfo;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.DPOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.ontoObj.SimpleOntoObject;
import ru.ifmo.ailab.ontology.viewer.base.utils.MyQuerySolution;

import java.util.ArrayList;

/**
 * IDEA
 * : Kivan
 * : 03.02.14
 * : 17:40
 */
public class DPOntoObjectBuilder extends ANotStartSequenceModelBuilder<DPOntoObject> {




    @Override
    protected void fillOntoItemFromSparql(DPOntoObject toRet, PagedViewerRequestAndContextModel requestInfo) {
            /*
            select distinct ?dataProperty ?dpropertyValuePrefered ?dpLabel where {
               <http://dbpedia.org/resource/Russia> ?dataProperty _:aa.
               ?dataProperty a owl:DatatypeProperty.
               optional {
                   <http://dbpedia.org/resource/Russia> ?dataProperty ?dpropertyValueRu.
                   filter( langMatches(lang(?dpropertyValueRu),"ru") )
               }
               optional {
                   <http://dbpedia.org/resource/Russia> ?dataProperty ?dpropertyValueEn.
                   filter( langMatches(lang(?dpropertyValueEn),"en") )
               }
               optional {
                   <http://dbpedia.org/resource/Russia> ?dataProperty ?dpropertyValueNN.
                   filter( langMatches(lang(?dpropertyValueNN),"") )
               }
               bind( coalesce( ?dpropertyValueRu, ?dpropertyValueEn, ?dpropertyValueNN ) as ?dpropertyValuePrefered)

               optional {
                   ?dataProperty rdfs:label ?dpLabelRu.
                   filter( langMatches(lang(?dpLabelRu),"ru") )
               }
               optional {
                   ?dataProperty rdfs:label ?dpLabelEn.
                   filter( langMatches(lang(?dpLabelEn),"en") )
               }
               optional {
                   ?dataProperty rdfs:label ?dpLabelNO.
                   filter( langMatches(lang(?dpLabelNO),"") )
               }
               bind( coalesce( ?dpLabelRu, ?dpLabelEn, ?dpLabelNO) as ?dpLabel)
            } order by ?dpLabel

             */
        try{
            String id = toRet.getId();
            QueryEngineHTTP engine = null;
            ResultSet rs = null;
            String query = null;
            try {
                LanguageRequestHelper dataPropertyAndLabelValue = new LanguageRequestHelper(
                        new LanguageRequest("<" + id + ">","?dataProperty","?dpropertyValue", TripletPart.OBJECT,requestInfo.getPreferedLanguages()),
                        new LanguageRequest("?dataProperty","rdfs:label","?dpLabel", TripletPart.OBJECT,requestInfo.getPreferedLanguages())
                );

                //1. Selecting dataprperties from object
                query = DEFAULT_PREFIX +
                        "select distinct ?dataProperty ?dpropertyValue ?dpLabel where { " +

                        "   <" + id + "> ?dataProperty _:aa. " +
                        "MINUS {?dataProperty a owl:ObjectProperty.}"+
                        //"   ?dataProperty a owl:DatatypeProperty." +
                        dataPropertyAndLabelValue.getLanguageSelectorRequestPart()+
                        "} order by ?dpLabel";


                engine = requestInfo.getQueryEngine(query);
                rs = engine.execSelect();
                toRet.setDataProps(new ArrayList<DataPropertyValue>());
                while (rs.hasNext()) {
                    MyQuerySolution qs = new MyQuerySolution(rs.next());
                    String dpUri = qs.getStringValue("dataProperty");
                    String value = qs.getStringValue("dpropertyValue");
                    String label = qs.getStringValue("dpLabel");

                    SimpleDataPropertyInfo sdpI = new SimpleDataPropertyInfo(dpUri);
                    if(label!=null) sdpI.setLabel(label);
                    sdpI = (SimpleDataPropertyInfo) AModelBuilder.setModelIfNeeded(SimpleDataPropertyInfo.class, sdpI);
                    if(value!=null)
                        toRet.getDataProps().add(new DataPropertyValue(sdpI, value));
                    else
                        toRet.getDataProps().add(new DataPropertyValue(sdpI, "?"));
                }
            }catch (Exception e){
                logger.error(e);
            }
            finally {
                engine.close();
            }
        } catch (Exception e) {
            logger.error(e);
        }
    }

    @Override
    protected DPOntoObject clonePredecessorProperties(PartialOntoItem predecessor) {
        SimpleOntoObject truePredecessor = (SimpleOntoObject) predecessor;
        DPOntoObject toRet = new DPOntoObject(truePredecessor.getId());
        toRet.setObjClasses(truePredecessor.getObjClasses());
        toRet.setLabel(truePredecessor.getLabel());
        return toRet;
    }

    @Override
    protected Class getClassOfBuildingModel() {
        return DPOntoObject.class;
    }
}
