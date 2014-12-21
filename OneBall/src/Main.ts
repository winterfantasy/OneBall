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
var sensorTag: BC.Device;
var ball: egret.Bitmap;

function changeTog(data) {
    var raw = new Int8Array(data);
    return raw[0] / 64;
}

function _fix_pos(pos, min, max) {
    var ret = pos;
    if (pos < min)
        ret = min;
    else if (pos > max)
        ret = max;
    return ret;
}

class Main extends egret.DisplayObjectContainer{

    private loadingView: LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event){
        this.loadingView  = new LoadingUI();
        this.stage.addChild(this.loadingView);

        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.loadConfig("resource/resource.json","resource/");
    }

    private onConfigComplete(event:RES.ResourceEvent):void{
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
        RES.loadGroup("preload");
    }

    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if(event.groupName=="preload"){
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
            this.createGameScene();
        }

        var stageX = this.stage.stageWidth;
        var stageY = this.stage.stageHeight;
        document.addEventListener('bcready', function () {
            /*var names = ["a", "b"];
            _.each(names, function (name) {
                alert(name);
            });*/
            BC.bluetooth.addEventListener("bluetoothstatechange", function () {
                if (BC.bluetooth.isopen) {
                    alert("your bluetooth has been opened successfully.");
                } else {
                    alert("bluetooth is closed!");
                    BC.Bluetooth.OpenBluetooth(function () { alert("opened!"); });
                }
            });
            BC.bluetooth.addEventListener("newdevice", function (arg) {
                var newDevice: BC.Device = arg.target;
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
                                        y = -y;

                                        ball.x = _fix_pos(ball.x + x * 100,
                                            (0 + ball.width / 2.0), (stageX - ball.width / 2.0));
                                        ball.y = _fix_pos(ball.y + y * 100,
                                            (0 + ball.height / 2.0), (stageY - ball.height / 2.0));
                                        console.log("ball.x:" + ball.x + "ball.y:" + ball.y);
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
            } else {
                BC.Bluetooth.StartScan("LE");
            }
        }, false);
    }

    private onResourceProgress(event:RES.ResourceEvent):void {
        if(event.groupName=="preload"){
            this.loadingView.setProgress(event.itemsLoaded,event.itemsTotal);
        }
    }

    private createGameScene():void{

        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;

        ball = this.createBitmapByName("ball");
        ball.anchorX = ball.anchorY = 0.5;
        this.addChild(ball);
        ball.x = stageW / 2;
        ball.y = stageH / 2 - 60;
        ball.scaleX = 0.55;
        ball.scaleY = 0.55;
    }

    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

}


