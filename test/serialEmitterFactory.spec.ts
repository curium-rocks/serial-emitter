import { describe, it} from 'mocha';
import { expect } from 'chai';
import { SerialDataFormat, SerialEmitterFactory, SerialParity, SerialPortSettings } from '../src/serialEmitterFactory';
import SerialPort from 'serialport';
import { SerialEmitter } from '../src/serialEmitter';
import * as TypeMoq from "typemoq";


const mockSerialPort = TypeMoq.Mock.ofType<SerialPort>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
SerialEmitterFactory.setProvider((settings:SerialPortSettings) : Promise<SerialPort> => {
    return Promise.resolve(mockSerialPort.object);
})

describe( 'serialEmitterFactory', function() {
    describe( 'getTransform()', function() {
        it( 'Should provide readline for ASCII', function() {
            const transform =  SerialEmitterFactory.getTransform(SerialDataFormat.ASCII_LINES);
            expect(transform).not.to.be.null;
            expect(transform).to.be.instanceOf(SerialPort.parsers.Readline);
        });
    });
    describe('build()', function() {
        it('Should return a serial emitter', async function() {
            const emitter = await SerialEmitterFactory.build({
                portName: '/dev/ttys003',
                baudRate: 9600,
                dataBits: 8,
                parity: SerialParity.NONE,
                stopBits: 2,
                format: SerialDataFormat.ASCII_LINES
            }, 'test', 'test', 'test');

            expect(emitter).not.to.be.null;
            expect(emitter).to.be.instanceOf(SerialEmitter);
        })
    })
});