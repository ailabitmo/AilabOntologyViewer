package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

import java.util.ArrayList;

/**
 * IDEA
 * : Kivan
 * : 23.01.14
 * : 15:10
 */
public class Sparql {

    /*
     * Example:
select distinct ?objProperty ?label where {
    ?a ?objProperty   <http://dbpedia.org/resource/United_States>.
    ?objProperty a owl:ObjectProperty.
    OPTIONAL{?objProperty rdfs:label ?label}
}

     select * where {
     {
     select (COUNT(distinct ?objProperty) AS ?count ) where {
     ?objPropertyVal ?objProperty  <http://dbpedia.org/resource/United_States>.
     ?objProperty a owl:ObjectProperty.
     }
     }
     UNION
     {
     select distinct ?objProperty where {
     ?a ?objProperty   <http://dbpedia.org/resource/United_States>.
     ?objProperty a owl:ObjectProperty.
     } limit 10 offset 120
     }
     }
     */

    public static String getObjectProperties(PageableRequestToObjProp requestInfo) {
        String request =
                "select * where {\n" +
                        "{\n" +
                        "  select (COUNT(distinct ?objProperty) AS ?count ) where {\n" +
                        ((requestInfo.getDirection()==Direction.IN)?"    ?a ?objProperty <" + requestInfo.getIdOfInstance() + ">.\n": "  <" + requestInfo.getIdOfInstance() + ">  ?objProperty ?a.\n")+
                        "   ?objProperty a owl:ObjectProperty.\n" +
                        "  }\n" +
                        "}\n" +
                        "UNION\n" +
                        "{\n" +
                        " select distinct ?objProperty where {\n" +
                        ((requestInfo.getDirection()==Direction.IN)?"    ?a ?objProperty <" + requestInfo.getIdOfInstance() + ">.\n": "  <" + requestInfo.getIdOfInstance() + ">  ?objProperty ?a.\n")+
                        "   ?objProperty a owl:ObjectProperty.\n" +
                        " } limit " + requestInfo.getPageProps().getCurrentLimit() + " offset " + requestInfo.getPageProps().getCurrentOffset() + "\n" +
                        "} \n" +
                        "}";
        return request;
    }

    /*
     * Это затяено для того, чтобы выбирать язык в ручном режиме, поскольку в случае с Langmatch тормозит спаркл
     select * where {
     {
     select distinct (<http://dbpedia.org/ontology/affiliation> as ?objProperty) ?label where {
     OPTIONAL{<http://dbpedia.org/ontology/affiliation> rdfs:label ?label.}
     }
     }
     UNION
     {
     select distinct (<http://dbpedia.org/ontology/almaMater> as ?objProperty) ?label where {
     OPTIONAL{<http://dbpedia.org/ontology/almaMater> rdfs:label ?label.}
     }
     }
     UNION
     {
     select distinct (<http://dbpedia.org/ontology/architect> as ?objProperty) ?label where {
     OPTIONAL{<http://dbpedia.org/ontology/architect> rdfs:label ?label.}
     }
     }
     UNION
     {
     select distinct (<http://dbpedia.org/ontology/assembly> as ?objProperty) ?label where {
     OPTIONAL{<http://dbpedia.org/ontology/assembly> rdfs:label ?label.}
     }
     }
     }
     */
    public static String getLabelsForItemsWithId(ArrayList<String> itemsWithIds) {
        StringBuilder sb = new StringBuilder();
        sb.append("select * where {\n");

        for (int i = 0; i < itemsWithIds.size(); i++) {
            String id = itemsWithIds.get(i);
            sb.append("{\n" +
                    " select distinct (<" + id + "> as ?objProperty) ?label where {\n" +
                    "   OPTIONAL{<"+id+"> rdfs:label ?label.}\n" +
                    "  }\n" +
                    "}\n ");
            if (i != itemsWithIds.size() - 1) {
                sb.append("\n UNION \n");
            }
        }

        sb.append("}");
        return sb.toString();
    }

    /*
      Example:
      select * where {
            {
             select distinct (COUNT(distinct ?opg) as ?count) where {
              ?opg <http://dbpedia.org/ontology/almaMater> <http://dbpedia.org/resource/United_States>.
             }
            }
            UNION
            {
             select distinct ?opg where {
              ?opg <http://dbpedia.org/ontology/almaMater> <http://dbpedia.org/resource/United_States>.
             } LIMIT 10 OFFSET 0
            }
        }
     */
    public static String getInstances(PageableRequestToInst requestInfo){
        String toRet = "select * where {\n" +
                "{\n" +
                " select distinct (COUNT(distinct ?opg) as ?count) where {\n" +
                ((requestInfo.getObjProp().getDirection()==Direction.IN)?"    ?opg <"+requestInfo.getObjPropId()+"> <" + requestInfo.getObjProp().getIdOfInstance() + ">.\n" : " <"+ requestInfo.getObjProp().getIdOfInstance()+"> <" +requestInfo.getObjPropId()+ ">  ?opg.\n")+
                "  ?opg <"+requestInfo.getObjPropId()+"> <"+requestInfo.getObjProp().getIdOfInstance()+">.\n" +
                " } \n" +
                "}\n" +
                "UNION\n" +
                "{\n" +
                " select distinct ?opg where {\n" +
                ((requestInfo.getObjProp().getDirection()==Direction.IN)?"    ?opg <"+requestInfo.getObjPropId()+"> <" + requestInfo.getObjProp().getIdOfInstance() + ">.\n" : " <"+ requestInfo.getObjProp().getIdOfInstance()+"> <" +requestInfo.getObjPropId()+ ">  ?opg.\n")+
                " } limit " + requestInfo.getPagePropsForInst().getCurrentLimit() + " offset " + requestInfo.getPagePropsForInst().getCurrentOffset() + "\n" +
                "}\n" +
                "}";
        return toRet;
    }

    public static void main(String[] args) {

    }

}
