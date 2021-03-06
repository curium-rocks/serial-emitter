import {BaseEmitter, ICommand, IDataEvent, IExecutionResult} from '@curium.rocks/data-emitter-base';
import { IStatusEvent } from '@curium.rocks/data-emitter-base/build/src/dataEmitter';
import SerialPort from 'serialport';
import {Transform} from 'serialport';
import { SerialPortSettings } from './serialEmitterFactory';
/**
 * Serial emitter implementation of IDataEmitter
 */
export class SerialEmitter extends  BaseEmitter {
    static  TYPE = "SERIAL-EMITTER";
    private lastDataEvent?: IDataEvent;

    /**
     * 
     * @param {SerialPort} serialPort
     * @param {Transform} transform 
     * @param {string} id 
     * @param {string} name 
     * @param {string} desc 
     */
    constructor(private serialPort: SerialPort,  private transform:Transform, id:string, name:string, desc:string, protected settings: SerialPortSettings) {
        super(id, name, desc);
        this.transform.on('data', (chunk) => {
            this.connected();
            const dataEvent = this.buildDataEvent(chunk);
            this.notifyDataListeners(dataEvent);
            this.lastDataEvent = dataEvent;
        });
    }

    /**
     * 
     * @param {ICommand} command 
     * @return {Promise<IExecutionResult>}
     */
    sendCommand(command: ICommand): Promise<IExecutionResult> {
        return new Promise((resolve)=>{
            return this.serialPort.write(command.payload as string, (err) => {
                if(err) return resolve({
                    actionId: command.actionId,
                    success: false
                })
                resolve({
                    actionId: command.actionId,
                    success: true
                });
            
            });
        });
    }
    

    /**
     * @return {unknown}
     */
    getEmitterProperties(): unknown {
        return {
            dataBits: this.settings.dataBits,
            parity: this.settings.parity,
            stopBits: this.settings.stopBits,
            format: this.settings.format,
            baudRate: this.settings.baudRate,
            portName: this.settings.portName
        }
    }

    /**
     * 
     * @return {Promise<IStatusEvent>} 
     */
    probeStatus(): Promise<IStatusEvent> {
        // move up to base
        return Promise.resolve(this.buildStatusEvent());
    }
    
    /**
     * @return {Promise<IDataEvent>}
     */
    probeCurrentData(): Promise<IDataEvent> {
        // move up to base
        if(this.lastDataEvent) return Promise.resolve(this.lastDataEvent);
        return Promise.reject(new Error("No data available yet"));
    }
    
    /**
     * 
     * @return {unknown}
     */
    getMetaData(): unknown {
        return {
            portName: this.settings.portName,
            baudRate: this.settings.baudRate
        }
    }

    /**
     * get the type of the data emitter
     * @return {string}
     */
    getType(): string {
        return  SerialEmitter.TYPE;
    }

}