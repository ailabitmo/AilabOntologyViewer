package ru.ifmo.ailab.ontology.viewer.base.utils;

/**
 * Created with IntelliJ IDEA.
 * User: Kivan
 * Date: 15.03.13
 * Time: 4:05
 * To change this template use File | Settings | File Templates.
 *
 * %%% Нечто с абстрактным идентификатором
 */
public abstract class ItemWithId {
    /**
     * У наследника обязательно должен присутствовать конструктор без параметров
     */
    public ItemWithId() {
    }

    public abstract String getId();


    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ItemWithId that = (ItemWithId) o;

        if (getId().equals(that.getId())) return false;

        return true;
    }


    public int hashCode() {
        return getId().hashCode();
    }
}
