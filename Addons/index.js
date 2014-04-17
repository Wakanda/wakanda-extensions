/* Copyright (c) 4D, 2014
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 *
 * @namespace Extension
 */

var WAM_BASE = 'http://addons.wakanda.org/';

/**
 * @class actions
 * @type {object}
 */
actions = {};

/**
 * Activates logging for the Extension side.
 * Studio.alert(...) sometimes crashes so we are outputting the debug messages to a file as an alternative.
 * @memberof Extension
 * @type {boolean}
 */
var DEBUGMODE = false;

/**
 *
 * @memberof Extension
 * @param src {string} Path of the folder that will be copied.
 * @param dest {string} Destination path.
 * @param filter {RegularExpression} Regular expression matching the files that must be ignored during the copy.
 * @returns {boolean} True if copy was successful.
 */
function copyFolder(src, dest, filter) {
    var source = Folder(src);
    var files = source.files;
    var i;

    if (filter) {
        i = 0;
        while (i < files.length) {
            if (files[i].extension.match(filter)) {
                i++;
            } else {
                files.splice(i, 1);
            }
        }
    }

    var isFolderVoid = (files.length === 0);
    var isSubFoldersVoid = true;

    // condition d'arret
    if (source.folders.length === 0) {
        if (!isFolderVoid) {
            Folder(dest).create();
            i = 0;

            while (i < files.length) {
                files[i].copyTo(new File(dest + files[i].name), true);
                i++;
            }
            return false;

        } else {
            return true;
        }
    } else {

        source.forEachFolder(function (sub) {
            isSubFoldersVoid = copyFolder(sub.path, dest + sub.name + "/", filter) && isSubFoldersVoid ;
        });
        if (isSubFoldersVoid && !isFolderVoid) {
            Folder(dest).create();
        }

    }
    i = 0;
    while (i < files.length) {
        files[i].copyTo(new File(dest + files[i].name), true);
        i++;
    }

    return isSubFoldersVoid && isFolderVoid;
}

/**
 * @memberof Extension
 * Unzips the specified file in the same folder & renames the github named folder to the standard name expected by the studio (add-on name).
 * @param file {string} Path of the file to unzip.
 * @param addonID {string} ID of the add-on.
 * @param addonName {string} Name of the add-on.
 * @returns {boolean} True if succesful.
 */
