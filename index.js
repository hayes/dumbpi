const rpio = require("rpio");

rpio.init({
  gpiomem: true,
  mapping: 'gpio',
  close_on_exit: true,
})


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


function debounce(fn, ms) {
  let timer;

  return (...args) => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        timer = null;
        
        return fn(...args);
      }, ms)
  }
}

async function waitForButton(pin) {
  console.log('waiting for button')

  rpio.open(pin, rpio.INPUT, rpio.PULL_UP);

  while (true) {
    console.log(rpio.read(pin))
    await (sleep(1000))
  }

  // return new Promise((resolve) => {
  //   rpio.poll(pin, () => {
  //     console.log('button pressed')
  //     if (rpio.read(pin)) {
  //       return
  //     }
              
  //     rpio.poll(pin, null)
  //     rpio.close(pin)
  //     resolve()
  //   }, rpio.POLL_BOTH)
  // })
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

async function main() {
  while (true) {
    await waitForButton(21);
    await runCommand(command);
  }
}

main().then(() => console.log('done'))
