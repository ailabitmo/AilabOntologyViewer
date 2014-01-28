package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

/**
 * IDEA
 * : Kivan
 * : 23.01.14
 * : 18:05
 */
public class PageableRequestToInst {
    //Идентификатор обжект проперти для которой должны выбираться инстансы
    String objPropId;
    PageInfoByPage pagePropsForInst;
    PageableRequestToObjProp objProp;

    public PageableRequestToInst(String objPropId, PageInfoByPage pagePropsForInst, PageableRequestToObjProp objProp) {
        this.objPropId = objPropId;
        this.pagePropsForInst = pagePropsForInst;
        this.objProp = objProp;
    }

    public String getObjPropId() {
        return objPropId;
    }

    public void setObjPropId(String objPropId) {
        this.objPropId = objPropId;
    }

    public PageInfoByPage getPagePropsForInst() {
        return pagePropsForInst;
    }

    public void setPagePropsForInst(PageInfoByPage pagePropsForInst) {
        this.pagePropsForInst = pagePropsForInst;
    }

    public PageableRequestToObjProp getObjProp() {
        return objProp;
    }

    public void setObjProp(PageableRequestToObjProp objProp) {
        this.objProp = objProp;
    }
}
