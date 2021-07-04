# Serial-Emitter
[![Security Rating](https://sonarqube.curium.rocks/api/project_badges/measure?project=serial-emitter&metric=security_rating)](https://sonarqube.curium.rocks/dashboard?id=serial-emitter) [![Coverage](https://sonarqube.curium.rocks/api/project_badges/measure?project=serial-emitter&metric=coverage)](https://sonarqube.curium.rocks/dashboard?id=serial-emitter) [![Quality Gate Status](https://sonarqube.curium.rocks/api/project_badges/measure?project=serial-emitter&metric=alert_status)](https://sonarqube.curium.rocks/dashboard?id=serial-emitter)

## How To Install
`npm install --save @curium.rocks/serial-emitter`
## Example(s)

```typescript
import {SerialDataFormat, SerialEmitterFactory, SerialParity} from "@curium.rocks/serial-emitter";
import {IDataEmitter, IDataEvent} from "@curium.rocks/data-emitter-base";

const factory:SerialEmitterFactory = new SerialEmitterFactory();

const emitter:IDataEmitter = await factory.build({
    portName: '/dev/ttyUSB0',
    dataBits: 8,
    parity: SerialParity.NONE,
    stopBits: 1,
    baudRate: 9600,
    format: SerialDataFormat.ASCII_LINES
}, 'unique-id', 'my-test-serial-port', 'A longer description')

const dataListener = emitter.onData((dataEvent:IDataEvent) => {
    console.log(`data: ${dataEvent.data}, emitted at: ${dataEvent.timestamp}, from: ${dataEvent.emitter.name}`)
})

const statusListener = emitter.onStatus((statusEvent) => {
    console.log(`status: connected = ${statusEvent.connected}, at = ${statusEvent.timestamp}, BIT = ${statusEvent.bit}`);
})

dataListener.dispose();
statusListener.dispose();
```

