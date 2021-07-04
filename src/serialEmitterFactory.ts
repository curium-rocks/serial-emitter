import { IDataEmitter } from "@curium.rocks/data-emitter-base";
import SerialPort from "serialport";
import { Transform } from "stream";
import { SerialEmitter } from "./serialEmitter";


export interface SerialPortProvider {
    (settings:SerialPortSettings): Promise<SerialPort>;
}

const defaultSerialPortProvider = (settings:SerialPortSettings) : Promise<SerialPort> => {
    return new Promise( (resolve, reject) => {
        const serialPort = new SerialPort(settings.portName, {
            dataBits: settings.dataBits,
            parity: 'none',
            baudRate: settings.baudRate,
        }, (err) => {
            if(err) reject(err);
            resolve(serialPort);
        });
    });
}

/**
 * Factory to create
 */
export class SerialEmitterFactory {

    protected provider:SerialPortProvider = defaultSerialPortProvider;

    /**
     * Override the default serial port provider as needed
     * @param {SerialDataProvider} serialPortProvider 
     */
    setProvider(serialPortProvider:SerialPortProvider) : void {
        this.provider = serialPortProvider;
    }

    /**
     * Build a data emitter from the provided serial settings
     * @param {SerialPortSettings} settings 
     * @param {string} id 
     * @param {string} name 
     * @param {string} desc 
     * @return {IDataEmitter} 
     */
    build(settings:SerialPortSettings, id: string, name: string, desc: string): Promise<IDataEmitter> {
        return this.provider(settings).then((sp)=>{
            return(new SerialEmitter(
                sp, 
                this.getTransform(settings.format), id, name, desc));
        })
    }

    /**
     * Gets the appropriate SerialPort Transform for specified
     * data exchange format
     * @param {SerialDataFormat} format 
     * @return {Transform}
     */
    getTransform(format: SerialDataFormat): Transform {
        switch(format) {
            case SerialDataFormat.JSON:
                throw new Error("Not implemented");
            case SerialDataFormat.PROTOBUF:
                throw new Error("Not implemented");
            case SerialDataFormat.RAW:
                return new SerialPort.parsers.ByteLength({
                    length: 2048
                })
            default:
                return new SerialPort.parsers.Readline({
                    encoding: 'utf8',
                    delimiter: '\n',
                    includeDelimiter: false
                })
        }
    }
}

export interface SerialPortSettings {
    dataBits: 8 | 7 | 6 | 5 | undefined;
    parity:  SerialParity;
    baudRate: number;
    stopBits: number;
    portName: string;
    format: SerialDataFormat
}

export enum SerialParity {
    EVEN,
    ODD,
    NONE
}

export enum SerialDataFormat {
    RAW,
    JSON,
    PROTOBUF,
    ASCII_LINES
}