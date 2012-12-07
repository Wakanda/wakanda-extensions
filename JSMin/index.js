include("fulljsmin.js");

exports.handleMessage = function handleMessage(message) {
    if (message.action == 'minify') {
        var original_code = studio.currentEditor.getContent();
        var smaller_code = jsmin(original_code, 2);
        studio.currentEditor.selectFromStartOfText(0, 1000000);
        studio.currentEditor.insertText(smaller_code);
        var ratio = 100 * (smaller_code.length / original_code.length);
        studio.alert('Original size: ' + original_code.length + '\n'
        			   + 'Minified size: ' + smaller_code.length + '\n'
        			   + 'Compression ratio: ' + ratio.toFixed(2) + '%');
    }
    else if (message.action == 'minifyFile') {
        var selectedFiles = studio.currentSolution.getSelectedItems();
        var original_length = 0;
        var smaller_length = 0;
        for (var i = 0; i < selectedFiles.length; i++) {
            var jsFile = selectedFiles[i];
            var filePath = jsFile.path;
            var minifiedPath = filePath.substr(0, filePath.length - jsFile.extension.length - 1);
            minifiedPath += '-min.';
            minifiedPath += jsFile.extension;
            var jsMinifiedFile = File(minifiedPath);
            if (!jsMinifiedFile.exists)
                jsMinifiedFile.create();

            var original_code = jsFile.toString();
            var smaller_code = jsmin(original_code, 2);

            original_length += original_code.length;
            smaller_length += smaller_code.length;

            var stream = new TextStream(jsMinifiedFile, "Overwrite");
            stream.write(smaller_code);
            stream.close();
        }

        var ratio = 100 * (smaller_length / original_length);
        studio.alert('Original size: ' + original_length + '\n'
        			  + 'Minified size: ' + smaller_length + '\n'
        			  + 'Compression ratio: ' + ratio.toFixed(2) + '%');


    }
}
