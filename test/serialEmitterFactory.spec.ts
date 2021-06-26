import { describe, it} from 'mocha';
import { expect } from 'chai';
import * as TypeMoq from "typemoq";
import { SerialDataFormat, SerialEmitterFactory, SerialParity } from '../src/serialEmitterFactory';
import * as SerialPort from 'serialport';
import { SerialEmitter } from '../src/serialEmitter';

const mockSerialPort = TypeMoq.Mock.ofType<SerialPort>();

SerialEmitterFactory.setProvider((() => Promise.resolve(mockSerialPort.target)))

describe( 'serialEmitterFactory', function() {
    describe( 'getTransform()', function() {
        it( 'Should provide readline for ASCII', function() {
            const transform =  SerialEmitterFactory.getTransform(SerialDataFormat.ASCII_LINES);
            expect(transform).not.to.be.null;
            expect(transform).to.be.instanceOf(SerialPort.parsers.Readline);
        });
    });
    describe('build()', function() {
        it('Should return a serial emitter',async function() {
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