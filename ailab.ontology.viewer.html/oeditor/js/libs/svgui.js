var svgui = {};
(function (svgui) {
    var tooltipHelperId = 0;
    function Tooltip(style) {
        var helper = d3.select("body").append("span")
            .attr('id', "__tooltipHelper_" + tooltipHelperId++)
            .attr("class", style)
            .style("opacity", "0");
        return {
            bindTo: function (element, textGenerator, params) {
                var defaults = {x: 5, y: 5, sdelay: 0, edelay: 0, sduration: 200, eduration: 500};
                params = mergeProperties(params, defaults);
                element.on("mouseover.tooltip", function (d) {
                    helper.transition()
                        .delay(params.sdelay)
                        .duration(params.sduration)
                        .style("opacity", "0.95");
                    helper.html(textGenerator(d))
                        .style("left", (d3.event.pageX + params.x) + "px")
                        .style("top", (d3.event.pageY + params.y) + "px");
                }).on("mousemove.tooltip", function (d) {
                    helper.style("left", (d3.event.pageX + params.x) + "px")
                        .style("top", (d3.event.pageY + params.y) + "px");
                }).on("mouseout.tooltip", function (d) {
                    helper.transition()
                        .delay(params.edelay)
                        .duration(params.eduration)
                        .style("opacity", "0");
                });
            }
        };
    }
    Tooltip.instance = Tooltip("tooltip");
    svgui.Tooltip = Tooltip;

    function removeAllChilds(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    /**
     * Measures UIElement using UIElement.measure() method taking
     * it's margin, width and height fields into consideration.
     * @param element UIElement to measure
     * @param maxSize Maximum allowed size for element bounds including margin.
     *                Use Infinity to compute non-restricted element size.
     * @returns Measured size of element including margin.
     */
    function measure(element, maxSize) {
        var horizontalMargin = element.margin.left + element.margin.right;
        var verticalMargin = element.margin.top + element.margin.bottom;
        if (element.width && element.width < maxSize.x) { maxSize.x = element.width; }
        if (element.height && element.height < maxSize.y) { maxSize.y = element.height; }
        maxSize.x = Math.max(maxSize.x - element.margin.left - element.margin.right, 0);
        maxSize.y = Math.max(maxSize.y - element.margin.top - element.margin.bottom, 0);
        var size = element.measure(maxSize);
        // element size should be greater or equal to (width, height) if they're set
        if (element.width && size.x < element.width) { size.x = element.width; }
        if (element.height && size.y < element.height) { size.y = element.height; }
        element.size = size;
        if (element.height) { element.size.y = maxSize.y; }
        return vector(size.x + horizontalMargin, size.y + verticalMargin);
    }

    /**
     * Arranges UIElement by specified coordinates (x, y) and size taking
     * it's margin into consideration.
     */
    function arrange(element, x, y, size) {
        if (typeof size == "undefined") { size = element.size; }
        element.arrange(x + element.margin.left, y + element.margin.top, size);
    }
    function sizeWithMargin(element) {
        return vector(element.size.x + element.margin.left + element.margin.right,
            element.size.y + element.margin.top + element.margin.bottom);
    }
    svgui.measure = measure;
    svgui.arrange = arrange;
    svgui.sizeWithMargin = sizeWithMargin;

    /**
     * UIElement structure: {
     *     root                 Root SVG element of this UIElement
     *     margin               {top, right, bottom, left}
     *     update()             Updates internal element state after setting element properties
     *     measure(maxSize)     Measures element without margin returning computed element size
     *     arrange(x, y, size)  Arranges element without margin by coordinates (x, y) using provided size
     * }
     */
    function UIElement(params) {
        var element = mergeFrom(params, {
            margin: {top: 0, right: 0, bottom: 0, left: 0}
        });
        return mergeInto(element, {
            update:  function () {},
            measure: function (maxSize) {},
            arrange: function () {}
        });
    }

    function Label(params) {
        var hyperlink = null;
        var ti;
        var iconSize;
        var textLines;

        var label = mergeFrom(UIElement(params), {
            text: "Label",
            textClass: "basicTextInGraph",
            interline: 3,
            raze: true
        });
        return mergeInto(label, {
            root: params.parent.append("g"),
            update: function () {
                removeAllChilds(this.root);
                hyperlink = mav.wrapHyperlink(this.root, this.text);
                ti = textInfo(hyperlink.text, this.textClass);
                iconSize = hyperlink.icon != null ? ti.height : 0;
                return this;
            },
            measure: function (maxSize) {
                if (this.raze) {
                    return vector(Math.min(maxSize.x, ti.width + iconSize), ti.height);
                } else {
                    textLines = splitIntoLines(function (i) { return maxSize.x - (i == 0 ? iconSize : 0); }, hyperlink.text, this.textClass);
                    var height = (textLines.length * (ti.offsetY + this.interline)) - this.interline + ti.baseLineHeight;
                    var width = textLines.length > 0 ? textInfo(textLines[0], this.textClass).width : 0;
                    return vector(width, height);
                }
            },
            arrange: function (x, y, size) {
                if (hyperlink.icon != null) {
                    hyperlink.icon
                        .attr("x", x + ti.height * 0.1)
                        .attr("y", y + ti.height * 0.1)
                        .attr("width", ti.height * 0.8)
                        .attr("height", ti.height * 0.8);
                }
                hyperlink.parent.selectAll("text").remove();
                if (this.raze) {
                    var textElement = hyperlink.parent.append("text")
                        .attr("width", size.x)
                        .attr("y", y + ti.offsetY)
                        .attr("x", x + iconSize)
                        .attr("class", this.textClass);
                    _razeText(textElement, hyperlink.text, "", Math.max(size.x - iconSize, 0), ti, null, Tooltip.instance);
                    if (hyperlink.url != null)
                        Tooltip.instance.bindTo(textElement, function () { return hyperlink.url; });
                } else {
                    for (var i = 0; i < textLines.length; i++) {
                        var lineText = textLines[i];
                        hyperlink.parent.append("text")
                            .attr("width", size.x)
                            .attr("y", y + ti.offsetY + (ti.offsetY + this.interline) * i)
                            .attr("x", x + (i == 0 ? iconSize : 0))
                            .attr("class", this.textClass)
                            .text(lineText);
                    }
                }
            }
        }).update();
    }
    svgui.Label = Label;

    function PropertyTable(params) {
        var rendered;
        var maxLeftWidth, maxRightWidth;
        var leftWidth, rightWidth;

        var propertyTable = mergeFrom(UIElement(params), {
            content: [
                {name: "First caption", val: [
                    {left: "The quick brown fox jumps over the lazy dog", right: "Да"},
                    {left: "Lelele", right: "Дудудуд аа"}
                ]},
                {name: "Second really long group caption", val: [
                    {left: "трам-пам-пам", right: "Да"},
                    {left: "Pdf test", right: "http://example.com/file1.pdf"}
                ]}
            ],
            captionClass: "paragraphHeaderGraph",
            pairClass: "basicTextInGraph",
            percent_leftright: 50,
            indentBetweenLeftAndRight: 10,
            horIndent: 10,
            spacing: vector(10, 3)
        });
        return mergeInto(propertyTable, {
            root: params.parent.append("g"),
            update: function () {
                removeAllChilds(this.root);
                rendered = [];
                var self = this;
                each(this.content, function (group) {
                    var caption = Label({parent: self.root, text: group.name, raze: false, textClass: self.captionClass});
                    caption.update();
                    var pairs = [];
                    each(group.val, function (pair) {
                        var left = Label({parent: self.root, text: pair.left, textClass: self.pairClass});
                        var right = Label({parent: self.root, text: pair.right, textClass: self.pairClass});
                        pairs.push({left: left, right: right});
                    });
                    rendered.push({caption: caption, val: pairs});
                });
                return this;
            },
            measure: function (maxSize) {
                maxSize.x = Math.max(maxSize.x - this.horIndent - this.spacing.x, 0);
                var height = 0;
                var maxGroupWidth = 0;
                maxLeftWidth = 0;
                maxRightWidth = 0;
                leftWidth = maxSize.x * this.percent_leftright / 100;
                rightWidth = maxSize.x * (1 - this.percent_leftright / 100);
                var self = this;
                each(rendered, function (group) {
                    var captionSize = measure(group.caption, maxSize);
                    maxGroupWidth = Math.max(maxGroupWidth, captionSize.x);
                    maxSize.y = Math.max(maxSize.y - captionSize.y - self.spacing.y, 0);
                    height += captionSize.y + self.spacing.y;
                    each(group.val, function (pair) {
                        var leftSize = measure(pair.left, vector(leftWidth, maxSize.y));
                        var rightSize = measure(pair.right, vector(rightWidth, maxSize.y));
                        var maxHeight = Math.max(pair.left.size.y, pair.right.size.y);
//                        pair.left.size.y = pair.right.size.y = maxHeight;
                        maxLeftWidth = Math.max(maxLeftWidth, leftSize.x);
                        maxRightWidth = Math.max(maxRightWidth, rightSize.x);
                        maxSize.y = Math.max(maxSize.y - maxHeight - self.spacing.y, 0);
                        height += maxHeight + self.spacing.y;
                    });
                });
                var totalLeftRightWidth = maxLeftWidth + maxRightWidth + this.horIndent + this.spacing.x;
                return vector(Math.max(totalLeftRightWidth, maxGroupWidth), height);
            },
            arrange: function (x, y, size) {
                var rightOffsetX = this.horIndent + maxLeftWidth + this.spacing.x;
                var self = this;
                each(rendered, function (group) {
                    arrange(group.caption, x, y);
                    y += group.caption.size.y + self.spacing.y;
                    each(group.val, function (pair) {
                        arrange(pair.left, x + self.horIndent, y, vector(maxLeftWidth, pair.left.size.y));
                        arrange(pair.right, x + rightOffsetX, y, vector(maxRightWidth, pair.right.size.y));
                        y += pair.left.size.y + self.spacing.y;
                    });
                });
            }
        }).update();
    }
    svgui.PropertyTable = PropertyTable;

    function Expander(params) {
        var root = params.parent.append("g");
        var expander = mergeFrom(UIElement(params), {
            first: null,
            second: null,
            splitterMargin: 6,
            expanded: false
        });
        return mergeInto(expander, {
            root: root,
            splitter: root.append("line").attr("class", "splitter"),
            update: function () {
                this.splitter.transition().transition().attr("opacity", this.expanded ? 1 : 0);
                if (this.second) {
                    this.second.root
                        .attr("pointer-events", this.expanded ? null : "none")
                        .transition().attr("opacity", this.expanded ? 1 : 0);
                }
                return this;
            },
            measure: function (maxSize) {
                var firstSize = measure(this.first, maxSize);
                if (this.expanded) {
                    maxSize.y = Math.max(maxSize.y - firstSize.y, 0);
                    var secondSize = measure(this.second, maxSize);
                    return vector(Math.max(firstSize.x, secondSize.x),
                        firstSize.y + secondSize.y + this.splitterMargin);
                } else {
                    return firstSize;
                }
            },
            arrange: function (x, y, size) {
                arrange(this.first, x, y);
                if (this.expanded) {
                    var lineY = y + this.first.size.y + this.splitterMargin / 2;
                    this.splitter.attr("x1", x).attr("x2", x + size.x)
                        .attr("y1", lineY).attr("y2", lineY);
                    y += this.first.size.y + this.splitterMargin;
                    arrange(this.second, x, y);
                }
            }
        }).update();
    }
    svgui.Expander = Expander;

    function Paginator(params) {
        var buttonSize = 20;
        var cornerRadius = 10;
        var disabledColor = "#B0B0B0";
        var root = params.parent.append("g");
        var rect;
        var isEditing = false;
        var prevEar, nextEar, firstEar, lastEar;
        var paginator = mergeFrom(UIElement(params), {
            currentPage: 1,
            pageCount: 0,
            onPageChanged: null, // function (currentPage) {...}
            color: "green"
        });
        mergeInto(paginator, {
            root: root,
            buttons: root.append("g"),
            update: function () {
                this.label.text = this.currentPage.toString() + " / " + this.pageCount;
                this.label.update();
                rect.attr("stroke", this.color);
                if (this.currentPage == 1) {
                    setEarColor(firstEar, disabledColor, false);
                    setEarColor(prevEar, disabledColor, false);
                } else {
                    setEarColor(firstEar, this.color, true);
                    setEarColor(prevEar, this.color, true);
                }
                if (this.currentPage == this.pageCount) {
                    setEarColor(nextEar, disabledColor, false);
                    setEarColor(lastEar, disabledColor, false);
                } else {
                    setEarColor(nextEar, this.color, true);
                    setEarColor(lastEar, this.color, true);
                }
                return this;
            },
            measure: function (maxSize) {
                var labelSize = measure(this.label, vector(Infinity, maxSize.y));
                return vector(labelSize.x + buttonSize * 4, labelSize.y);
            },
            arrange: function (x, y, size) {
                var rectWidth = size.x - buttonSize * 4;
                rect.attr("width", rectWidth)
                    .attr("height", size.y)
                    .attr("x", x + buttonSize * 2)
                    .attr("y", y);
                arrange(this.label, x + buttonSize * 2 + Math.max(rectWidth - sizeWithMargin(this.label).x, 0) / 2, y);
                firstEar.rect.attr("x", x).attr("width", size.x / 2);
                prevEar.rect.attr("x", x + buttonSize).attr("width", size.x / 2 - buttonSize);
                nextEar.rect.attr("x", x + size.x / 2).attr("width", size.x / 2 - buttonSize);
                lastEar.rect.attr("x", x + size.x / 2).attr("width", size.x / 2);
                each ([prevEar, nextEar, firstEar, lastEar], function (ear) {
                    ear.rect.attr("y", y).attr("height", size.y);
                });
                var centerY = y + size.y / 2;
                firstEar.path.attr("transform", "translate(" + (x + buttonSize * 0.5) + "," + centerY + ")");
                prevEar.path.attr("transform",  "translate(" + (x + buttonSize * 1.5) + "," + centerY + ")");
                nextEar.path.attr("transform",  "translate(" + (x + rectWidth + buttonSize * 2.5) + "," + centerY + ")");
                lastEar.path.attr("transform",  "translate(" + (x + rectWidth + buttonSize * 3.5) + "," + centerY + ")");
            },
            changePageTo: function (newPage) {
                newPage = Math.min(Math.max(newPage, 1), this.pageCount);
                if (newPage != this.currentPage) {
                    this.currentPage = newPage;
                    this.update();
                    if (this.onPageChanged) { this.onPageChanged(this.currentPage); }
                }
            }
        });

        var textBox = root.append("g").attr("class", "paginatorBox");
        var rect = textBox.append("rect").attr("rx", cornerRadius).attr("ry", cornerRadius);
        paginator.label = Label({parent: textBox, raze: false, textClass: "paginatorText", margin: {left: 5, right: 5, top: 3, bottom: 3}});
        textBox.on("mouseover", function () {
            rect.attr("stroke", d3.rgb(paginator.color).brighter());
        });
        textBox.on("mouseout", function () {
            rect.attr("stroke", paginator.color);
        });
        textBox.on("mousedown", function () {
            if (isEditing) { return; }
            d3.event.preventDefault();
            makeEditableField(textBox, paginator.currentPage, function (form, field) {
                var bounds = rect.node().getBBox();
                form.attr("x", bounds.x).attr("y", bounds.y)
                    .attr("width", rect.attr("width")).attr("height", rect.attr("height"));
                field.attr("style", "width: " + rect.attr("width") + "px; height: " + rect.attr("height") + "px;");
                paginator.label.root.style("display", "none");
                isEditing = true;
            }, function (text) {
                isEditing = false;
                paginator.label.root.style("display", null);
                if (text.match(/^[0-9]+$/))
                    paginator.changePageTo(parseInt(text, 10));
            });
        });

        firstEar = createEar(paginator.buttons, true, true);
        lastEar  = createEar(paginator.buttons, false, true);
        nextEar  = createEar(paginator.buttons, false, false);
        prevEar  = createEar(paginator.buttons, true, false);

        function createEar(parent, isLeft, isEnd) {
            var ear = parent.append("g").attr("class", "paginatorButton");
            var rect = ear.append("rect").attr("rx", cornerRadius).attr("ry", cornerRadius);
            var path = isLeft ? "M5,5L-5,0L5,-5" : "M-5,5L5,0L-5,-5";
            if (isEnd) { path += isLeft ? "M-5,5l-2,0l0,-10l2,0" : "M5,5l2,0l0,-10l-2,0"; }
            var triangle = ear.append("path").attr("d", path);
            var earInfo = {group: ear, rect: rect, path: triangle, enabled: true};
            ear.on("mouseover", function () {
                if (earInfo.enabled) { setEarColor(earInfo, d3.rgb(paginator.color).brighter()); }
            });
            ear.on("mouseout", function () {
                if (earInfo.enabled) { setEarColor(earInfo, paginator.color); }
            });
            ear.on("mousedown", function () {
                if (isEditing) { return; }
                paginator.changePageTo(isEnd
                    ? (isLeft ? 1 : paginator.pageCount)
                    : paginator.currentPage + (isLeft ? -1 : +1));
                if (earInfo.enabled) { setEarColor(earInfo, d3.rgb(paginator.color).brighter()); }
                d3.event.preventDefault();
            });
            return earInfo;
        }

        function setEarColor(ear, color, isButtonEnabled) {
            if (typeof isButtonEnabled != "undefined") {
                ear.enabled = isButtonEnabled;
            }
            ear.rect.attr("stroke", color);
            ear.path.attr("fill", color);
        }

        return paginator.update();
    }
    svgui.Paginator = Paginator;

    /**
     * @param parent
     * @param initialText
     * @param onCreate function (form, field) {...}
     * @param onSubmit function (text) {...}
     */
    function makeEditableField(parent, initialText, onCreate, onSubmit) {
        var form = parent.append("foreignObject").attr("pointer-events", "none");
        var field = form.append("xhtml:form").append("input")
            .attr("value", function() {
                onCreate(form, d3.select(this));
                return initialText;
            })
            .call(function () {
                this.node().focus();
                var endOfText = this.node().value.length;
                this.node().setSelectionRange(0, endOfText);
            })
            // make the form go away when you jump out (form looses focus) or hit ENTER:
            .on("blur", function() {
                var text = field.node().value;
                onSubmit(text);
                if (form) {
                    form.remove();
                    form = null;
                }
            })
            .on("keypress", function() {
                if (d3.event.keyCode == 13) {
                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                    var text = field.node().value;
                    onSubmit(text);
                    if (form) {
                        // .remove() fires 'blur' handler, so we need to make
                        // sure that it won't try to remove node again
                        var formToRemove = form;
                        form = null;
                        formToRemove.remove();
                    }
                }
            });
    }
})(svgui);