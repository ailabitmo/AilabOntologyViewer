package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.ontoModel.models;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * IDEA
 * : Kivan
 * : 02.02.14
 * : 17:56
 *
 * Partial sequence is the data structure, where to the left is the most general item,
 * to the right is the most specific.
 */
public class PartSeq {
    List<PartSeqInf> PartialSequenceInf = new ArrayList<PartSeqInf>();

    public PartSeq(List<PartSeqInf> PartialSequenceInf) {
        this.PartialSequenceInf = PartialSequenceInf;
    }

    public PartSeq(PartSeqInf... PartialSequenceInf) {
        this.PartialSequenceInf = new ArrayList<PartSeqInf>(Arrays.asList(PartialSequenceInf));
    }

    public boolean leftHasMoreInfoThanRight(Class left, Class right){
        boolean foundRight = false;
        for (PartSeqInf partSeqInf : PartialSequenceInf) {
            if(partSeqInf.cls.equals(right)) foundRight = true;
            else if(partSeqInf.cls.equals(left)){
                if(foundRight) return true;
            }
        }
        return false;
    }

    /**
     * Generates path of classes, to get info, needed in right
     * @param left
     * @param right
     * @return
     */
    public List<Class> pathFromLeftToRight(Class left, Class right) {
        boolean adding = false;
        List<Class> clseq = new ArrayList<Class>();
        for (PartSeqInf partSeqInf : PartialSequenceInf) {
            if(partSeqInf.cls.equals(left)) adding = true;
            if(adding){
                clseq.add(partSeqInf.cls);
            }
            if(partSeqInf.cls.equals(right)) return clseq;
        }
        return clseq;
    }

    /**
     * All classes to the left to right class
     * @param right
     * @return
     */
    public List<Class> pathToTheLeftFrom(Class right) {
        List<Class> toRet = new ArrayList<Class>();
        for (PartSeqInf partSeqInf : PartialSequenceInf) {
            if(partSeqInf.cls.equals(right)) return toRet;
            else toRet.add(partSeqInf.cls);
        }
        return toRet;
    }

}
