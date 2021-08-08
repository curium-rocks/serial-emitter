import { describe, it} from 'mocha';
import { expect } from 'chai';
import * as TypeMoq from "typemoq";
import { SerialDataFormat, SerialEmitterFactory, SerialParity } from '../src/serialEmitterFactory';
import * as SerialPort from 'serialport';
import { SerialEmitter } from '../src/serialEmitter';
import { IDataEmitter, IEmitterDescription, IFormatSettings, ProviderSingleton } from '@curium.rocks/data-emitter-base';
import crypto from 'crypto';

const mockSerialPort = TypeMoq.Mock.ofType<SerialPort>();
const serialEmitterFactory = new SerialEmitterFactory();
serialEmitterFactory.setProvider((() => Promise.resolve(mockSerialPort.target)))

const specification: IEmitterDescription = {
    id: 'test-id',
    description: 'test-desc',
    name: 'test-name',
    type: SerialEmitter.TYPE,
    emitterProperties: {
        portName: 'test',
        baudRate: 9600,
        stopBits: 2,
        parity: SerialParity.NONE,
        dataBits: 8,
        format: SerialDataFormat.ASCII_LINES
    }
};

/**
 * 
 * @param {IDataEmitter} emitter 
 */
function validateEmitter(emitter : IDataEmitter ) : void {
    expect(emitter).to.be.instanceOf(SerialEmitter);
    const serialEmitter = emitter as SerialEmitter;
    expect(serialEmitter.id).to.be.eq(specification.id);
    expect(serialEmitter.name).to.be.eq(specification.name);
    expect(serialEmitter.description).to.be.eq(specification.description);
    const metaData = serialEmitter.getMetaData() as Record<string, unknown>;
    const props = specification.emitterProperties as Record<string, unknown>;
    expect(metaData.portName).to.be.eq(props.portName);
    expect(metaData.baudRate).to.be.eq(props.baudRate);
}

ProviderSingleton.getInstance().registerEmitterFactory(SerialEmitter.TYPE, serialEmitterFactory);
describe( 'serialEmitterFactory', function() {
    describe( 'getTransform()', function() {
        it( 'Should provide readline for ASCII', function() {
            const transform =  serialEmitterFactory.getTransform(SerialDataFormat.ASCII_LINES);
            expect(transform).not.to.be.null;
            expect(transform).to.be.instanceOf(SerialPort.parsers.Readline);
        });
    });
    describe('buildEmitter()', function() {
        it('Should return a serial emitter matching specifications', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(specification);
            validateEmitter(emitter);
        });
    });
    describe('recreateEmitter()', function() {
        it('Should recreate from plain text state', async function () {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(specification);
            validateEmitter(emitter);
            const formatSettings : IFormatSettings = {
                encrypted: false,
                type: SerialEmitter.TYPE
            }
            const state = await emitter.serializeState(formatSettings);
            const recreatedEmitter = await ProviderSingleton.getInstance().recreateEmitter(state, formatSettings);
            validateEmitter(recreatedEmitter);
        });
        it('Should recreate from aes-256-gcm cipher text', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(specification);
            validateEmitter(emitter);
            const formatSettings : IFormatSettings = {
                encrypted: true,
                type: SerialEmitter.TYPE,
                algorithm: 'aes-256-gcm',
                key: crypto.randomBytes(32).toString('base64'),
                iv: crypto.randomBytes(64).toString('base64')
            }
            const state = await emitter.serializeState(formatSettings);
            const recreatedEmitter = await ProviderSingleton.getInstance().recreateEmitter(state, formatSettings);
            validateEmitter(recreatedEmitter);
        });
    });
    describe('build()', function() {
        it('Should return a serial emitter',async function() {
             const emitter = await serialEmitterFactory.build({
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