function unzip(file, addonID, addonName) {
    var result, command, fileLocation = file.substr(0, file.lastIndexOf('/'));	if(addonName&&Folder(fileLocation+'/'+addonName).exists) {	Folder(fileLocation+'/'+addonName).remove();
     }
    if (os.isWindows) {
        var zipItLoaction = studio.extension.getFolder().path + "resources/zipit";
        zipItLoaction = zipItLoaction.replace(/\//g, "\\");
        var fileWin = file.replace(/\//g, "\\");
        var fileLocationWin = fileLocation.replace(/\//g, "\\");		
        command = 'cmd /c "' + zipItLoaction + '\\Unzip.exe" ' + fileWin + ' -d ' + fileLocationWin + ' && cd ' + fileLocationWin + ' && move ' + addonName + '-* ' + addonName + '';
        result = SystemWorker.exec(command);

        // Sandboxed mode (not working)
        //command = fileWin + ' -d ' + fileLocationWin + '\\' + addonName;
        //result = SystemWorker.exec('unzip', command, '', null, null);

        if (!result) {
            return false;
        }
    } else {			
        command = 'bash -c \'cd \"' + fileLocation + '\" ; unzip \"' + file + '\" ; mv ' + addonName + '-* ' + addonName + '\'';
        result = SystemWorker.exec(command);

        // Sandboxed mode (needs the unzip.sh & adding it to the SystemWorkers.json)
        //command = fileLocation + '/ ' + file.substr(file.lastIndexOf('/')+1) + ' ' + addonName;
        //result = SystemWorker.exec('unzip', command, '', null, null);

        if (!result) {
            return false;
        }
    }
    return true;
}


/**
 * Returns the root folder on the disk where a specific type of add-on is stored.
 * @memberof Extension
 * @param addonType {string}
 * @returns {string} Add-on root folder.
 */
function getAddonsRootFolder(addonType) {
    var rootAddonsFolder = '';

    switch (addonType) {
    case 'wakanda-themes':
        rootAddonsFolder = FileSystemSync('THEMES_CUSTOM');
        break;

    case 'wakanda-widgets':
        rootAddonsFolder = FileSystemSync('WIDGETS_CUSTOM');
        break;

    case 'wakanda-extensions':
        rootAddonsFolder = FileSystemSync('EXTENSIONS_USER');
        break;

    case 'wakanda-modules':
        rootAddonsFolder = Folder(studio.extension.storage.getItem('projectpath') + 'modules/');
        break;

    case 'wakandadb-drivers':
        rootAddonsFolder = Folder(studio.extension.storage.getItem('projectpath') + 'drivers/');
        break;
    }

    return rootAddonsFolder;
}

/**
 * Downloads an add-on from github and unzips it in the path expected by Wakanda Studio.
 * The errors are store in studio.extension.storage.getItem('ERROR') so they may be accessed from the extension's UI.
 * @memberof Extension
 * @param addonParams {object} Object containing the add-on's description.
 * @returns {boolean} True if successful.
 */
function loadAddon(addonParams) {
    var xmlHttp, theFile, zipUrl;
    var rootAddonsFolder = getAddonsRootFolder(addonParams.type);

    try {

        zipUrl = (addonParams.zip_url) ? addonParams.zip_url : WAM_BASE + 'download?id=' + addonParams.ID;

        xmlHttp = new studio.XMLHttpRequest();
        xmlHttp.open('GET', zipUrl, true);

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4) {
                if ([301, 302, 303, 307, 308].indexOf(xmlHttp.status) > -1) {
                    addonParams.zip_url = xmlHttp.getResponseHeader('Location');
                    return loadAddon(addonParams);
                }

                if (xmlHttp.status !== 200 || !xmlHttp.response || !xmlHttp.response.size) {
                    studio.extension.storage.setItem('ERROR', 'Add-on cannot be found');
                    return;
                }

                try {
                    Folder(rootAddonsFolder.path.substring(0, rootAddonsFolder.path.length - 1)).create();

                    theFile = File(rootAddonsFolder.path + "tmp.zip");

                    if (theFile.exists) {
                        theFile.remove();
                    }
                } catch (e) {
                    studio.alert(e.message);
                    return;
                }

                try {

                    xmlHttp.response.copyTo(theFile);

                    if (!unzip(theFile.path, addonParams.ID, addonParams.name)) {
                        studio.alert("error while unzipping");
                        theFile.remove();
                        return;
                    }

                    theFile.remove();

                    var jsonFile = File(rootAddonsFolder.path + addonParams.name + '/package.json');

                    if (!jsonFile.exists) {
                        jsonFile.create();
                        saveText('{}', jsonFile);
                    }

                    var parsed = JSON.parse(jsonFile);
                    parsed.hash = addonParams.hash;

                    saveText(JSON.stringify(parsed), jsonFile.path);
                    if (addonParams.type === 'wakanda-extensions') {
                        studio.extension.storage.setItem(addonParams.name, 'Restart');
                        studio.alert('Wakanda Studio needs to be restarted to complete the installation of this extension. It will be available the next time the Studio starts.');
                    }

                } catch (e) {
                    studio.alert(e.message);
                    return;
                }

                studio.extension.storage.setItem('ERROR', 'ok');
            }
        };
        xmlHttp.responseType = 'blob';
        xmlHttp.send();

    } catch (e) {
        return false;
    }
    return studio.extension.storage.getItem('ERROR') === 'OK';
}

/**
 * Writes a message to a log file. For debugging purposes only : this method does nothing when DEBUGMODE is active.
 * @memberof Extension
 * @param pluginName {string}
 * @param pluginType {string}
 * @param text {string}
 */
function writeLog(pluginName, pluginType, text) {
    if (DEBUGMODE) {
        var logFile = File(FileSystemSync('EXTENSIONS_USER').path + 'log.txt');
        var rootAddonsFolder = getAddonsRootFolder(pluginType);

        if (!logFile.exists) {
            logFile.create();
        }
        saveText(logFile + Folder(rootAddonsFolder.path + pluginName).path + ' (' + pluginType + ') : ' + text + '\n', logFile.path);
    }
}

/**
 * Fetches the value of an add-on's parameter from its data object representation.
 * @memberof Extension
 * @param paramName {string}
 * @returns {string} The value of the specified parameter for this add-on.
 */
function getAddonParam(paramName) {
    var addonParams = JSON.parse(unescape(studio.extension.storage.getItem('addonParams')));

    return addonParams[paramName];
}


/**
 * Makes a backup of the add-on that is currently passed in the storage.
 * The backup will be stored inside the backup subfolder of the root folder defined by the add-on's type.
 */
actions.backup = function backup() {
    //var addonParams = JSON.parse(unescape(studio.extension.storage.getItem('addonParams')));
    var pluginName = getAddonParam('name');
    var pluginType = getAddonParam('type');
    var rootAddonsFolder = getAddonsRootFolder(pluginType);

    copyFolder(rootAddonsFolder.path + pluginName, rootAddonsFolder.path + '_old-installed-'+pluginType+'/' + pluginName + '-' + (new Date()).getTime() + '/');
    Folder(rootAddonsFolder.path + pluginName).remove();
};


/**
 * Updates the status of the add-on that is currently passed in the storage.
 * Possible values : 'Install', 'Restart', 'Upgrade' & 'Installed'.
 * If the status was previously set to Restart by the download system, the status change will be ignored until Wakanda Studio is restarted.
 */
actions.check = function check() {
    var pluginName = getAddonParam('name');
    var pluginType = getAddonParam('type');
    var pluginHash = getAddonParam('hash');

    var rootAddonsFolder = getAddonsRootFolder(pluginType);

    if (!Folder(rootAddonsFolder.path + pluginName).exists) {
        writeLog(pluginName, pluginType, Folder(rootAddonsFolder.path + pluginName).path + ' exists : ' + Folder(rootAddonsFolder.path + pluginName).exists);
        studio.extension.storage.setItem(pluginName, 'Install');
    } else {
        writeLog(pluginName, pluginType, 'Add-on folder exists');

        var jsonFile = File(rootAddonsFolder.path + pluginName + '/package.json');

        try {
            var parsed;

            parsed = (jsonFile.exists) ? JSON.parse(jsonFile) : {};
        } catch (e) {
            studio.extension.storage.setItem('ERROR', 'Add-on ' + pluginName + ' has an invalid package.json.');
            studio.extension.storage.setItem(pluginName, '');
            return '';
        }

        if (typeof (parsed.hash) === 'undefined' || pluginHash === parsed.hash) {
            writeLog(pluginName, pluginType, 'same hash');

            if (studio.extension.storage.getItem(pluginName) !== 'Restart') {
                studio.extension.storage.setItem(pluginName, 'Installed');
            }
        } else {
            writeLog(pluginName, pluginType, 'different hash');

            studio.extension.storage.setItem(pluginName, 'Upgrade');
        }
    }

    writeLog(pluginName, pluginType, studio.extension.storage.getItem(pluginName));
};

/**
 * Triggers the download of an add-on. The add-on's definition must be passed in the storage with the key 'addonParams'.
 * @returns {boolean}
 */
actions.downloadExt = function downloadExt() {
    var addonParams = JSON.parse(unescape(studio.extension.storage.getItem('addonParams')));
    var pluginName = getAddonParam('name');
    var pluginType = getAddonParam('type');

    if (pluginType === 'wakanda-extensions') {
        studio.extension.storage.setItem(pluginName, 'Restart');
    }

    writeLog(pluginName, pluginType, 'Downloaded');

    return loadAddon(addonParams);
};

exports.handleMessage = function handleMessage(message) {
    'use strict';
    var actionName;

    actionName = message.action;

    if (!actions.hasOwnProperty(actionName)) {
        if (DEBUGMODE) {
            studio.alert('I don\'t know about this message: ' + actionName + message.source.data);
        }

        return false;
    } else {
        actions[actionName](message);
    }
};


/**
 * Displays the extension's main UI in a modal dialog window.
 */
actions.showDialog = function showDialog() {
    'use strict';

    studio.extension.showModalDialog(
        'addons.html',
        '', {
            title: 'Wakanda Studio',
            dialogwidth: 970,
            dialogheight: 900,
            resizable: false
        },
        '');		 // studio.extension.openPageInTab('./addons.html','Add-ons Extension',false);
};

/**
 * Displays an alert with the extension's interface. The content must be passed in the storage with the key 'alertMessage'.
 */
actions.alert = function alert() {
    studio.alert(studio.extension.storage.getItem('alertMessage'));
    studio.extension.storage.setItem('alertMessage', '');
};