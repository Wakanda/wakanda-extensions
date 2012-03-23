/* Copyright (c) 4D, 2012
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

include("scripts/jslint.js");

var
	actions;

actions = {};

actions.cleanErrors = function cleanErrors(message) {
	studio.currentEditor.clearAnnotations();
	return true;
}

actions.checkError = function checkError() {
	var
		fileContent;
	var
		result;
	var
		option;
	var
		JSLintErrors;

	studio.currentEditor.clearAnnotations();
	option = getOptFromPref();
	fileContent = studio.currentEditor.getContent();
	result = JSLINT(fileContent, option);
	JSLintErrors = 0;
	
	if (result == false) {
		var count;
		var stoooop = false;
		try {
			for (count = 0; count < JSLINT.errors.length && !stoooop ; count++) {
				if (count !== JSLINT.errors.length && JSLINT.errors[count+1] === null) {
					stoooop = true;
				}
				var lineNumber = JSLINT.errors[count].line;
				var errorMsg = JSLINT.errors[count].reason;
				studio.currentEditor.setAnnotation(lineNumber - 1, errorMsg);
				JSLintErrors++;
			}
		}
		catch(e) {
			studio.alert(e.message);
		}
	}
	
	if (typeof option.wkd_showResultDlg !== 'undefined' && option.wkd_showResultDlg)
	{
		if (JSLintErrors !== 0) {
			studio.alert("There are " + JSLINT.errors.length + " JSLint warnings");
		} else {
			studio.alert("Congratulation!\nYour javascript is valided by JSLint.");
		}
	}
	/* V2!!!
	else {
		
		var myData = JSLINT.data();
		var report = '';
		report += 'Global: ';

		for (var i = 0; i < myData.globals.length ; i++) {
			report += myData.globals[i];
			report += ' ';
		}

		studio.alert(report);
	}
	*/
};

