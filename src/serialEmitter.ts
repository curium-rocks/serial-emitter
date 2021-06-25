import {BaseEmitter, ICommand, IDataEvent, IExecutionResult, ISettings, ITraceableAction} from '@curium.rocks/data-emitter-base';
import { IStatusEvent } from '@curium.rocks/data-emitter-base/build/src/dataEmitter';
import SerialPort from 'serialport';
import {Transform} from 'serialport';
/**
 * Serial emitter implementation of IDataEmitter
 */
export class SerialEmitter extends  BaseEmitter {
    private lastDataEvent?: IDataEvent;

    /**
     * 
     * @param {SerialPort} serialPort
     * @param {Transform} transform 
     * @param {string} id 
     * @param {string} name 
     * @param {string} desc 
     */
    constructor(private serialPort: SerialPort,  private transform:Transform , id:string, name:string, desc:string) {
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
     * @param {ISettings} settings serial settings etc 
     * @return {Promise<IExecutionResult>} 
     */
    applySettings(settings: ISettings & ITraceableAction): Promise<IExecutionResult> {
        // move up to base, perhaps setup pattern for allowing override or virtualizing
        // need to stop duplicate code
        this.setName(settings.name);
        this.setCommLink(settings.commLink);
        this.setId(settings.id);
        // move out to settings in base
        this.setDCCheckInterval(15000, 12000);
        return Promise.reject(new Error('Method not implemented'));
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
        return {}
    }

}