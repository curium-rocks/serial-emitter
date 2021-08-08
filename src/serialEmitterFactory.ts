import { BaseEmitterFactory, IDataEmitter, IEmitterDescription, IEmitterFactory } from "@curium.rocks/data-emitter-base";
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
export class SerialEmitterFactory extends BaseEmitterFactory {

    protected provider:SerialPortProvider = defaultSerialPortProvider;

    /**
     * Override the default serial port provider as needed
     * @param {SerialDataProvider} serialPortProvider 
     */
    setProvider(serialPortProvider:SerialPortProvider) : void {
        this.provider = serialPortProvider;
    }

    /**
     * 
     * @param {string} reason 
     * @return {Promise<IDataEmitter>} 
     */
    protected validationRejection(reason: string) : Promise<IDataEmitter> {
        return Promise.reject(new Error(reason));
    }
    /**
     * 
     * @param {IEmitterDescription} description
     * @return {Promise<IDataEmitter>} 
     */
    buildEmitter(description: IEmitterDescription): Promise<IDataEmitter> {
        if(description.emitterProperties == null) return this.validationRejection("Missing required emitterProperties");
        const props = description.emitterProperties as Record<string, unknown>;
        if(props == null) return this.validationRejection("emitterProperties in invalid format");
        if(props.dataBits == null) return this.validationRejection("Missing required dataBits property");
        if(props.parity == null) return this.validationRejection("Missing required parity property");
        if(props.stopBits == null) return this.validationRejection("Missing required stopBits property");
        if(props.baudRate == null) return this.validationRejection("Missing required baudRate property");
        if(props.portName == null) return this.validationRejection("Missing required portName property");
        if(props.format == null) return this.validationRejection("Missing required format property");


        const settings: SerialPortSettings = {
            dataBits: props.dataBits as 8 | 7 | 6 | 5 | undefined,
            parity: props.parity as SerialParity,
            stopBits: props.stopBits as number,
            baudRate: props.baudRate as number,
            portName: props.portName as string,
            format: props.format as SerialDataFormat
        };

        return this.build(settings, description.id, description.name, description.description);
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
                this.getTransform(settings.format), id, name, desc, settings));
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