function getOptFromPref() {
	var option = {};

	var	maxerr = studio.extension.getPref("maxerr");
	if (maxerr !== "") {
		var re = new RegExp("[0-9]+");
		
		if (maxerr.match(re)) {
			option.maxerr = parseInt(maxerr, 10);
		}
	}
	
	var	maxlen = studio.extension.getPref("maxlen");
	if (maxlen !== "") {
		var re = new RegExp("[0-9]+");
		if (maxlen.match(re)) {
			option.maxlen = parseInt(maxlen, 10);
		}
	}
	
	var indent = studio.extension.getPref("indent");
	if (indent !== "") {
		var re = new RegExp("[0-9]+");
		if (indent.match(re)) {
			option.indent = parseInt(indent, 10);
		}
	}


	var predefString = studio.extension.getPref('predefString');
	if (predefString !== '') {
		option.predefString = predefString;
		option.predef = predefString.split(',');
	}

	var devel = studio.extension.getPref('devel');
	if (devel !== '' && (devel === 'true' || devel === 'false'))
		option.devel = (devel === 'true');

	var browser = studio.extension.getPref('browser');
	if (browser !== '' && (browser === 'true' || browser === 'false'))
		option.browser = (browser === 'true');

	var node  = studio.extension.getPref('node');
	if (node !== '' && (node === 'true' || node === 'false'))
		option.node = (node === 'true');

	var rhino = studio.extension.getPref('rhino');
	if (rhino !== '' && (rhino === 'true' || rhino === 'false'))
		option.rhino = (rhino === 'true');

	var widget = studio.extension.getPref('widget');
	if (widget !== '' && (widget === 'true' || widget === 'false'))
		option.widget = (widget === 'true');

	var windows = studio.extension.getPref('windows');
	if (windows !== '' && (windows === 'true' || windows === 'false'))
		option.windows = (windows === 'true');

	var passfail = studio.extension.getPref('passfail');
	if (passfail !== '' && (passfail === 'true' || passfail === 'false'))
		option.passfail = (passfail === 'true');

	var safe = studio.extension.getPref('safe');
	if (safe !== '' && (safe === 'true' || safe === 'false'))
		option.safe = (safe === 'true');

	var adsafe = studio.extension.getPref('adsafe');
	if (adsafe !== '' && (adsafe === 'true' || adsafe === 'false'))
		option.adsafe = (adsafe === 'true');

	var bitwise = studio.extension.getPref('bitwise');
	if (bitwise !== '' && (bitwise === 'true' || bitwise === 'false'))
		option.bitwise = (bitwise === 'true');

	var _continue = studio.extension.getPref('continue');
	if (_continue !== '' && (_continue === 'true' || _continue === 'false'))
		option.continue = (_continue === 'true');

	var debug = studio.extension.getPref('debug');
	if (debug !== '' && (debug === 'true' || debug === 'false'))
		option.debug = (debug === 'true');

	var eqeq = studio.extension.getPref('eqeq');
	if (eqeq !== '' && (eqeq === 'true' || eqeq === 'false'))
		option.eqeq = (eqeq === 'true');

	var es5 = studio.extension.getPref('es5');
	if (es5 !== '' && (es5 === 'true' || es5 === 'false'))
		option.es5 = (es5 === 'true');

	var evil = studio.extension.getPref('evil');
	if (evil !== '' && (evil === 'true' || evil === 'false'))
		option.evil = (evil === 'true');

	var forin = studio.extension.getPref('forin');
	if (forin !== '' && (forin === 'true' || forin === 'false'))
		option.forin = (forin === 'true');

	var newcap = studio.extension.getPref('newcap');
	if (newcap !== '' && (newcap === 'true' || newcap === 'false'))
		option.newcap = (newcap === 'true');

	var nomen = studio.extension.getPref('nomen');
	if (nomen !== '' && (nomen === 'true' || nomen === 'false'))
		option.nomen = (nomen === 'true');

	var plusplus = studio.extension.getPref('plusplus');
	if (plusplus !== '' && (plusplus === 'true' || plusplus === 'false'))
		option.plusplus = (plusplus === 'true');

	var regexp = studio.extension.getPref('regexp');
	if (regexp !== '' && (regexp === 'true' || regexp === 'false'))
		option.regexp = (regexp === 'true');

	var undef = studio.extension.getPref('undef');
	if (undef !== '' && (undef === 'true' || undef === 'false'))
		option.undef = (undef === 'true');

	var unparam = studio.extension.getPref('unparam');
	if (unparam !== '' && (unparam === 'true' || unparam === 'false'))
		option.unparam = (unparam === 'true');

	var sloppy = studio.extension.getPref('sloppy');
	if (sloppy !== '' && (sloppy === 'true' || sloppy === 'false'))
		option.sloppy = (sloppy === 'true');

	var sub = studio.extension.getPref('sub');
	if (sub !== '' && (sub === 'true' || sub === 'false'))
		option.sub = (sub === 'true');

	var vars = studio.extension.getPref('vars');
	if (vars !== '' && (vars === 'true' || vars === 'false'))
		option.vars = (vars === 'true');

	var white = studio.extension.getPref('white');
	if (white !== '' && (white === 'true' || white === 'false'))
		option.white = (white === 'true');

	var css = studio.extension.getPref('css');
	if (css !== '' && (css === 'true' || css === 'false'))
		option.css = (css === 'true');

	var cap = studio.extension.getPref('cap');
	if (cap !== '' && (cap === 'true' || cap === 'false'))
		option.cap = (cap === 'true');

	var on = studio.extension.getPref('on');
	if (on !== '' && (on === 'true' || on === 'false'))
		option.on = (on === 'true');

	var fragment = studio.extension.getPref('fragment');
	if (fragment !== '' && (fragment === 'true' || fragment === 'false'))
		option.fragment = (fragment === 'true');


	// Non-jslint settings
	var wkd_showResultDlg = studio.extension.getPref('wkd_showResultDlg');
	if (wkd_showResultDlg !== '' && (wkd_showResultDlg === 'true' || wkd_showResultDlg === 'false'))
		option.wkd_showResultDlg = (wkd_showResultDlg === 'true');
	
	return option;
}

