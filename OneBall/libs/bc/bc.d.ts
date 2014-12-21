declare module BC {
    class EventDispatcher {
        addEventListener(type: string, listener: Function): void;
        removeEventListener(type: string): void;
        removeAllEventListener(): void;
        dispatchEvent(type:string, arg?:Object): void;
        hasEventListener(type:string):boolean;
    }

    class GATTEntity extends EventDispatcher{
        constructor(arg: Object);
        index: number;
        uuid: string;
        name: string;
        upper: GATTEntity;
        device: Device;
    }

    class Service extends GATTEntity {
        constructor(arg: Object);
        characteristics:Characteristic[];
        discoverCharacteristics(successFunc: Function, errorFunc: Function): void;
        getCharacteristicByUUID(uuid:string):Characteristic[];
    }

    class Characteristic extends GATTEntity {
        constructor(arg: Object);
        descriptors:Descriptor[];
        discoverDescriptors(successCallback: Function, errorCallback: Function): void;
        getDescriptorByUUID(uuid:string):Descriptor[];
        notify(type:string, value:string, successCallback:Function, errorCallback:Function):void;
        read(successCallback:Function, errorCallback:Function):void;
        subscribe(callback:Function):void;
        unsubscribe(successCallback: Function, errorCallback: Function):void;
        write(type:string, value:string, successCallback:Function, errorCallback:Function):void;

    }

    class Descriptor extends GATTEntity {
        constructor(arg: Object);
        read(successCallback:Function, errorCallback:Function):void;
    }

    class Device extends EventDispatcher {
        constructor(arg: Object);
        deviceAddress:string;
        deviceName: string;
        advertisementData:Object;
        isConnected:boolean;
        RSSI:number;
        services:Service[];
        isPrepared:boolean;
        connectSuccessCallback:Function;
        systemID: string;
        modelNum: string;
        serialNum: string;
        firmwareRevision: string;
        hardwareRevision: string;
        softwareRevision: string;
        manufacturerName: string;
        type: string;

        connect(successCallback: Function, errorCallback: Function, uuid?:string, secure?:boolean):void;
        createPair(successCallback: Function, errorCallback: Function): void;
        disconnect(successCallback: Function, errorCallback: Function): void;
        discoverServices(successCallback: Function, errorCallback: Function): void;
        getDeviceInfo(successCallback: Function, errorCallback: Function): void;
        getRSSI(successCallback: Function, errorCallback: Function): void;
        getServiceByUUID(uuid:string): Service[];
        prepare(successCallback: Function, errorCallback: Function): void;
        removePair(successCallback: Function, errorCallback: Function): void;
        rfcommRead(successCallback: Function, errorCallback: Function): void;
        rfcommSubscribe(callback: Function): void;
        rfcommUnsubscribe(): void;
        rfcommWrite(type: string, value: string, successCallback: Function, errorCallback: Function): void;
    }

    class DataValue {
        constructor(value: ArrayBuffer);
        value:ArrayBuffer;
        append(dataValue:DataValue): DataValue;
        getASCIIString(): string;
        getHexString(): string;
        getUnicodeString(): string;
    }

    class Bluetooth {
        static StartScan(type?: string): void;
        static StopScan(): void;
        static OpenBluetooth(successFunc: Function, errorFunc?:Function): void;
        static CloseBluetooth(successFunc: Function, errorFunc?: Function): void;
    }

    class bluetooth{
        static addEventListener(type: string, listener: Function): void;
        static isopen : boolean;
    }
}

declare module "bc" {
    export = BC;
}