package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models;

import org.apache.jena.atlas.json.JsonObject;
import ru.ifmo.ailab.ontology.viewer.base.utils.OntoItem;

import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 17:52
 *
 * This is partial ontological item. It means it could be selected as a part first,
 * then with it's sublcasses more info could be added. To work there have to be strict
 * inheritance sequence (not a tree, just sequence). First element in this sequence is a successor of PartialOntoItem
 *  then more properties could be added and partially selected when needed in subclasses. Important thing for caching:
 *  when you have an item in cache with the same id, there could be 2 possibilities: either the class is the same
 *  or the class is more specific. In latter case - we change object in cache.
 */
public abstract class PartialOntoItem extends OntoItem implements JSONSerializable{
    PartSeq pse;
    public PartialOntoItem(String id) {
        super(id);
        pse = getInfoAboutPartialSequence();
    }

    protected abstract PartSeq getInfoAboutPartialSequence();

    public boolean isDataEnoughForClass(Class classToCheck) {
        if(this.getClass().equals(classToCheck)) return true;
        return pse.leftHasMoreInfoThanRight(this.getClass(),classToCheck);
    }

    /**
     * Class sequence between left and right in inheritance hierarchy (including left and right!!!)
     * @param classToCheck
     * @return
     */
    public List<Class> pathToFillGap(Class classToCheck){
        return pse.pathFromLeftToRight(this.getClass(), classToCheck);
    }

    public boolean hasMoreInfoThan(PartialOntoItem item){
        return pse.leftHasMoreInfoThanRight(getClass(), item.getClass());
    }

    public List<Class> getPredecessors(){
        return pse.pathToTheLeftFrom(this.getClass());
    }
}
