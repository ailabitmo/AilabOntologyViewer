package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models.pageView;

import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.modelBuilders.utils.Direction;

/**
 * IDEA
 * : Kivan
 * : 23.01.14
 * : 17:46
 */
public class PagRequestToObjPropsOfInst {
    //Идентификатор инстанса для которого выбираются обжект проперти
    protected String idOfInstance;
    //Direction of a link
    protected Direction direction;
    //Информация о странице, для которой выполняется запрос
    protected PageInfoByPage pageProps;


    public PagRequestToObjPropsOfInst(String idOfInstance, PageInfoByPage pageProps, Direction direction) {
        this.idOfInstance = idOfInstance;
        this.pageProps = pageProps;
        this.direction = direction;
    }

    public String getIdOfInstance() {
        return idOfInstance;
    }

    public void setIdOfInstance(String idOfInstance) {
        this.idOfInstance = idOfInstance;
    }

    public PageInfoByPage getPageProps() {
        return pageProps;
    }

    public void setPageProps(PageInfoByPage pageProps) {
        this.pageProps = pageProps;
    }

    public Direction getDirection() {
        return direction;
    }

    public void setDirection(Direction direction) {
        this.direction = direction;
    }

    @Override
    public String toString() {
       return String.format("%s_%s_%s", idOfInstance,direction.name(),pageProps.toString());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PagRequestToObjPropsOfInst that = (PagRequestToObjPropsOfInst) o;

        if (direction != that.direction) return false;
        if (idOfInstance != null ? !idOfInstance.equals(that.idOfInstance) : that.idOfInstance != null) return false;
        if (pageProps != null ? !pageProps.equals(that.pageProps) : that.pageProps != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = idOfInstance != null ? idOfInstance.hashCode() : 0;
        result = 31 * result + (direction != null ? direction.hashCode() : 0);
        result = 31 * result + (pageProps != null ? pageProps.hashCode() : 0);
        return result;
    }
}
