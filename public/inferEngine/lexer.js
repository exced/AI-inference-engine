function* lexer(text) {
    var tokenRegexp = /[A-Za-z0-9_]+|:\-|[()\.,]/g;
    var match;
    while ((match = tokenRegexp.exec(text)) !== null) {
        yield match[0];
    }
}