function writeOptToPref(option) {
	
	if (typeof option.maxerr !== 'undefined')
		studio.extension.setPref("maxerr", option.maxerr);

	if (typeof option.maxlen !== 'undefined')
		studio.extension.setPref("maxlen", option.maxlen);

	if (typeof option.indent !== 'undefined')
		studio.extension.setPref("indent", option.indent);


	if (typeof option.predefString !== 'undefined')
		studio.extension.setPref("predefString", option.predefString);
		
		
	if (typeof option.devel !== 'undefined')
		studio.extension.setPref("devel", option.devel);

	if (typeof option.browser !== 'undefined')
		studio.extension.setPref("browser", option.browser);

	if (typeof option.node !== 'undefined')
		studio.extension.setPref("node", option.node);

	if (typeof option.rhino !== 'undefined')
		studio.extension.setPref("rhino", option.rhino);

	if (typeof option.widget !== 'undefined')
		studio.extension.setPref("widget", option.widget);

	if (typeof option.windows !== 'undefined')
		studio.extension.setPref("windows", option.windows);

	if (typeof option.passfail !== 'undefined')
		studio.extension.setPref("passfail", option.passfail);

	if (typeof option.safe !== 'undefined')
		studio.extension.setPref("safe", option.safe);

	if (typeof option.adsafe !== 'undefined')
		studio.extension.setPref("adsafe", option.adsafe);

	if (typeof option.bitwise !== 'undefined')
		studio.extension.setPref("bitwise", option.bitwise);

	if (typeof option.continue !== 'undefined')
		studio.extension.setPref("continue", option.continue);

	if (typeof option.debug !== 'undefined')
		studio.extension.setPref("debug", option.debug);

	if (typeof option.eqeq !== 'undefined')
		studio.extension.setPref("eqeq", option.eqeq);

	if (typeof option.es5 !== 'undefined')
		studio.extension.setPref("es5", option.es5);

	if (typeof option.evil !== 'undefined')
		studio.extension.setPref("evil", option.evil);

	if (typeof option.forin !== 'undefined')
		studio.extension.setPref("forin", option.forin);

	if (typeof option.newcap !== 'undefined')
		studio.extension.setPref("newcap", option.newcap);

	if (typeof option.nomen !== 'undefined')
		studio.extension.setPref("nomen", option.nomen);

	if (typeof option.plusplus !== 'undefined')
		studio.extension.setPref("plusplus", option.plusplus);

	if (typeof option.regexp !== 'undefined')
		studio.extension.setPref("regexp", option.regexp);

	if (typeof option.undef !== 'undefined')
		studio.extension.setPref("undef", option.undef);

	if (typeof option.unparam !== 'undefined')
		studio.extension.setPref("unparam", option.unparam);
	
	if (typeof option.sloppy !== 'undefined')
		studio.extension.setPref("sloppy", option.sloppy);

	if (typeof option.sub !== 'undefined')
		studio.extension.setPref("sub", option.sub);
		
	if (typeof option.vars !== 'undefined')
		studio.extension.setPref("vars", option.vars);

	if (typeof option.white !== 'undefined')
		studio.extension.setPref("white", option.white);
	
	if (typeof option.css !== 'undefined')
		studio.extension.setPref("css", option.css);

	if (typeof option.css !== 'undefined')
		studio.extension.setPref("css", option.css);
		
	if (typeof option.cap !== 'undefined')
		studio.extension.setPref("cap", option.cap);

	if (typeof option.on !== 'undefined')
		studio.extension.setPref("on", option.on);
	
	if (typeof option.fragment !== 'undefined')
		studio.extension.setPref("fragment", option.fragment);
		
	
	// Non-jslint settings
	if (typeof option.wkd_showResultDlg !== 'undefined')
		studio.extension.setPref("wkd_showResultDlg", option.wkd_showResultDlg);

}

actions.doSettingsCallBack = function doSettingsCallBack(message) {
	if (typeof studio.extension.storage.returnValue !== 'undefined') {
		studio.extension.deletePrefFile();
		writeOptToPref(studio.extension.storage.returnValue);
	}
}

actions.doSettings = function doSettings(message) {
	var isPrefExist = studio.extension.isPrefFileExisting();

	var factorySettings = {
		indent: 4,
		maxerr: 50,
		predefString: 'studio,action,guidedModel,WAF,BinaryStream,EndPoint,JSONToXml,Module,Mutex,ProgressIndicator,RestDirectoryAccess,SyncEvent,SystemWorker,TextStream,XmlToJSON,_syntaxTester,addHttpRequestHandler,administrator,application,close,compactDataStore,createDataStore,dataService,currentSession,currentUser,dateToIso,db,directory,displayNotification,ds,exitWait,fileService,garbageCollect,generateUUID,getDataStore,getFolder,getItemsWithRole,getProgressIndicator,getSettingFile,getURLPath,getURLQuery,getWalibFolder,guidedModel,httpServer,include,internal,isoToDate,jscprint,loadImage,loadText,loginByKey,loginByPassword,logout,methods,oldSessionStorage,open4DBase,openDataStore,os,pattern,process,removeHttpRequestHandler,repairDataStore,requireNative,rpcService,saveText,setCurrentUser,settings,solution,storage,trace,verifyDataStore,wait,webAppService,permissions,requestFileSystem,resolveLocalFileSystemURL,requestFileSystemSync,resolveLocalFileSystemSyncURL,RestImpExpAccess,rpcCatalog'
	};
	var option;
	if (isPrefExist) {
		option = getOptFromPref();
	} else {
		option = factorySettings;
	}
	
	var arguments = {
		'option': option,
		'factorySettings': factorySettings
	};
	
	studio.extension.showModalDialog("setOptionDialog.html", arguments, {title:"JSLint Settings", dialogwidth:800, dialogheight:560, resizable:false }, 'doSettingsCallBack');
};

actions.doAbout = function doAbout(message) {
	var
		option;
		
	studio.extension.showModalDialog("about.html", option, {title:"About JSLint", dialogwidth:470, dialogheight:490, resizable:false});
};

//point d'entree unique de l'extension 
exports.handleMessage = function handleMessage(message) {
	var
		actionName;
	
	actionName = message.action;
	
	if (!actions.hasOwnProperty(actionName)) {
		studio.alert("I don't know about this message: " + actionName);
		return false;
	}
	
	actions[actionName](message);
};
