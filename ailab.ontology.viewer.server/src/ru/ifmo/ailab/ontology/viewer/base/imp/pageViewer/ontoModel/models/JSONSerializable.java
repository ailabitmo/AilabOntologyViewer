package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models;

import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 7:31
 */
public interface JSONSerializable {
    public abstract JsonValue serializeInJSON(IResponseCache cache);
}
