package ru.ifmo.ailab.ontology.viewer.base.utils;

import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.rdf.model.RDFNode;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 22:49
 *
 * %%% Обертка к спаркловскому запросу
 */
public class MyQuerySolution {
    QuerySolution qs;

    public MyQuerySolution(QuerySolution qs) {
        this.qs = qs;
    }

    public String getStringValue(String resource) {
        if (qs == null) return null;

        String toRet = null;
        RDFNode node = qs.get(resource);
        if (node != null) {
            if (node.isResource()) toRet = node.asResource().getURI();
            else if (node.isLiteral()) toRet = node.asLiteral().getString();
        }
        return toRet;
    }
}
