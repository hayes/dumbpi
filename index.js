const rpio = require("rpio");
const { getCommand } = require("./get-command");

rpio.init({
  gpiomem: true,
  mapping: "gpio",
  close_on_exit: true,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function debounce(fn, ms) {
  let timer;

  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;

      return fn(...args);
    }, ms);
  };
}

async function waitForButton(pin) {
  rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
  console.log("waiting for button");

  return new Promise((resolve) => {
    rpio.poll(
      pin,
      () => {
        rpio.msleep(50);
        if (rpio.read(pin)) {
          return;
        }

        rpio.poll(pin, null);
        rpio.close(pin);
        resolve();
      },
      rpio.POLL_LOW
    );
  });
}

async function runCommand({ steps }) {
  for (const { pins, duration } of steps) {
    for (const pin of pins) {
      rpio.open(pin.pin, pin.mode, pin.level);
    }

    await sleep(duration);

    for (const pin of pins) {
      rpio.close(pin.pin);
    }
  }
}

async function main() {
  while (true) {
    await waitForButton(21);

    try {
      const command = await getCommand()
      console.log('running command')
      console.log(JSON.stringify(command, null, 2))
      await runCommand(command);
    } catch (error) {
      console.error(error)
    }
  }
}

main().then(() => console.log("done"));
