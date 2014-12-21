var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var sensorTag;
function changeTog(data) {
    var raw = new Int8Array(data);
    return raw[0] / 64;
}
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        document.addEventListener('bcready', this.onBCReady, false);
    }
    Main.prototype.onBCReady = function () {
        /*var names = ["a", "b"];
        _.each(names, function (name) {
            alert(name);
        });*/
        BC.bluetooth.addEventListener("bluetoothstatechange", function () {
            if (BC.bluetooth.isopen) {
                alert("your bluetooth has been opened successfully.");
            }
            else {
                alert("bluetooth is closed!");
                BC.Bluetooth.OpenBluetooth(function () {
                    alert("opened!");
                });
            }
        });
        BC.bluetooth.addEventListener("newdevice", function (arg) {
            var newDevice = arg.target;
            newDevice.addEventListener("devicedisconnected", function (arg) {
                alert("SensorTag:" + arg.deviceAddress + " is disconnect,Click to reconnect.");
                newDevice.connect(function (arg) {
                    alert("SensorTag:" + arg.deviceAddress + " is reconnected successfully.");
                }, function () {
                    newDevice.dispatchEvent("devicedisconnected");
                });
            });
            if (newDevice.deviceAddress == "BC:6A:29:AB:7C:DE") {
                sensorTag = newDevice;
                newDevice.connect(function () {
                    sensorTag.prepare(function () {
                        var beginNotifyChar = sensorTag.services[4].characteristics[0];
                        var enableChar = sensorTag.services[4].characteristics[1];
                        var frequencyChar = sensorTag.services[4].characteristics[2];
                        enableChar.write("Hex", "01", function () {
                            frequencyChar.write("Hex", "0a", function () {
                                beginNotifyChar.subscribe(function (data) {
                                    var x = changeTog(data.value.value.slice(0, 1));
                                    var y = changeTog(data.value.value.slice(1, 2));
                                    var z = changeTog(data.value.value.slice(2, 3));
                                    z = -z;
                                    console.log("x:" + x + " y:" + y + " z:" + z);
                                });
                            }, function () {
                                alert("write to enable char error");
                            });
                        }, function () {
                            alert("write to enable char error");
                        });
                    }, function () {
                        alert("read SensorTag ATT table error!");
                    });
                }, function () {
                    alert("connect the SensorTag BC:6A:29:AB:7C:DE error");
                });
            }
        });
        if (!BC.bluetooth.isopen) {
            BC.Bluetooth.OpenBluetooth(function () {
                BC.Bluetooth.StartScan("LE");
            });
        }
        else {
            BC.Bluetooth.StartScan("LE");
        }
    };
    Main.prototype.onAddToStage = function (event) {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    };
    Main.prototype.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    };
    Main.prototype.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    Main.prototype.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    Main.prototype.createGameScene = function () {
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        var icon = this.createBitmapByName("ball");
        icon.anchorX = icon.anchorY = 0.5;
        this.addChild(icon);
        icon.x = stageW / 2;
        icon.y = stageH / 2 - 60;
        icon.scaleX = 0.55;
        icon.scaleY = 0.55;
    };
    Main.prototype.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
})(egret.DisplayObjectContainer);
//# sourceMappingURL=Main.js.map