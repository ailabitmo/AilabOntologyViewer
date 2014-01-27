package ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer;

/**
 * IDEA
 * : Kivan
 * : 23.01.14
 * : 15:31
 */
public class PageInfoByPage {
    int currentOffset;
    int currentLimit;
    int currentPage;

    public PageInfoByPage(int pageNum, int currentLimit) {
        this.currentLimit = currentLimit;
        currentPage = pageNum;
        this.currentOffset = (pageNum-1)*currentLimit;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public int getCurrentOffset() {
        return currentOffset;
    }

    public int getCurrentLimit() {
        return currentLimit;
    }

    public void setCurrentOffset(int currentOffset) {
        this.currentOffset = currentOffset;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PageInfoByPage that = (PageInfoByPage) o;

        if (currentLimit != that.currentLimit) return false;
        if (currentOffset != that.currentOffset) return false;
        if (currentPage != that.currentPage) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = currentOffset;
        result = 31 * result + currentLimit;
        result = 31 * result + currentPage;
        return result;
    }
}
