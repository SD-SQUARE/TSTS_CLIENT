"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostIp = void 0;
var os_1 = require("os");
var getHostIp = function () {
    var nets = (0, os_1.networkInterfaces)();
    for (var _i = 0, _a = Object.keys(nets); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        for (var _b = 0, _c = nets[name_1]; _b < _c.length; _b++) {
            var net = _c[_b];
            // Skip internal (127.0.0.1) and non-IPv4 addresses
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "localhost"; // Fallback
};
exports.getHostIp = getHostIp;
