import { describe, it} from 'mocha';
import * as TypeMoq from "typemoq";
import * as SerialPort from 'serialport';
import { Transform } from 'serialport';
import { SerialEmitter } from '../src/serialEmitter';
import { expect } from 'chai';
import {IDataEvent} from "@curium.rocks/data-emitter-base";

const mockSerialPort = TypeMoq.Mock.ofType<SerialPort>();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockTransform = TypeMoq.Mock.ofInstance<Transform>(SerialPort.parsers.Readline);

interface Callback {
    (chunk: string): void
}

describe( 'serialEmitter', function() {
    describe( 'onData', function() {
        it( 'Should emit data when message received', function() {
            let dataCallback: Callback | null = null;
            mockTransform.setup(a => a.on)
                .callback((cb) => {
                    dataCallback = cb;
                })

            const emitter = new SerialEmitter(mockSerialPort.target, mockTransform.target, 'test', 'test', 'test');
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
        it('Should disconnect when not getting data', function() {
            // set threshold low
            // add listeners
            // capture disconnection event
        })
        it('Should reconnect on data', function() {
            // setup disconnected state
            // add listeners
            // capture connection event
        })
    })
    describe('sendCommand', function() {
        it('Should allow pass through write to serial port', async function() {
            // setup listeners to capture calls
            // verify data would be written to serial port
            const emitter = new SerialEmitter(mockSerialPort.target, mockTransform.target, 'test', 'test', 'test');
            const result = await emitter.sendCommand({
                actionId: 'test5',
                payload: 'test6'
            });
            expect(result.success).to.be.true;
            expect(result.actionId).to.be.eq('test6');

        })
        it('Should return a failed execution result on error', function() {
            // setup failure in link
            // verify failed execution result in returned promise
        })
    })
    describe('applySettings', function() {
        it('Should set the name, id, description, and d/c threshold', async function() {
            // call apply
            const emitter = new SerialEmitter(mockSerialPort.target, mockTransform.target, 'test', 'test', 'test');
            const result = await emitter.applySettings({
                name: 'test2',
                id: 'test3',
                commLink: 'test4',
                additional: null,
                actionId: 'test5'
            })
            // verify new settings
            expect(result.success).to.be.true;
            expect(result.actionId).to.be.eq('test5');
            expect(emitter.id).to.be.eq('test3');
            expect(emitter.name).to.be.eq('test2');
            expect(emitter.commLinkDesc).to.be.eq('test4');
        })
    })
});