const rpio = require("rpio");

rpio.init({
  gpiomem: true,          /* Use /dev/gpiomem */
  mapping: 'gpio',    /* Use the P1-P40 numbering scheme */
  close_on_exit: true,
})


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const command = {
  steps: [
    {
      pins: [
        {
          pin: 2,
          level: rpio.LOW,
          mode: rpio.OUTPUT,
        },
        {
          pin: 3,
          level: rpio.LOW,
          mode: rpio.OUTPUT,
        },
      ],
      duration: 5000,
    },
    {
      pins: [
        {
          pin: 4,
          level: rpio.LOW,
          mode: rpio.OUTPUT,
        },
      ],
      duration: 2000,
    },
  ],
};

async function runCommand({ steps }) {
  for (const {pins, duration } of steps) {
    for (const pin of pins) {
      rpio.open(pin.pin, pin.mode, pin.level)
    }

    await sleep(duration)

    for (const pin of pins) {
      rpio.close(pin.pin)
    }
  }
}

runCommand(command).then(() => console.log('done'))
