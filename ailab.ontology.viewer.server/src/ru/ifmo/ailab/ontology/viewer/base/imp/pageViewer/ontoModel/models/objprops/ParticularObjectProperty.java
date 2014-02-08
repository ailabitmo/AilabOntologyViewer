package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.objprops;

import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.IResponseCache;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.JSONSerializable;
import ru.ifmo.ailab.ontology.viewer.base.utils.JSON;

/**
 * IDEA
 * : Kivan
 * : 06.02.14
 * : 8:38
 */
public class ParticularObjectProperty implements JSONSerializable{
    SimpleObjectPropertyInfo property;
    Direction direction;

    public ParticularObjectProperty(SimpleObjectPropertyInfo property, Direction direction) {
        this.property = property;
        this.direction = direction;
    }

    public SimpleObjectPropertyInfo getProperty() {
        return property;
    }

    public void setProperty(SimpleObjectPropertyInfo property) {
        this.property = property;
    }

    public Direction getDirection() {
        return direction;
    }

    public void setDirection(Direction direction) {
        this.direction = direction;
    }

    @Override
    public JsonValue serializeInJSON(IResponseCache cache) {
        cache.add(property);

        JsonObject jsob = new JsonObject();
        jsob.put("objPropId", JSON.safeString(property.getId()));
        jsob.put("direction",JSON.safeString(direction.name()));
        return jsob;
    }
}
