package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;

/**
 * IDEA
 * : Kivan
 * : 23.01.14
 * : 18:05
 */
public class PagRequestToInstsOfObjProp extends PagRequestToObjPropsOfInst {
    String objPropId;

    public PagRequestToInstsOfObjProp(String idOfInstance, String objPropId, Direction direction, PageInfoByPage pagePropsForInst) {
        super(idOfInstance, pagePropsForInst, direction);
        this.objPropId = objPropId;
    }

    public String getObjPropId() {
        return objPropId;
    }

    public void setObjPropId(String objPropId) {
        this.objPropId = objPropId;
    }

    @Override
    public String toString() {
        return String.format("%s_%s_%s_%s", idOfInstance,objPropId,direction.name(),pageProps.toString());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PagRequestToInstsOfObjProp that = (PagRequestToInstsOfObjProp) o;

        if (direction != that.direction) return false;
        if (idOfInstance != null ? !idOfInstance.equals(that.idOfInstance) : that.idOfInstance != null) return false;
        if (pageProps != null ? !pageProps.equals(that.pageProps) : that.pageProps != null) return false;
        if (objPropId != null ? !objPropId.equals(that.objPropId) : that.objPropId != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = idOfInstance != null ? idOfInstance.hashCode() : 0;
        result = 31 * result + (direction != null ? direction.hashCode() : 0);
        result = 31 * result + (pageProps != null ? pageProps.hashCode() : 0);
        result = 31 * result + (objPropId != null ? objPropId.hashCode() : 0);
        return result;
    }
}
