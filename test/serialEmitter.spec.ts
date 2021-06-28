import {describe, it} from 'mocha';
import * as TypeMoq from "typemoq";
import SerialPort, {Transform} from 'serialport';
import {SerialEmitter} from '../src/serialEmitter';
import {expect} from 'chai';
import {IDataEvent} from "@curium.rocks/data-emitter-base";

const mockSerialPort = TypeMoq.Mock.ofType<SerialPort>(SerialPort, TypeMoq.MockBehavior.Loose, true, '/dev/test');
const mockTransform = TypeMoq.Mock.ofType<Transform>(SerialPort.parsers.Readline);
mockSerialPort.callBase = false;

interface Callback {
    (chunk: string): void
}

describe( 'serialEmitter', function() {
    describe( 'onData', function() {
        it( 'Should emit data when message received', function() {
            let dataCallback: Callback | null = null;
            mockTransform.setup(a => a.on(TypeMoq.It.isValue<string>('data'), TypeMoq.It.isAny())).callback((str, func)=>{
                dataCallback = func as Callback;
            });

            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            expect(dataCallback).to.not.be.null;
            let dataEvt: IDataEvent | unknown = null;
            emitter.onData({
                onData(dataEvent: IDataEvent) {
                    dataEvt = dataEvent;
                }
            });
            ((dataCallback as unknown) as Callback)('test');
            expect(dataEvt).not.to.be.null;
        });
    });
    describe('onStatus', function () {
        it('Should reconnect on data', function() {
            // add listeners
            let dataCallback: Callback | null = null;
            mockTransform.setup(a => a.on(TypeMoq.It.isValue<string>('data'), TypeMoq.It.isAny())).callback((str, func)=>{
                dataCallback = func as Callback;
            });
            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            let connected = false;
            emitter.onStatus((status) => {
                connected = status.connected;
            })
            expect(dataCallback).to.not.be.null;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dataCallback('test');
            expect(connected).to.be.true;
        })
    })
    describe('sendCommand', function() {
        it('Should allow pass through write to serial port', async function() {
            // setup listeners to capture calls
            let dataWritten: unknown;
            mockSerialPort.setup(a => a.write(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()))
                .callback((data, callback)=>{
                    dataWritten = data;
                    callback(undefined);
                })
            // verify data would be written to serial port
            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            const result = await emitter.sendCommand({
                actionId: 'test5',
                payload: 'test6'
            });
            expect(dataWritten).to.not.be.null;
            expect(dataWritten).to.be.eq('test6');
            expect(result.success).to.be.true;
            expect(result.actionId).to.be.eq('test5');

        })
        it('Should return a failed execution result on error', async function() {
            // setup listeners to capture calls
            mockSerialPort.setup(a => a.write(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()))
                .callback((data, callback)=>{
                    callback(new Error("failed"));
                })
            // verify data would be written to serial port
            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            const result = await emitter.sendCommand({
                actionId: 'test5',
                payload: 'test6'
            });
            expect(result.success).to.be.false;
            expect(result.actionId).to.be.eq('test5');
        })
    })
    describe('probeStatus',  function() {
        it('should be disconnected initially', async function() {
            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            const status = await emitter.probeStatus();
            expect(status.connected).to.be.false;
        })
    })
    describe('probeCurrentData', async function() {
        it('should fail without cached data', async function() {
            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            let error:Error|null = null;
            try {
                await emitter.probeCurrentData();
            } catch (err) {
                error = err;
            }
            expect(error).not.to.be.null;
        })
    })
    describe('applySettings', function() {
        it('Should set the name, id, description, and d/c threshold', async function() {
            // call apply
            const emitter = new SerialEmitter(mockSerialPort.object, mockTransform.object, 'test', 'test', 'test');
            const result = await emitter.applySettings({
                name: 'test2',
                id: 'test3',
                description: 'test4',
                additional: null,
                actionId: 'test5'
            })
            // verify new settings
            expect(result.success).to.be.true;
            expect(result.actionId).to.be.eq('test5');
            expect(emitter.id).to.be.eq('test3');
            expect(emitter.name).to.be.eq('test2');
            expect(emitter.description).to.be.eq('test4');
        })
    })
});