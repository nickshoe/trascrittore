const fs = require('fs');
const https = require('https');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const API_KEY = config.api_key;

const imagesFolder = './images/';
const textsFolder = './texts/';

fs.readdirSync(imagesFolder).forEach((fileName) => {
  console.log(fileName);

  var filePath = imagesFolder + fileName;
  fs.open(filePath, 'r', function (status, fd) {
    if (status) {
      console.log(status.message);

      return;
    }

    var data = fs.readFileSync(filePath);

    console.log(filePath + ' converted to base64');

    var queryString = 'key=' + API_KEY;
    var options = {
      'method': 'POST',
      'hostname': 'vision.googleapis.com',
      'path': '/v1/images:annotate?' + queryString,
      'headers': {
        'Content-Type': 'application/json'
      }
    };

    var req = https.request(options, function (res) {
      var chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        var body = Buffer.concat(chunks);

        var responseBody = JSON.parse(body);

        var text = responseBody.responses[0].fullTextAnnotation.text;
        console.log(filePath + ' text extracted');

        var textFileDestPath = textsFolder + fileName + '.txt';
        fs.writeFile(textFileDestPath, text, function (err) {
          if (err) {
            console.error(err);

            return;
          }

          console.log(textFileDestPath + ' text file saved');
        });
      });
    });

    var imageContentBae64 = data.toString('base64');
    req.write(JSON.stringify({
      requests: [{
        image: {
          content: imageContentBae64
        },
        features: [{
          type: 'DOCUMENT_TEXT_DETECTION',
          maxResults: 50
        }]
      }]
    }));

    req.end();
  });
});
