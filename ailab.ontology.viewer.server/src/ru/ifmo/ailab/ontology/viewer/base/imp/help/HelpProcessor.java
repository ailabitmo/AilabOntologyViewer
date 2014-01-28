package ru.ifmo.ailab.ontology.viewer.base.imp.help;

import ru.spb.kpit.kivan.Randomizer.Triad;
import ru.ifmo.ailab.ontology.viewer.EditorServlet;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.*;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.EmptyRequestAndContextModel;
import ru.ifmo.ailab.ontology.viewer.base.interfaces.IRequestAndContextModel;

import java.lang.reflect.Constructor;
import java.util.Map;

/**
 * IDEA
 * : Kivan
 * : 06.01.14
 * : 19:09
 *
 * %%% Вспомогательный обработчик, выводит информацию о возможных запросах к сервлету
 */
public class HelpProcessor implements IProcessor<EmptyRequestAndContextModel, HelpResponseModel> {
    Map<String, Triad<Class, Class, Class>> map = EditorServlet.getTypeMap();

    @Override
    public HelpResponseModel processRequest(EmptyRequestAndContextModel input) {
        StringBuilder sb = new StringBuilder(
                "<html><meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\"><head></head><body><h1>Сервлет обращения к спарклу</h1><br>Возможные настройки:<br>");

        int i = 1;
        for (Map.Entry<String, Triad<Class, Class, Class>> str_params : map.entrySet()) {
            String path = str_params.getKey();
            sb.append(i++).append(". '/").append(path).append("/X' ,где X - ");
            Class requestModel = str_params.getValue().a;
            try {
                Constructor<IRequestAndContextModel> constr = requestModel.getConstructor();
                IRequestAndContextModel requMod = constr.newInstance();
                sb.append(requMod.getRequestStringDescription());
            } catch (Exception e) {
                sb.append("!!!ОШИБКА ОТСУТСТВУЕТ КОНСТРУКТОР ПО УМОЛЧАНИЮ!!!");
            }

            sb.append("  -->  ");
            Class responseModel = str_params.getValue().b;
            try {
                Constructor<IResponseModel> constr = responseModel.getConstructor();
                IResponseModel requMod = constr.newInstance();
                sb.append(requMod.getResponseStringDescription());
            } catch (Exception e) {
                sb.append("!!!ОШИБКА ОТСУТСТВУЕТ КОНСТРУКТОР ПО УМОЛЧАНИЮ!!!");
            }
            sb.append("<br>");
        }
        sb.append("</body></html>");

        return new HelpResponseModel().init(sb.toString());
    }
}
