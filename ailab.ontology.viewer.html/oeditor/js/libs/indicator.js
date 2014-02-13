/**
 * Returns a remainder of an ease function starting from elapsedTime.
 */
function resumedEase(elapsedTime, ease) {
    if (typeof ease == "undefined") ease = "cubic-in-out";
    var y = typeof ease == "function" ? ease : d3.ease.call(d3, ease);
    var scaleOriginal = d3.scale.linear().domain([0, 1]).range([elapsedTime, 1]);
    var scaleResult   = d3.scale.linear().domain([y(elapsedTime), 1]).range([0, 1]);
    return function (xResumed) {
        var xOriginal = scaleOriginal(xResumed);
        return scaleResult(y(xOriginal));
    };
}
var ReferenceClock = {
    /**
     * @param element Element to run reference transition, must not be running any other transition.
     */
    create: function (element) {
        var clock = Object.create(this);
        clock.element = element;
        return clock;
    },
    run: function (duration, startTime) {
        this.element.attr("__referenceTime", startTime);
        this.element.transition()
            .ease("linear")
            .duration(duration * (1 - startTime))
            .attr("__referenceTime", 1);
        return this;
    },
    /**
     * @returns current time scaled from 0 to 1.
     */
    time: function () {
        return this.element.attr("__referenceTime");
    }
};
/**
 * Отображает индикатор ожидания вместо содержмого SVG-элемента.
 * Пример использования:
 *     var indicator = Indicator.create(d3.select("#svg"));
 *     d3.json("data.js", function(data) {
 *         indicator.stop();
 *         // отобразить data в svg
 *     });
 */
var Indicator = {
    instances: [],
    statusText: null,
    /**
     * Создаёт новый индикатор, скрывая предыдущее содержимое SVG,
     * и заменяя его на анимацию ожидания.
     * @param svg - селектор SVG-элемента
     */
    create: function (svg, size) {
        if (typeof size == "undefined") { size = 50; }
        var indicator = Object.create(this);
        indicator.parent = svg;
        indicator.wrapper = svg.append("svg:g");
        this.moveChildren(svg.node(), indicator.wrapper.node());
        indicator.size = size;
        indicator.wrapper
            .transition()
            .style("opacity", 0.2)
            .each("end", function() {
                indicator.animate(svg);
            });
        indicator.pointerEvents = svg.attr("pointer-events");
        svg.attr("pointer-events", "none");
        indicator.running = true;
        return indicator;
    },
    /**
     * Возвращает SVG-элемент в первоначальный вид.
     */
    stop: function () {
        var index = Indicator.instances.indexOf(this);
        if (index >= 0)
            Indicator.instances.splice(index, 1);
        if (!this.running)
            return;
        var svg = this.wrapper.node().parentNode;
        d3.select(svg).attr("pointer-events", this.pointerEvents);
        if (this.animation != null)
            svg.removeChild(this.animation.node());
        this.moveChildren(this.wrapper.node(), svg);
        svg.removeChild(this.wrapper.node());
        this.running = false;
    },
    error: function () {
        this.stop();
    },
    status: function(statusText) {
        this.statusText = statusText;
        if (this.text) {
            this.text.text(statusText);
        }
    },
    /**
     * Добавляет анимацию ожидания.
     * @param svg - селектор SVG-элемента
     */
    /*private*/ animate: function (svg) {
        if (!this.running)
            return;
        this.animation = svg.append("svg:g")
            .attr("transform", "translate(" + svg.attr("width") / 2 + "," + svg.attr("height") / 2 + ")");
        var arrow = this.animation.append("svg:g");
        arrow.append("svg:path")
            .attr("d", "m3.47,-19.7 a20,20 0 1,1 -6.95,0 m0,0 l-6,5 m6,-5 l-8,-0")
            .attr("transform", "scale(0.02)" + "scale(" + this.size + ")")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");
        var spacing = 5;
        this.text = this.animation.append("text")
            .attr("alignment-baseline", "middle")
            .attr("x", this.size / 2 + spacing)
            .text(this.statusText ? this.statusText : null);
        // добавляем повторяющуюся анимацию вращения
        var duration = 1500;
        var time =  Indicator.instances.length > 0 ? Indicator.instances[0].clock.time() : 0;
        var clock = this.clock = ReferenceClock.create(this.animation).run(duration, time);
        var startAngle = d3.ease("cubic-in-out")(time) * 360;
        arrow.transition()
            .duration(duration * (1 - time))
            .ease(resumedEase(time))
            .attrTween("transform", function () {
                return d3.interpolateString("rotate(" + startAngle + ")", "rotate(360)");
            }).each("end", rotateArrow);
        function rotateArrow() {
            clock.run(duration, 0);
            arrow.transition()
                .duration(duration)
                .attrTween("transform", function () {
                    return d3.interpolateString("rotate(0)", "rotate(360)");
                }).each("end", rotateArrow);
        }
        Indicator.instances.push(this);
    },
    /**
     * Перемещает дочерние узлы из узла from в узел to,
     * за исключением самого узла to.
     */
    /*private*/ moveChildren: function (from, to) {
        for (var node = from.firstChild; node != null;) {
            var next = node.nextSibling;
            if (node !== to) {
                from.removeChild(node);
                to.appendChild(node);
            }
            node = next;
        }
    }
};