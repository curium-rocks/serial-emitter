import { describe, it} from 'mocha';
import { expect } from 'chai';
import { SerialDataFormat, SerialEmitterFactory } from '../src/serialEmitterFactory';
import SerialPort from 'serialport';

describe( 'serialEmitterFactory', function() {
    describe( 'getTransform()', function() {
        it( 'Should provide readline for ASCII', function() {
            const transform =  SerialEmitterFactory.getTransform(SerialDataFormat.ASCII_LINES);
            expect(transform).not.to.be.null;
            expect(transform).to.be.instanceOf(SerialPort.parsers.Readline);
        });
    });
});