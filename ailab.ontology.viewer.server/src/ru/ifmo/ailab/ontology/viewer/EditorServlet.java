package ru.ifmo.ailab.ontology.viewer;

import ru.ifmo.ailab.ontology.viewer.base.imp.help.HelpProcessor;
import ru.ifmo.ailab.ontology.viewer.base.imp.help.HelpResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.mirror.MirrorProcessor;
import ru.ifmo.ailab.ontology.viewer.base.imp.mirror.MirrorRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.mirror.MirrorResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerProcessor;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.pageViewer.PagedViewerResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerProcessor;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.imp.rootviewer.ViewerResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.EmptyRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IProcessor;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.utils.LoggerWrapper;
import ru.ifmo.ailab.ontology.viewer.base.utils.smartrequest.SmartRequest;
import ru.spb.kpit.kivan.General.Strings.StringUtils;
import ru.spb.kpit.kivan.Randomizer.Triad;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Constructor;
import java.util.*;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 11:43
 *
 * %%% Основной сервлет обработчик
 */
public class EditorServlet extends HttpServlet {
    //1 - request, 2 - response, 3 - processor
    static Map<String, Triad<Class, Class, Class>> processorMap = Collections.synchronizedMap(new HashMap<String, Triad<Class, Class, Class>>());

    static {
        processorMap.put("pageviewer", new Triad<Class, Class, Class>
                (PagedViewerRequestAndContextModel.class, PagedViewerResponseModel.class, PagedViewerProcessor.class));
        processorMap.put("rootviewer", new Triad<Class, Class, Class>
                (ViewerRequestAndContextModel.class, ViewerResponseModel.class, ViewerProcessor.class));
        processorMap.put("mirror", new Triad<Class, Class, Class>
                (MirrorRequestAndContextModel.class, MirrorResponseModel.class, MirrorProcessor.class));
        processorMap.put("help", new Triad<Class, Class, Class>
                (EmptyRequestAndContextModel.class, HelpResponseModel.class, HelpProcessor.class));
    }



    public static Map<String, Triad<Class, Class, Class>> getTypeMap() {
        return processorMap;
    }

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
        //Profiler profiler = new SyncProfiler();
        req.setCharacterEncoding("utf-8");
        resp.setContentType("text/html");
        resp.setCharacterEncoding("utf-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter wr = resp.getWriter();
        try {
            String path = req.getPathInfo();
            String requestType;
            String parameters = null;
            if (path != null) {
                List<String> request = StringUtils.split(path, "/");
                if (request.size() == 0) {
                    requestType = "help";
                } else {
                    requestType = request.get(0);
                    try {
                        parameters = req.getQueryString();
                    } catch (Exception e) {
                    }
                    if (parameters == null) {
                        try {
                            Scanner sc = new Scanner(req.getInputStream(), "utf-8");
                            StringBuilder sb = new StringBuilder();
                            while (sc.hasNextLine()) {
                                sb.append(sc.nextLine());
                            }
                            parameters = sb.toString();
                        } catch (IOException e) {
                            logger.error("IOException", e);
                        }
                    }
                }
            } else {
                requestType = "help";
            }

            logger.info("Starting: " + requestType + " " + path + " " + parameters);
            //profiler.start("EditorServlet main");

            Triad<Class, Class, Class> selected = processorMap.get(requestType);
            if (selected == null) selected = processorMap.get("help");

            Class requestModel = selected.a;
            Class processor = selected.c;
            IRequestAndContextModel requMod = null;
            IResponseModel respMod = null;
            IProcessor processoR = null;
            try {
                Constructor<IRequestAndContextModel> constr = requestModel.getConstructor();
                requMod = constr.newInstance();
            } catch (Exception e) {
                logger.error("No constructor in requestModel", e);
                wr.append("!!!ОШИБКА ОТСУТСТВУЕТ КОНСТРУКТОР ПО УМОЛЧАНИЮ В REQUESTMODEL для '" + requestType + "'!!!");
            }
            requMod = requMod.init(parameters);
            try {
                Constructor<IProcessor> constr = processor.getConstructor();
                processoR = constr.newInstance();
            } catch (Exception e) {
                logger.error("No constructor in processor", e);
                wr.append("!!!ОШИБКА ОТСУТСТВУЕТ КОНСТРУКТОР ПО УМОЛЧАНИЮ В PROCESSOR для '" + requestType + "'!!!");
            }
            respMod = processoR.processRequest(requMod);
            String response = respMod.getResponseString();
            logger.debug("Response:" + response);
            wr.append(response);
        } catch (Exception e) {
            logger.error("Exception in process", e);
        } finally {
            /*profiler.end("EditorServlet main");
            LoggerWrapper.debug(profiler.getInfo());*/
            try {
                if (wr != null) wr.close();
            } catch (Exception e) {
                e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            }
        }
    }

    private LoggerWrapper logger = LoggerWrapper.getLogger(this.getClass());


}
