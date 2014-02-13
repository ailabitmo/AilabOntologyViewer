function extend(base, derivedTemplate) {
    var derived = Object.create(base);
    for (var key in derivedTemplate) {
        derived[key] = derivedTemplate[key];
    }
    return derived;
}

function constructable(classTemplate) {
    return extend(constructable.prototype, classTemplate);
}

constructable.prototype = {
    create: function () {
        var obj = Object.create(this);
        if ("init" in this) obj.init.apply(obj, arguments);
        return obj;
    }
};

function mergeInto(targetObject, sourceObject) {
    for (var property in sourceObject) {
        targetObject[property] = sourceObject[property];
    }
    return targetObject;
}
function mergeFrom(sourceObject, targetObject) {
    return mergeInto(targetObject, sourceObject);
}

var Vector = {
    add: function (v) { return vector(this.x + v.x, this.y + v.y); },
    sub: function (v) { return vector(this.x - v.x, this.y - v.y); },
    mul: function (s) { return vector(this.x * s, this.y * s); },
    negate: function () { return vector(-this.x, -this.y); },
    dot: function (v) { return this.x * v.x + this.y * v.y; },
    length: function () { return Math.sqrt(this.x * this.x + this.y * this.y); }
};
function vector(x, y) {
    var v = Object.create(Vector);
    v.x = x;
    v.y = y;
    if (typeof y === "undefined") { v.y = v.x; }
    return v;
}

function _razeText(element, text, suffix, maxWidth, textProps, sufProps, tooltiper) {
    if(sufProps==null) sufProps = {'width': 0, 'height': 0, 'baseLineHeight': 0};
    if (textProps.width + sufProps.width > maxWidth) {
        var maxLength = Math.floor(text.length * (maxWidth / textProps.width)) - 1 - suffix.length - "...".length; //3 на точки
        element.text(text.substring(0, maxLength) + "..." + suffix);
        if (tooltiper) tooltiper.bindTo(element, function (d, i) {
            return text;
        });
    } else {
        element.text(text + suffix);
    }
    return element;
}
