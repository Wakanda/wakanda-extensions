/* jsmin.js - 2006-08-31
Author: Franck Marcia
This work is an adaptation of jsminc.c published by Douglas Crockford.
Permission is hereby granted to use the Javascript version under the same
conditions as the jsmin.c on which it is based.

jsmin.c
2006-05-04

Copyright (c) 2002 Douglas Crockford  (www.crockford.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Update:
  add level:
    1: minimal, keep linefeeds if single
    2: normal, the standard algorithm
    3: agressive, remove any linefeed and doesn't take care of potential
       missing semicolons (can be regressive)

Fixed by aimingoo:
  2006.12.06 - some fix, mount to qomo's builder.

Build Command Line:
  jsmin <fulljsmin.js >..\jsmin.js "(c)2002 Douglas Crockford" "fixed for Qomo project by aimingoo."

*/

function jsmin(input, level, callback, sleep) {
  var a = b = '', theLookahead = EOF = -1;
  var  LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var  DIGITS = '0123456789', ALNUM = LETTERS + DIGITS + '_$\\';

  var cb = callback;
  var slp = sleep ? sleep : 50;
  var kbStep = 10;

  /* isAlphanum -- return true if the character is a letter, digit, underscore,
      dollar sign, or non-ASCII character.
  */

  function isAlphanum(c) {
    return c != EOF && (ALNUM.indexOf(c) > -1 || c.charCodeAt(0) > 126);
  }


  /* get -- return the next character. Watch out for lookahead. If the
      character is a control character, translate it to a space or
      linefeed.
  */
  var get_i = 0;
  var get_l = input.length;
  var max_i = kbStep*1024;
  function get() {
    var c = theLookahead;
    if (get_i == get_l) return EOF;

    theLookahead = EOF;
    if (c == EOF) {
      c = input.charAt(get_i);
      ++get_i;
    }

    if (c >= ' ' || c == '\n') return c;
    if (c == '\r') return '\n';
    return ' ';
  }


  /* peek -- get the next character without getting it.
  */
  function peek() {
    return theLookahead = get();
  }

  /* next -- get the next character, excluding comments. peek() is used to see
      if a '/' is followed by a '/' or '*'.
  */
  function next() {
    var c = get();
    if (c == '/') {
      switch (peek()) {
      case '/':
        while (true)
          if ((c = get()) <= '\n') return c;
      case '*':
        get();
        while (true) {
          switch (get()) {
          case '*':
            if (peek() == '/') return get(), ' ';
            break;
          case EOF:
            throw 'Error: Unterminated comment.';
          }
        }
      default:
        return c;
      }
    }
    return c;
  }


  /* action -- do something! What you do is determined by the argument:
      1   Output A. Copy B to A. Get the next B.
      2   Copy B to A. Get the next B. (Delete A).
      3   Get the next B. (Delete B).
     action treats a string as a single character. Wow!
     action recognizes a regular expression if it is preceded by ( or , or =.
  */

  function action(d) {
    var r = [];
    if (d == 1) r.push(a);

    if (d < 3) {
      a = b;
      if (a == '\'' || a == '"') {
        while (true) {
          r.push(a);
          a = get();
          if (a == b) break;
          if (a <= '\n') {
            throw 'Error: unterminated string literal: ' + a;
          }
          if (a == '\\') {
            r.push(a);
            a = get();
          }
        }
      }
    }

    b = next();
    if (b == '/' && '(,=:[!&|'.indexOf(a) > -1) {
      r.push(a);
      r.push(b);
      while (true) {
        a = get();
        if (a == '/') break;
        if (a =='\\') {
          r.push(a);
          a = get();
        }
        else if (a <= '\n') {
          throw 'Error: unterminated Regular Expression literal';
        }
        r.push(a);
      }
      b = next();
    }

    return r.join('');
  }


  /* m -- Copy the input to the output, deleting the characters which are
      insignificant to JavaScript. Comments will be removed. Tabs will be
      replaced with spaces. Carriage returns will be replaced with
      linefeeds.
      Most spaces and linefeeds will be removed.
  */

  var result = [];
  function m() {
    while (a != EOF) {
      if (cb && (get_i>=max_i)) { // fake sleep...
        max_i = (parseInt(max_i/1024) + kbStep)*1024;
        setTimeout(m, slp);
        return;
      }

      if (a == ' ') {
        result.push(action(
          isAlphanum(b) ? 1 : 2
        ));
      }
      else if (a == '\n') {
        result.push(action(
          ('{[(+-'.indexOf(b) > -1) ? 1 :
          (b==' ') ? 3 :
          (isAlphanum(b) || (level == 1 && b != '\n')) ? 1 :
          2
        ));
      }
      else {
        if (b == ' ') {
          result.push(action(
            isAlphanum(a) ? 1 : 3
          ));
        }
        else if (b == '\n') {
          result.push(action(
            (level == 1 && a != '\n') ? 1 :
            ('}])+-"\''.indexOf(a) > -1) ? (level == 3 ? 3 : 1) :
            isAlphanum(a) ? 1 :
            3
          ));
        }
        else
          result.push(action(1));
      }
    }

    if (cb) {
      cb(result.join(''));
    }
    else {
      return result.join('');
    }
  }

  var ret = m(input);
  return ret;
}