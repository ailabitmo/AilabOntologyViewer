package ru.ifmo.ailab.ontology.viewer.base.utils;


/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:38
 *
 * %%% Нечто с идентификатором строкой
 */
public class ObjectWithId extends ItemWithId {
    String id;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ObjectWithId(String id) {
        this.id = id;
    }
}
