package ru.ifmo.ailab.ontology.viewer.servlets;

import ru.ifmo.ailab.ontology.viewer.base.interfaces.IRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;
import ru.spb.kpit.kivan.Networking.smartrequest.SmartRequest;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public abstract class BaseServlet<TRequest extends IRequestAndContextModel, TResponse extends IResponseModel> extends HttpServlet {
    /**
     * Из параметров запроса формируется модель запроса,
     * которая потом поступает в процессор.
     */
    protected abstract TRequest getRequestModel(IRequestParams params);

    protected abstract TResponse processRequest(TRequest request);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        process(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        process(req, resp);
    }

    @Override
    public void destroy() {
        SmartRequest.stopAllThreads();
    }

    private void process(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        resp.setContentType("text/html");
        resp.setCharacterEncoding("utf-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        Map<String, String[]> requestParams = new HashMap<String, String[]>();

        Enumeration<String> parameterNames = req.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            requestParams.put(paramName, req.getParameterValues(paramName));
        }

        Logger.getLogger(getClass().getName()).log(Level.INFO, "Request: " + prettyPrintParams(requestParams));

        try {
            TRequest requestModel = getRequestModel(new MapRequestParams(requestParams));
            TResponse responseModel = processRequest(requestModel);
            String responseText = responseModel.getResponseString();
            Logger.getLogger(getClass().getName()).log(Level.INFO, "Response: " + responseText);

            PrintWriter writer = resp.getWriter();
            try {
                writer.write(responseText);
            } finally {
                writer.close();
            }
        } catch (Exception e) {
            Logger.getLogger(getClass().getName()).log(Level.SEVERE, "Error in processing request", e);
        }
    }

    private String prettyPrintParams(Map<String, String[]> params) {
        StringBuilder builder = new StringBuilder();
        if (params.size() == 0)
            return "{}";

        builder.append(String.format("{%n"));
        for (String name : params.keySet()) {
            builder.append(String.format("    %s: ", name));
            String[] values = params.get(name);
            if (values.length == 1) {
                builder.append(String.format("\"%s\"%n", values[0]));
            } else {
                builder.append("[\"").append(values[0]).append("\"");
                for (int i = 1; i < values.length; i++) {
                    builder.append(", \"").append(values[i]).append("\"");
                }
                builder.append(String.format("]%n"));
            }
        }
        builder.append("}");

        return builder.toString();
    }

}
