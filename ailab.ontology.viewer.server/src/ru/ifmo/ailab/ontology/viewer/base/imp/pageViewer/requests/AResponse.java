package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.requests;

import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;

/**
 * IDEA
 * : Kivan
 * : 05.02.14
 * : 14:54
 */
public abstract class AResponse {
    public abstract JsonValue getResponseAsJson(IResponseCache cache);
}
