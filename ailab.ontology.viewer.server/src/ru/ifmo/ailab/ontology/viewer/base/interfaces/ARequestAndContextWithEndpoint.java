package ru.ifmo.ailab.ontology.viewer.base.interfaces;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 13:13
 *
 * %%% Общая модель запроса
 */
public abstract class ARequestAndContextWithEndpoint<REQ extends IRequestAndContextModel> implements IRequestAndContextModel {

    private String endpoint;
    private String login;
    private String password;

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
