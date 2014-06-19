package ru.ifmo.ailab.ontology.viewer.servlets;

import ru.ifmo.ailab.ontology.viewer.base.imp.help.HelpResponseModel;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.EmptyRequestAndContextModel;

public class HelpServlet extends BaseServlet<EmptyRequestAndContextModel, HelpResponseModel> {
    //private Map<String, Triad<Class, Class, Class>> map = EditorServlet.getTypeMap();

    @Override
    protected EmptyRequestAndContextModel getRequestModel(IRequestParams params) {
        return new EmptyRequestAndContextModel();
    }

    @Override
    protected HelpResponseModel processRequest(EmptyRequestAndContextModel requestModel) {
        //        StringBuilder sb = new StringBuilder(
//                "<html><meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\"><head></head><body><h1>Сервлет обращения к спарклу</h1><br>Возможные настройки:<br>");
//
//        int i = 1;
//        for (Map.Entry<String, Triad<Class, Class, Class>> str_params : map.entrySet()) {
//            String path = str_params.getKey();
//            sb.append(i++).append(". '/").append(path).append("/X' ,где X - ");
//            Class requestModel = str_params.getValue().a;
//            try {
//                Constructor<IRequestAndContextModel> constr = requestModel.getConstructor();
//                IRequestAndContextModel requMod = constr.newInstance();
//                sb.append(requMod.getRequestStringDescription());
//            } catch (Exception e) {
//                sb.append("!!!ОШИБКА ОТСУТСТВУЕТ КОНСТРУКТОР ПО УМОЛЧАНИЮ!!!");
//            }
//
//            sb.append("  -->  ");
//            Class responseModel = str_params.getValue().b;
//            try {
//                Constructor<IResponseModel> constr = responseModel.getConstructor();
//                IResponseModel requMod = constr.newInstance();
//                sb.append(requMod.getResponseStringDescription());
//            } catch (Exception e) {
//                sb.append("!!!ОШИБКА ОТСУТСТВУЕТ КОНСТРУКТОР ПО УМОЛЧАНИЮ!!!");
//            }
//            sb.append("<br>");
//        }
//        sb.append("</body></html>");

        return new HelpResponseModel("");
    }
}
