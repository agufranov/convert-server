var express = require('express');
var request = require('request');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var unoconv = require('unoconv-stdout-fix');
var exec = require('child_process').exec;

var app = express();

app.use(multer({ dest: './uploads' }));

app.use(express.static(__dirname + '/uploads'))

var pdf2png = function(pdfPath, cb) {
    var pdfDir = path.resolve(path.dirname(pdfPath));
    var id = path.basename(pdfPath, path.extname(pdfPath));
    var imagesDir = path.join(pdfDir, id);
    console.log('pdfDir:', pdfDir);
    console.log('imagesDir:', imagesDir);
    fs.mkdir(imagesDir, function() {
        console.log('mkdir', arguments);
        exec('convert -resize 1200 -density 200 ' + pdfPath + ' ' + path.join(imagesDir, '%01d.png'), function(error, stdout, stderr) {
            console.log('converted');
            fs.unlink(pdfPath, function() {
                console.log('unlink', arguments);
                count = fs.readdirSync(imagesDir).length;
                cb({ count: count, id: id });
            });
        });
    });
};

app.post('/', function(req, res) {
    var file = req.files.file;
    pdf2png(file.path, function(data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        console.log('data', data);
        setTimeout(function() {
            res.end(JSON.stringify(data));
        }, 3000);
    });
    // unoconv.convert(file.path, 'pdf', {}, function(err, result) {
    //     console.log(arguments);
    //     if(err) {
    //         res.writeHead(500, { 'Content-Type': 'text/plain' });
    //         res.end('unoconv error');
    //     }
    //     else {
    // //     }
    // });
});

// app.get('/:id/:file', function(req, res) {
//     var id = req.params.id;
//     var file = req.params.file;
//     var imgDir = path.join('uploads', id);
//     if(fs.existsSync(imgDir)) {
//         file = '000' + file;
//         var imgFilename = path.join(imgDir, file.slice(file.length - 3) + '.png');
//         if(fs.existsSync(imgFilename)) {
//             console.log('exists', imgFilename);
//             res.writeHead(200, { 'Content-Type': 'image/png' });
//             fs.createReadStream(imgFilename).pipe(res);
//         }
//         else {
//             console.log('NOT EXISTS', imgFilename);
//             res.writeHead(404);
//             res.end('Not found');
//         }
//     }
//     else {
//         res.writeHead(404);
//         res.end('Not found');
//     }
// });

var server = app.listen(8090);
