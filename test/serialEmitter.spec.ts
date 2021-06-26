import { describe, it} from 'mocha';
import * as TypeMoq from "typemoq";
import * as SerialPort from 'serialport';
import { SerialEmitter } from '../src/serialEmitter';
import {Transform} from "stream";

const mockSerialPort = TypeMoq.Mock.ofType<SerialPort>();
const mockTransform = TypeMoq.Mock.ofType<Transform>();

describe( 'serialEmitter', function() {
    describe( 'onData', function() {
        it( 'Should emit data when message received', function() {
            // capture parameters from bind to transform

            const emitter = new SerialEmitter(mockSerialPort.target, mockTransform.target, 'test', 'test', 'test');

            // add emit listener

            // trigger a message

            // inspect result

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
        it('Should allow pass through write to serial port', function() {
            // setup listeners to capture calls
            // verify data would be written to serial port
        })
        it('Should return a failed execution result on error', function() {
            // setup failure in link
            // verify failed execution result in returned promise
        })
    })
    describe('applySettings', function() {
        it('Should set the name, id, description, and d/c threshold', function() {
            // call apply
            // verify new settings
        })
    })
});