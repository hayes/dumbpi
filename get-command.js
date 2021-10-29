const https = require("https");

function getCommand() {
  console.log('getting command')
  return new Promise((resolve, reject) => {
    const data = new TextEncoder().encode(
      JSON.stringify({
        query: `
          query {
            dumbPiCommand {
              steps {
                pins {
                  mode
                  level
                  pin
                }
                duration
              }
            }
          }
        `,
      })
    );

    const options = {
      hostname: "hanford.page",
      path: "/api/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      const buf = [];

      res.on("error", reject);

      res.on("data", (d) => buf.push(d));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Unexpected status code: ${res.statusCode}`));
        }

        let result
        try {
          result = JSON.parse(Buffer.concat(buf).toString()).data.dumbPiCommand
        } catch (error) {
          return reject(error);
        }

        resolve(result);
      });
    });

    req.on("error", reject);

    req.write(data);
    req.end();
  });
}


module.exports = {
  getCommand
}