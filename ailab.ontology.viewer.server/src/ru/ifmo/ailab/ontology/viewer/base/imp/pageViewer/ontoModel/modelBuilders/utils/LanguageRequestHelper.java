package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils;

/**
 * IDEA
 * : Kivan
 * : 04.02.14
 * : 14:13
 */
public class LanguageRequestHelper {
    LanguageRequest[] requests;
    public LanguageRequestHelper(LanguageRequest ... requests) {
        this.requests = requests;
    }

    public String getLanguageSelectorRequestPart(){
        StringBuilder sb = new StringBuilder(" \n ");
        for (LanguageRequest request : requests) {
            sb.append(request.getLanguageSelector()).append(" \n ");
        }
        return sb.append(" \n ").toString();
    }
}
