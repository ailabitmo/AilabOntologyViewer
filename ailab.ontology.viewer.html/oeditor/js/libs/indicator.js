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

var Indicator = {
    instances: [],
    parent: null,
    statusText: null,
    isErrorOccurred: false,
    spacing: 5,
    isVisible: true,
    create: function (parent, params) {
        params = mergeFrom(params, {
            size: 50,
            position: vector(parent.attr("width") / 2, parent.attr("height") / 2),
            maxWidth: Infinity
        });
        var indicator = Object.create(this);
        indicator.parent   = parent;
        indicator.size     = params.size;
        indicator.position = params.position;
        indicator.maxWidth = params.maxWidth;
        return indicator;
    },
    run: function () {
        this.animate(this.parent);
        return this;
    },
    status: function(statusText) {
        this.statusText = statusText;
        this.updateState();
    },
    error: function () {
        this.isErrorOccurred = true;
        this.updateState();
    },
    visible: function (isVisible) {
        this.isVisible = isVisible;
        if (this.animation)
            this.animation.attr("display", isVisible ? null : "none");
    },
    moveTo: function (position) {
        this.position = position;
        if (this.animation)
            this.animation.attr("transform", "translate(" + this.position.x + "," + this.position.y + ")");
    },
    /**
     * Добавляет анимацию ожидания.
     * @param svg - селектор SVG-элемента
     */
    /*private*/ animate: function (svg) {
        this.animation = svg.append("svg:g")
            .attr("transform", "translate(" + this.position.x + "," + this.position.y + ")")
            .attr("display", this.isVisible ? null : "none");
        var arrow = this.animation.append("svg:g");
        this.arrowPath = arrow.append("svg:path")
            .attr("d", "m3.47,-19.7 a20,20 0 1,1 -6.95,0 m0,0 l-6,5 m6,-5 l-8,-0")
            .attr("transform", "scale(0.02)" + "scale(" + this.size + ")")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");
        this.text = this.animation.append("text")
            .attr("class", "indicatorText")
            .style("dominant-baseline", "middle")
            .attr("x", this.size / 2 + this.spacing);
        // добавляем повторяющуюся анимацию вращения
        var duration = 1500;
        var time =  Indicator.instances.length > 0 ? Indicator.instances[0].clock.time() : 0;
        var clock = this.clock = ReferenceClock.create(this.animation).run(duration, time);
        var startAngle = d3.ease("cubic-in-out")(time) * 360;
        if (!this.isErrorOccurred) {
            arrow.transition()
                .duration(duration * (1 - time))
                .ease(resumedEase(time))
                .attrTween("transform", function () {
                    return d3.interpolateString("rotate(" + startAngle + ")", "rotate(360)");
                }).each("end", rotateArrow);
        }
        var self = this;
        function rotateArrow() {
            if (self.isErrorOccurred) { return; }
            clock.run(duration, 0);
            arrow.transition()
                .duration(duration)
                .attrTween("transform", function () {
                    return d3.interpolateString("rotate(0)", "rotate(360)");
                }).each("end", rotateArrow);
        }
        Indicator.instances.push(this);
        this.updateState();
    },
    remove: function () {
        if (!this.animation) { return; }
        var index = Indicator.instances.indexOf(this);
        if (index >= 0) { Indicator.instances.splice(index, 1); }
        this.parent.node().removeChild(this.animation.node());
        this.animation = null;
    },
    /*private*/ updateState: function () {
        if (this.text) {
            var ti = textInfo(this.statusText, this.text.attr("class"));
            var maxTextwidth = Math.max(this.maxWidth - this.spacing - this.size);
            _razeText(this.text, this.statusText ? this.statusText : "", "", maxTextwidth, ti, null, svgui.Tooltip.instance);
        }
        if (this.animation && this.isErrorOccurred) {
            var index = Indicator.instances.indexOf(this);
            if (index >= 0) { Indicator.instances.splice(index, 1); }
            this.arrowPath.attr("stroke", "red");
            this.arrowPath.attr("d", this.arrowPath.attr("d") + "M-8,-8L8,8M-8,8L8,-8");
        }
    }
};
/**
 * Displays an indicator of some operation on top of SVG element.
 * Example usage:
 *     var indicator = WrapIndicator.create(d3.select("#svg"));
 *     d3.json("data.js", function(data) {
 *         indicator.remove();
 *         // display the data in #svg
 *     });
 */
var WrapIndicator = {
    wrap: function (parent, params) {
        var wrapIndicator = Object.create(this);
        wrapIndicator.parent = parent;
        wrapIndicator.wrapper = parent.append("svg:g");
        this.moveChildren(parent.node(), wrapIndicator.wrapper.node());
        this.indicator = Indicator.create(parent, params);
        wrapIndicator.wrapper
            .transition()
            .style("opacity", 0.2)
            .each("end", function() {
                if (wrapIndicator.running) {
                    wrapIndicator.indicator.run();
                }
            });
        wrapIndicator.pointerEvents = parent.attr("pointer-events");
        parent.attr("pointer-events", "none");
        wrapIndicator.running = true;
        return wrapIndicator;
    },
    status: function (statusText) {
        this.indicator.status(statusText);
    },
    error: function () {
        this.indicator.error();
    },
    remove: function () {
        if (!this.running) { return; }
        this.running = false;
        this.indicator.remove();
        this.parent.attr("pointer-events", this.pointerEvents);
        this.moveChildren(this.wrapper.node(), this.parent.node());
        this.parent.node().removeChild(this.wrapper.node());
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