package ru.ifmo.ailab.ontology.viewer.base.utils;

/**
 * IDEA
 * : Kivan
 * : 07.01.14
 * : 17:47
 *
 * %%% Экземпляр онтологического объекта (есть лейбл)
 */
public abstract class OntoItem extends ObjectWithId {
    private String label;

    public OntoItem(String id) {
        super(id);
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
