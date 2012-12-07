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
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/



include("jsbeautifier.org/beautify.js");
include("jsbeautifier.org/beautify-html.js");
include("jsbeautifier.org/unpackers/javascriptobfuscator_unpacker.js");
include("jsbeautifier.org/unpackers/urlencode_unpacker.js");
include("jsbeautifier.org/unpackers/p_a_c_k_e_r_unpacker.js");
include("jsbeautifier.org/unpackers/myobfuscate_unpacker.js");

var
	actions;
var 
	DefaultOption;

actions = {};

DefaultOption = {
	indent_size:4, 
	indent_char:' ', 
	brace_style:"end-expand", 
	space_before_conditional:true, 
	preserve_newlines:true,
	keep_array_indentation:false,
	indent_scripts:"normal"
};


function getOptFromPref(option) {
	var
		indentSize;
	var
		indentChar;
	var
		braceStyle;
	var
		spaceBeforeConditional;
	var
		preserveNewlines;
	var
		keepArrayIndentation;
	var
		indentScripts;
	var
		re;

	indentSize = studio.extension.getPref("indent_size");
	if (indentSize === "")
		return option;
	re = new RegExp("[0-9]+");
	if (!indentSize.match(re))
		return option;
		
	indentChar = studio.extension.getPref("indent_char");
	if (indentChar === "")
		return option;

	braceStyle = studio.extension.getPref("brace_style");
	if (braceStyle === "")
		return option;
		
	indentScripts = studio.extension.getPref("indent_scripts");
	if (indentScripts === "")
		return option;
		
	spaceBeforeConditional = studio.extension.getPref("space_before_conditional");
	if (spaceBeforeConditional === "" ||  (spaceBeforeConditional !== "true" && spaceBeforeConditional !== "false"))
		return option;

	preserveNewlines = studio.extension.getPref("preserve_newlines");
	if (preserveNewlines === "" ||  (preserveNewlines !== "true" && preserveNewlines !== "false"))
		return option;
		
	keepArrayIndentation = studio.extension.getPref("keep_array_indentation");
	if (keepArrayIndentation === "" ||  (keepArrayIndentation !== "true" && keepArrayIndentation !== "false"))
		return option;
		
	option.indent_size = parseInt(indentSize, 10);
	option.indent_char = indentChar==='&tab;'?'	':' ';
	option.brace_style = braceStyle;
	option.space_before_conditional = spaceBeforeConditional === 'true'?true:false;
	option.preserve_newlines = preserveNewlines === 'true'?true:false;
	option.keep_array_indentation = keepArrayIndentation === 'true'?true:false;
	option.indent_scripts = indentScripts;
	
	return option;
}

function unpacker_filter(source) {
    var trailing_comments = '';
    var comment = '';
    var found = false;

    do {
        found = false;
        if (/^\s*\/\*/.test(source)) {
            found = true;
            comment = source.substr(0, source.indexOf('*/') + 2);
            source = source.substr(comment.length).replace(/^\s+/, '');
            trailing_comments += comment + "\n";
        } else if (/^\s*\/\//.test(source)) {
            found = true;
            comment = source.match(/^\s*\/\/.*/)[0];
            source = source.substr(comment.length).replace(/^\s+/, '');
            trailing_comments += comment + "\n";
        }
    } while (found);

    if (P_A_C_K_E_R.detect(source)) {
        source = unpacker_filter(P_A_C_K_E_R.unpack(source));
    }
    if (Urlencoded.detect(source)) {
        source = unpacker_filter(Urlencoded.unpack(source));
    }
    if (JavascriptObfuscator.detect(source)) {
        source = unpacker_filter(JavascriptObfuscator.unpack(source));
    }
    if (MyObfuscate.detect(source)) {
        source = unpacker_filter(MyObfuscate.unpack(source));
    }

    return trailing_comments + source;
}

actions.beautify = function beautify(message) {
	var
		content;
	var
		result;
	var
		option;
	var
		comment_mark;

	comment_mark = '<-' + '-';
	
	// default value
	option = DefaultOption;
	
	option = getOptFromPref(option);
	content = studio.currentEditor.getSelectedText();
	
	if (content === '') {
		studio.sendCommand('SelectAll');
		content = studio.currentEditor.getSelectedText();
	}
	
	if (content && content[0] === '<' && content.substring(0, 4) !== comment_mark) {
		result = style_html(content, option);
	}
	else {
		result = js_beautify(unpacker_filter(content), option);
	}
	studio.currentEditor.insertText(result);
};

actions.writeOptions = function writeOptions(message) {
	var newOption = studio.extension.storage.returnValue;
	
	if (newOption)
	{
		if (newOption.indent_size == 1) {
			newOption.indent_char = '&tab;';
		}
		else {
			newOption.indent_char = ' ';
		}
		studio.extension.setPref("indent_size", newOption.indent_size);
		studio.extension.setPref("indent_char", newOption.indent_char);
		studio.extension.setPref("brace_style", newOption.brace_style);
		studio.extension.setPref("preserve_newlines", newOption.preserve_newlines);
		studio.extension.setPref("space_before_conditional", newOption.space_before_conditional);
		studio.extension.setPref("keep_array_indentation", newOption.keep_array_indentation);
		studio.extension.setPref("indent_scripts", newOption.indent_scripts);
	}
}

actions.settings = function settings(message) {
	var
		option;

	option = DefaultOption;
	option = getOptFromPref(option);
	studio.extension.showModalDialog("setOptionDialog.html", option, {title:"Beautifier Settings", dialogwidth:470, dialogheight:380, resizable:false}, 'writeOptions');
};

actions.doAbout = function doAbout(message) {
	var
		option;
		
	studio.extension.showModalDialog("about.html", option, {title:"About Beautifier", dialogwidth:470, dialogheight:380, resizable:false});
};

//point d'entree unique de l'extension 
exports.handleMessage = function handleMessage(message) {
	var 
		actionName;
	
	actionName = message.action;
	if (!actions.hasOwnProperty(actionName)/* || (typeof actionName !== 'function')*/) {
		//console.warn('action does not exist:', actionName, 'message:', message);
		studio.alert("I don't know about this message: " + actionName);
		return false;
	}
	actions[actionName](message);
}
