var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export default function validate(_a) {
    var { value } = _a, options = __rest(_a, ["value"]);
    let isValid = true;
    if (options.required) {
        isValid = isValid && value.toString().trim().length !== 0;
    }
    if (options.min && typeof value === "number") {
        isValid = isValid && value >= options.min;
    }
    if (options.min && typeof value === "string") {
        isValid = isValid && value.length >= options.min;
    }
    if (options.max && typeof value === "number") {
        isValid = isValid && value <= options.max;
    }
    if (options.max && typeof value === "string") {
        isValid = isValid && value.length <= options.max;
    }
    return isValid;
}
