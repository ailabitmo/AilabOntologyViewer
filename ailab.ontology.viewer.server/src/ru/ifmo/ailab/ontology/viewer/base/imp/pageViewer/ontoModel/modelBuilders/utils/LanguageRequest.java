package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils;

import ru.spb.kpit.kivan.General.Strings.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 04.02.14
 * : 14:14
 */
public class LanguageRequest {
    String subject;
    String predicat;
    String object;
    String preferedName;
    String[] languages;
    private String languageSelector;

    public LanguageRequest(String first, String next, String nameForPrefered, TripletPart partIsLanguaged, String ... languages) {
        if (partIsLanguaged == TripletPart.SUBJECT) {
            this.subject = null;
            this.predicat = first;
            this.object = next;
        } else if (partIsLanguaged == TripletPart.PREDICAT) {
            this.subject = first;
            this.predicat = null;
            this.object = next;
        } else if (partIsLanguaged == TripletPart.OBJECT) {
            this.subject = first;
            this.predicat = next;
            this.object = null;
        }
        preferedName = nameForPrefered;
        this.languages = languages;
        languageSelector = generateLanguageSelector();
    }

    public String getLanguageSelector() {
        return languageSelector;
    }

    private String generateLanguageSelector() {
        /* Should look like this:
           optional {
               ?a rdfs:label ?labelRu2.
               filter( langMatches(lang(?labelRu2),"ru") )
           }
           optional {
               ?a rdfs:label ?labelEn2.
               filter( langMatches(lang(?labelEn2),"en") )
           }
           optional {
               ?a rdfs:label ?labelNOLABEL2.
               filter( langMatches(lang(?labelNOLABEL2),"") )
           }
           bind( coalesce( ?labelRu2, ?labelEn2, ?labelNOLABEL2) as ?labelPrefered2)
       */

        StringBuilder toRet = new StringBuilder("");
        List<String> generatedVariables = new ArrayList<String>();
        for (String language : languages) {
            String generatedVariableName = preferedName+"_l_"+language;
            String generatedRequest = generateRequest(generatedVariableName);
            generatedVariables.add(generatedVariableName);
            String requestPart = String.format("optional { %s filter( langMatches(lang(%s),\"%s\") )} \n",generatedRequest, generatedVariableName, language);
            toRet.append(requestPart);
        }
        String varialbesInRequest = StringUtils.gStrFrColEls(generatedVariables,",");
        toRet.append(String.format("bind( coalesce( %s ) as %s)\n",varialbesInRequest,preferedName));
        return toRet.toString();
    }

    private String generateRequest(String generatedVariableName) {
        if(subject==null) return String.format("%s %s %s.", generatedVariableName, predicat, object);
        if(predicat==null) return String.format("%s %s %s.", subject , generatedVariableName, object);
        if(object==null) return String.format("%s %s %s.", subject, predicat, generatedVariableName);
        return "";
    }


}
